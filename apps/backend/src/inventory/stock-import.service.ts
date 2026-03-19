import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockEntry, StockEntryType } from './entities/stock-entry.entity';
import { Product } from './entities/product.entity';
import { UnitConversionService } from './unit-conversion.service';

export interface StockImportDto {
  productId: string;
  quantity: number;
  unitName: string;
  batchNumber?: string;
}

@Injectable()
export class StockImportService {
  constructor(
    @InjectRepository(StockEntry)
    private readonly stockEntryRepo: Repository<StockEntry>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly unitConversionService: UnitConversionService,
  ) {}

  /**
   * Import stock in any defined unit. Converts to base units for storage.
   * E.g., Import 10 Thùng → stored as +400 Chai in base stock.
   */
  async importStock(dto: StockImportDto, userId: string): Promise<StockEntry> {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Product ${dto.productId} not found`);

    if (dto.quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    // Convert to base units
    const baseQty = await this.unitConversionService.toBaseUnits(
      dto.productId,
      dto.quantity,
      dto.unitName,
    );

    // Increment stock
    await this.productRepo.increment({ id: dto.productId }, 'currentStockBase', baseQty);

    // Create ledger entry
    const entry = this.stockEntryRepo.create({
      productId: dto.productId,
      quantityBase: baseQty,
      type: StockEntryType.IMPORT,
      batchNumber: dto.batchNumber,
      createdBy: userId,
    });

    return this.stockEntryRepo.save(entry);
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
      .andWhere('product.expirationDate <= :cutoff', { cutoff: cutoff.toISOString().split('T')[0] })
      .andWhere('product.isActive = :active', { active: true })
      .orderBy('product.expirationDate', 'ASC')
      .getMany();
  }
}
