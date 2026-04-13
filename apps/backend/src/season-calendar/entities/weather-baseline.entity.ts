import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { AgriculturalZone } from './agricultural-zone.entity';

@Entity('weather_baselines')
@Unique('uq_weather_baselines_zone_month', ['zoneId', 'month'])
export class WeatherBaseline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'zone_id' })
  zoneId: string;

  @Column({ type: 'smallint' })
  month: number;

  @Column({ name: 'avg_temp_c', type: 'decimal', precision: 4, scale: 1 })
  avgTempC: number;

  @Column({
    name: 'avg_rainfall_mm',
    type: 'decimal',
    precision: 6,
    scale: 1,
  })
  avgRainfallMm: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @ManyToOne(() => AgriculturalZone, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone: AgriculturalZone;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
