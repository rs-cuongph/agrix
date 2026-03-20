import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DocumentStatus {
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR',
}

@Entity('knowledge_documents')
export class KnowledgeDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ name: 'file_size', type: 'int', default: 0 })
  fileSize: number;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PROCESSING,
  })
  status: DocumentStatus;

  @Column({ name: 'status_message', nullable: true })
  statusMessage: string;

  @Column({ name: 'chunk_count', default: 0 })
  chunkCount: number;

  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @Column({ name: 'storage_key', nullable: true })
  storageKey: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
