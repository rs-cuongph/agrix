import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Product } from '../../inventory/entities/product.entity';
import { PestWarning } from './pest-warning.entity';

@Entity('pest_warning_products')
export class PestWarningProduct {
  @PrimaryColumn({ name: 'pest_warning_id', type: 'uuid' })
  pestWarningId: string;

  @PrimaryColumn({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'usage_note', type: 'text', nullable: true })
  usageNote: string | null;

  @ManyToOne(() => PestWarning, (pestWarning) => pestWarning.treatmentLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pest_warning_id' })
  pestWarning: PestWarning;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
