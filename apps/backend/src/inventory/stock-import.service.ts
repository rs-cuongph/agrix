import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StockEntry, StockEntryType } from './entities/stock-entry.entity';
import { Product } from './entities/product.entity';
import { UnitConversionService } from './unit-conversion.service';

export interface StockImportDto {
  productId: string;
  quantity: number;
  unitName: string;
  costPricePerUnit?: number;
  note?: string;
}

export interface StockAdjustDto {
  productId: string;
  quantity: number;
  unitName: string;
  type: 'DAMAGE' | 'RETURN' | 'ADJUSTMENT';
  note?: string;
}

@Injectable()
export class StockImportService {
  constructor(
    @InjectRepository(StockEntry)
    private readonly stockEntryRepo: Repository<StockEntry>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly unitConversionService: UnitConversionService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generate batch number in format YYYYMMDD-SKU-HHMM
   */
  private generateBatchNumber(sku: string): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${y}${m}${d}-${sku}-${hh}${mm}`;
  }

  /**
   * Import stock in any defined unit. Converts to base units for storage.
   * Auto-generates batchNumber (YYYYMMDD-SKU-HHMM), sets remainingQuantity for batch tracking.
   */
  async importStock(dto: StockImportDto, userId: string): Promise<StockEntry> {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product)
      throw new NotFoundException(`Product ${dto.productId} not found`);

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    const baseQty = await this.unitConversionService.toBaseUnits(
      dto.productId,
      dto.quantity,
      dto.unitName,
    );

    const batchNumber = this.generateBatchNumber(product.sku);

    await this.productRepo.increment(
      { id: dto.productId },
      'currentStockBase',
      baseQty,
    );

    const entry = this.stockEntryRepo.create({
      productId: dto.productId,
      quantityBase: baseQty,
      type: StockEntryType.IMPORT,
      costPricePerUnit: dto.costPricePerUnit ?? undefined,
      batchNumber,
      remainingQuantity: baseQty,
      note: dto.note,
      createdBy: userId,
    });

    return this.stockEntryRepo.save(entry);
  }

  /**
   * FIFO deduction: deduct stock from oldest batches first.
   * Creates one StockEntry per batch consumed, each with the batch's costPricePerUnit.
   * Uses transaction + FOR UPDATE row locking for concurrency safety.
   */
  async adjustStock(
    dto: StockAdjustDto,
    userId: string,
  ): Promise<{ entries: StockEntry[]; totalDeducted: number }> {
    const product = await this.productRepo.findOne({
      where: { id: dto.productId },
    });
    if (!product)
      throw new NotFoundException(`Product ${dto.productId} not found`);

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    const baseQty = await this.unitConversionService.toBaseUnits(
      dto.productId,
      dto.quantity,
      dto.unitName,
    );

    const typeMap: Record<string, StockEntryType> = {
      DAMAGE: StockEntryType.DAMAGE,
      RETURN: StockEntryType.RETURN,
      ADJUSTMENT: StockEntryType.ADJUSTMENT,
    };
    const entryType = typeMap[dto.type];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock IMPORT batches with remaining stock (FIFO order)
      const batches = await queryRunner.query(
        `SELECT id, batch_number, cost_price_per_unit, remaining_quantity
         FROM stock_entries
         WHERE product_id = $1 AND type = 'IMPORT' AND remaining_quantity > 0
         ORDER BY created_at ASC
         FOR UPDATE`,
        [dto.productId],
      );

      let remaining = baseQty;
      const entries: StockEntry[] = [];

      for (const batch of batches) {
        if (remaining <= 0) break;

        const deduct = Math.min(batch.remaining_quantity, remaining);
        remaining -= deduct;

        await queryRunner.query(
          `UPDATE stock_entries SET remaining_quantity = remaining_quantity - $1 WHERE id = $2`,
          [deduct, batch.id],
        );

        const entry = queryRunner.manager.create(StockEntry, {
          productId: dto.productId,
          quantityBase: -deduct,
          type: entryType,
          batchNumber: batch.batch_number,
          costPricePerUnit: batch.cost_price_per_unit,
          note: dto.note,
          createdBy: userId,
        });
        const saved = await queryRunner.manager.save(entry);
        entries.push(saved);
      }

      if (remaining > 0) {
        throw new BadRequestException(
          `Không đủ tồn kho. Cần ${baseQty} nhưng chỉ còn ${baseQty - remaining} đơn vị.`,
        );
      }

      await queryRunner.query(
        `UPDATE products SET current_stock_base = current_stock_base - $1 WHERE id = $2`,
        [baseQty, dto.productId],
      );

      await queryRunner.commitTransaction();
      return { entries, totalDeducted: baseQty };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get available batches for a product (IMPORT entries with remainingQuantity > 0).
   */
  async getAvailableBatches(productId: string) {
    return this.stockEntryRepo
      .createQueryBuilder('entry')
      .select([
        'entry.id',
        'entry.batchNumber',
        'entry.quantityBase',
        'entry.remainingQuantity',
        'entry.costPricePerUnit',
        'entry.createdAt',
      ])
      .where('entry.productId = :productId', { productId })
      .andWhere('entry.type = :type', { type: StockEntryType.IMPORT })
      .andWhere('entry.remainingQuantity > 0')
      .orderBy('entry.createdAt', 'ASC')
      .getMany();
  }

  /**
   * Get paginated stock movement history with optional filters.
   */
  async getStockHistory(
    productId?: string,
    type?: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: StockEntry[];
    meta: { total: number; page: number; limit: number };
  }> {
    const qb = this.stockEntryRepo
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.product', 'product')
      .leftJoinAndSelect('entry.creator', 'creator')
      .orderBy('entry.createdAt', 'DESC');

    if (productId) {
      qb.andWhere('entry.productId = :productId', { productId });
    }
    if (type) {
      qb.andWhere('entry.type = :type', { type });
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    data.forEach((e) => {
      if (e.creator) {
        delete (e.creator as any).passwordHash;
      }
    });

    return { data, meta: { total, page, limit } };
  }

  /**
   * Get low-stock alerts: products below their minStockThreshold.
   */
  async getLowStockAlerts(): Promise<Product[]> {
    return this.productRepo
      .createQueryBuilder('product')
      .where('product.currentStockBase <= product.minStockThreshold')
      .andWhere('product.isActive = :active', { active: true })
      .orderBy('product.currentStockBase', 'ASC')
      .getMany();
  }

  /**
   * Get products expiring within the given number of days.
   */
  async getExpiringProducts(days: number = 30): Promise<Product[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return this.productRepo
      .createQueryBuilder('product')
      .where('product.expirationDate IS NOT NULL')
      .andWhere('product.expirationDate <= :cutoff', {
        cutoff: cutoff.toISOString().split('T')[0],
      })
      .andWhere('product.isActive = :active', { active: true })
      .orderBy('product.expirationDate', 'ASC')
      .getMany();
  }

  /**
   * Get slow-moving products: no sales in X days AND stock > minStock.
   */
  async getSlowMovingProducts(
    days: number = 30,
    minStock: number = 10,
  ): Promise<Product[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.productRepo
      .createQueryBuilder('product')
      .leftJoin(
        (qb) =>
          qb
            .select('se.product_id', 'product_id')
            .addSelect('MAX(se.created_at)', 'last_sale')
            .from('stock_entries', 'se')
            .where("se.type = 'SALE'")
            .groupBy('se.product_id'),
        'sales',
        'sales.product_id = product.id',
      )
      .where('product.isActive = :active', { active: true })
      .andWhere('product.currentStockBase > :minStock', { minStock })
      .andWhere('(sales.last_sale IS NULL OR sales.last_sale < :cutoff)', {
        cutoff: cutoff.toISOString(),
      })
      .orderBy('product.currentStockBase', 'DESC')
      .getMany();
  }
}
