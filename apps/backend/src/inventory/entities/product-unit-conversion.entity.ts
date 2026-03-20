import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_unit_conversions')
export class ProductUnitConversion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.units, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'unit_name' })
  unitName: string;

  @Column({ name: 'conversion_factor', type: 'int' })
  conversionFactor: number;

  @Column({ name: 'sell_price', type: 'int', nullable: true })
  sellPrice: number | null;
}
