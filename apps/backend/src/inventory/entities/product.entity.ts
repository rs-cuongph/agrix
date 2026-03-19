import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductUnitConversion } from './product-unit-conversion.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'base_unit' })
  baseUnit: string;

  @Column({ name: 'base_cost_price', type: 'int' })
  baseCostPrice: number;

  @Column({ name: 'base_sell_price', type: 'int' })
  baseSellPrice: number;

  @Column({ name: 'current_stock_base', type: 'int', default: 0 })
  currentStockBase: number;

  @Column({ name: 'min_stock_threshold', type: 'int', default: 0 })
  minStockThreshold: number;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ name: 'expiration_alert_days', type: 'int', default: 30 })
  expirationAlertDays: number;

  @Column({ name: 'usage_instructions', type: 'text', nullable: true })
  usageInstructions: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'barcode_ean13', unique: true, nullable: true })
  barcodeEan13: string;

  @Column({ name: 'qr_code_internal', unique: true, nullable: true })
  qrCodeInternal: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ProductUnitConversion, (unit) => unit.product, {
    cascade: true,
    eager: true,
  })
  units: ProductUnitConversion[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
