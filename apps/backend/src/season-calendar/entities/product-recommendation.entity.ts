import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../inventory/entities/product.entity';
import { GrowthStage } from './growth-stage.entity';

@Entity('product_recommendations')
@Unique('uq_product_recommendations_stage_product', [
  'growthStageId',
  'productId',
])
@Check(`"priority" >= 1 AND "priority" <= 5`)
export class ProductRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'growth_stage_id' })
  growthStageId: string;

  @Column({ name: 'product_id' })
  productId: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'smallint', default: 1 })
  priority: number;

  @Column({ name: 'dosage_note', type: 'text', nullable: true })
  dosageNote: string | null;

  @ManyToOne(() => GrowthStage, (growthStage) => growthStage.recommendations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'growth_stage_id' })
  growthStage: GrowthStage;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
