import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { AgriculturalZone } from './agricultural-zone.entity';
import { Crop } from './crop.entity';
import { GrowthStage } from './growth-stage.entity';

@Entity('season_calendars')
@Unique('uq_season_calendars_zone_crop_name_year', [
  'zoneId',
  'cropId',
  'seasonName',
  'year',
])
export class SeasonCalendar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'zone_id' })
  zoneId: string;

  @Column({ name: 'crop_id' })
  cropId: string;

  @Column({ name: 'season_name', length: 100 })
  seasonName: string;

  @Column({ type: 'int', nullable: true })
  year: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => AgriculturalZone, (zone) => zone.seasonCalendars, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'zone_id' })
  zone: AgriculturalZone;

  @ManyToOne(() => Crop, (crop) => crop.seasonCalendars, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'crop_id' })
  crop: Crop;

  @OneToMany(() => GrowthStage, (growthStage) => growthStage.seasonCalendar, {
    cascade: true,
  })
  growthStages: GrowthStage[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
