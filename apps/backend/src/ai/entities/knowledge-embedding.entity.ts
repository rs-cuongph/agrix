import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { KnowledgeDocument } from './knowledge-document.entity';

@Entity('knowledge_embeddings')
export class KnowledgeEmbedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_id' })
  documentId: string;

  @ManyToOne(() => KnowledgeDocument, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: KnowledgeDocument;

  @Column({ name: 'chunk_index', type: 'int' })
  chunkIndex: number;

  @Column({ type: 'text' })
  content: string;

  // pgvector column — requires CREATE EXTENSION vector;
  // Using float array stored as text for compatibility; will be cast to vector for similarity search
  @Column({ type: 'text', nullable: true })
  embedding: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
