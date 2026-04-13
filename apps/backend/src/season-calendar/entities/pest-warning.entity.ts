import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GrowthStage } from './growth-stage.entity';
import { PestWarningProduct } from './pest-warning-product.entity';

export enum PestWarningSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity('pest_warnings')
export class PestWarning {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'growth_stage_id' })
  growthStageId: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  symptoms: string | null;

  @Column({
    type: 'varchar',
    length: 10,
    default: PestWarningSeverity.MEDIUM,
  })
  severity: PestWarningSeverity;

  @Column({ name: 'prevention_note', type: 'text', nullable: true })
  preventionNote: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ManyToOne(() => GrowthStage, (growthStage) => growthStage.pestWarnings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'growth_stage_id' })
  growthStage: GrowthStage;

  @OneToMany(() => PestWarningProduct, (link) => link.pestWarning, {
    cascade: true,
  })
  treatmentLinks: PestWarningProduct[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
