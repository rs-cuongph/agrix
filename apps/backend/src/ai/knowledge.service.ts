import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeDocument } from './entities/knowledge-document.entity';
import { KnowledgeEmbedding } from './entities/knowledge-embedding.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @InjectRepository(KnowledgeDocument)
    private readonly documentRepo: Repository<KnowledgeDocument>,
    @InjectRepository(KnowledgeEmbedding)
    private readonly embeddingRepo: Repository<KnowledgeEmbedding>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Upload and process a document: chunk the text and generate embeddings.
   */
  async uploadDocument(
    filename: string,
    mimeType: string,
    textContent: string,
    userId: string,
  ): Promise<KnowledgeDocument> {
    // Save document record
    const doc = this.documentRepo.create({
      filename,
      mimeType,
      uploadedBy: userId,
    });
    const saved = await this.documentRepo.save(doc);

    // Chunk the text (simple paragraph-based chunking, ~500 chars)
    const chunks = this.chunkText(textContent, 500);
    this.logger.log(`Document "${filename}" split into ${chunks.length} chunks`);

    // Save embeddings (without actual vector for now — placeholder)
    const embeddings = chunks.map((chunk, index) =>
      this.embeddingRepo.create({
        documentId: saved.id,
        chunkIndex: index,
        content: chunk,
        embedding: [], // TODO: Call OpenAI Embeddings API
      }),
    );
    await this.embeddingRepo.save(embeddings);

    // Update chunk count
    saved.chunkCount = chunks.length;
    await this.documentRepo.save(saved);

    return saved;
  }

  /**
   * Search for relevant chunks using simple text matching.
   * TODO: Replace with vector similarity search when pgvector is configured.
   */
  async searchRelevantChunks(query: string, limit = 5): Promise<KnowledgeEmbedding[]> {
    // Simple keyword search fallback (replace with vector cosine similarity)
    return this.embeddingRepo
      .createQueryBuilder('embedding')
      .where('LOWER(embedding.content) LIKE LOWER(:query)', { query: `%${query}%` })
      .orderBy('embedding.chunkIndex', 'ASC')
      .take(limit)
      .getMany();
  }

  /**
   * List all uploaded documents.
   */
  async listDocuments(): Promise<KnowledgeDocument[]> {
    return this.documentRepo.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Split text into chunks of approximately maxChars characters.
   */
  private chunkText(text: string, maxChars: number): string[] {
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > maxChars && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      currentChunk += paragraph + '\n\n';
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}
