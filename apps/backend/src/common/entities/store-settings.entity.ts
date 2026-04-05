import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('store_settings')
export class StoreSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_name', length: 255 })
  storeName: string;

  @Column({ length: 500 })
  address: string;

  @Column({ name: 'phone_number', length: 20 })
  phoneNumber: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'hero_title', length: 255, nullable: true })
  heroTitle: string;

  @Column({ name: 'hero_subtitle', type: 'text', nullable: true })
  heroSubtitle: string;

  @Column({ name: 'hero_image_url', type: 'text', nullable: true })
  heroImageUrl: string;

  // ── Bank / VietQR Config ──────────────────────────────────────────────────
  @Column({ name: 'bank_bin', length: 20, nullable: true })
  bankBin: string;

  @Column({ name: 'bank_account_no', length: 30, nullable: true })
  bankAccountNo: string;

  @Column({ name: 'bank_account_name', length: 100, nullable: true })
  bankAccountName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
