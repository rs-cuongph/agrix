import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from '../../auth/entities/user.entity';

export enum StockEntryType {
  IMPORT = 'IMPORT',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  SYNC = 'SYNC',
}

@Entity('stock_entries')
export class StockEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'quantity_base', type: 'int' })
  quantityBase: number;

  @Column({ type: 'enum', enum: StockEntryType })
  type: StockEntryType;

  @Column({ name: 'batch_number', nullable: true })
  batchNumber: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
