import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  INVENTORY = 'INVENTORY',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CASHIER })
  role: UserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'pos_pin', type: 'varchar', length: 6, nullable: true })
  posPin: string | null;

  @Column({ name: 'pin_failed_attempts', type: 'int', default: 0 })
  pinFailedAttempts: number;

  @Column({ name: 'pin_locked_until', type: 'timestamp with time zone', nullable: true })
  pinLockedUntil: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
