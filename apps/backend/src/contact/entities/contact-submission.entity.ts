import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ContactStatus {
  NEW = 'NEW',
  READ = 'READ',
  REPLIED = 'REPLIED',
}

@Entity('contact_submissions')
export class ContactSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_name', length: 255 })
  customerName: string;

  @Column({ name: 'phone_number', length: 20 })
  phoneNumber: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ContactStatus,
    default: ContactStatus.NEW,
  })
  status: ContactStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
