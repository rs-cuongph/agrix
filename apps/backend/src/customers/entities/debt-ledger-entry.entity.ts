import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

export enum DebtEntryType {
  SALE = 'SALE', // Debt created from a sale
  PAYMENT = 'PAYMENT', // Debt reduction from payment
  ADJUSTMENT = 'ADJUSTMENT', // Manual adjustment
}

@Entity('debt_ledger_entries')
export class DebtLedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'int' })
  amount: number; // positive = debt increase, negative = payment

  @Column({ type: 'enum', enum: DebtEntryType })
  type: DebtEntryType;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: string; // orderId for SALE type

  @Column({ nullable: true })
  note: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
