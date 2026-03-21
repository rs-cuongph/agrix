import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('testimonials')
export class Testimonial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_name', length: 255 })
  customerName: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 5 })
  rating: number;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
