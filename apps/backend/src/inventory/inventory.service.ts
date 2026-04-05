import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './entities/product.entity';
import { StockEntry, StockEntryType } from './entities/stock-entry.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(StockEntry)
    private readonly stockEntryRepo: Repository<StockEntry>,
  ) {}

  async findProducts(search?: string, categoryId?: string, page = 1, limit = 20) {
    const where: any = { isActive: true };
    if (search) {
      where.name = ILike(`%${search}%`);
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    const [data, total] = await this.productRepo.findAndCount({
      where,
      relations: ['category', 'units'],
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });
    return { data, meta: { total, page, limit } };
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'units'],
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async lookupByBarcode(barcode: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { barcodeEan13: barcode, isActive: true },
      relations: ['units'],
    });
    if (!product) throw new NotFoundException(`No product with barcode ${barcode}`);
    return product;
  }

  async lookupByQr(qr: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { qrCodeInternal: qr, isActive: true },
      relations: ['units'],
    });
    if (!product) throw new NotFoundException(`No product with QR ${qr}`);
    return product;
  }

  /**
   * Deduct stock in base units. Creates a SALE ledger entry.
   * Stock CAN go negative during offline mode — reconciled during sync.
   */
  async deductStock(
    productId: string,
    quantityBase: number,
    referenceId: string,
    userId: string,
  ): Promise<void> {
    await this.productRepo.decrement({ id: productId }, 'currentStockBase', quantityBase);

    const entry = this.stockEntryRepo.create({
      productId,
      quantityBase: -quantityBase,
      type: StockEntryType.SALE,
      referenceId,
      createdBy: userId,
    });
    await this.stockEntryRepo.save(entry);
  }

  /**
   * Add stock in base units (e.g. for return/cancellation).
   * Creates a RETURN ledger entry.
   */
  async addStock(
    productId: string,
    quantityBase: number,
    referenceId: string,
    userId: string,
  ): Promise<void> {
    await this.productRepo.increment({ id: productId }, 'currentStockBase', quantityBase);

    const entry = this.stockEntryRepo.create({
      productId,
      quantityBase: quantityBase,
      type: StockEntryType.RETURN,
      referenceId,
      createdBy: userId,
    });
    await this.stockEntryRepo.save(entry);
  }
}
