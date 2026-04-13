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
import { PestWarning } from './pest-warning.entity';
import { ProductRecommendation } from './product-recommendation.entity';
import { SeasonCalendar } from './season-calendar.entity';

export enum GrowthStageType {
  PLANTING = 'planting',
  CARE = 'care',
  HARVEST = 'harvest',
}

@Entity('growth_stages')
export class GrowthStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'season_calendar_id' })
  seasonCalendarId: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    name: 'stage_type',
    type: 'varchar',
    length: 20,
  })
  stageType: GrowthStageType;

  @Column({ name: 'start_month', type: 'smallint' })
  startMonth: number;

  @Column({ name: 'end_month', type: 'smallint' })
  endMonth: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  keywords: string[] | null;

  @Column({ name: 'care_activities', type: 'text', array: true, nullable: true })
  careActivities: string[] | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ManyToOne(
    () => SeasonCalendar,
    (seasonCalendar) => seasonCalendar.growthStages,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'season_calendar_id' })
  seasonCalendar: SeasonCalendar;

  @OneToMany(
    () => ProductRecommendation,
    (recommendation) => recommendation.growthStage,
    { cascade: true },
  )
  recommendations: ProductRecommendation[];

  @OneToMany(() => PestWarning, (pestWarning) => pestWarning.growthStage, {
    cascade: true,
  })
  pestWarnings: PestWarning[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
