import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SeasonCalendar } from './season-calendar.entity';

@Entity('agricultural_zones')
export class AgriculturalZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ unique: true, length: 20 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  provinces: string[] | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => SeasonCalendar, (seasonCalendar) => seasonCalendar.zone)
  seasonCalendars: SeasonCalendar[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
