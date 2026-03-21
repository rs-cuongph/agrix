import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { KnowledgeDocument, DocumentStatus } from './entities/knowledge-document.entity';
import { KnowledgeEmbedding } from './entities/knowledge-embedding.entity';
import { ChatConfigService } from './chat-config.service';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @InjectRepository(KnowledgeDocument)
    private readonly documentRepo: Repository<KnowledgeDocument>,
    @InjectRepository(KnowledgeEmbedding)
    private readonly embeddingRepo: Repository<KnowledgeEmbedding>,
    private readonly configService: ChatConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Upload and process a document: extract text, chunk, and generate embeddings.
   */
  async uploadDocument(
    filename: string,
    mimeType: string,
    fileBuffer: Buffer,
    userId: string,
    fileSize: number,
  ): Promise<KnowledgeDocument> {
    // Save document record with PROCESSING status
    const doc = this.documentRepo.create({
      filename,
      mimeType,
      fileSize,
      uploadedBy: userId,
      status: DocumentStatus.PROCESSING,
    });
    const saved = await this.documentRepo.save(doc);

    // Process async (don't block the upload response)
    this.processDocument(saved.id, mimeType, fileBuffer).catch((err) => {
      this.logger.error(`Failed to process document ${saved.id}: ${err.message}`);
    });

    return saved;
  }

  /**
   * Process document: extract text, chunk, embed.
   */
  private async processDocument(documentId: string, mimeType: string, fileBuffer: Buffer): Promise<void> {
    try {
      // Extract text based on mime type
      let textContent: string;

      if (mimeType === 'application/pdf') {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(fileBuffer);
        textContent = pdfData.text;
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        textContent = result.value;
      } else {
        textContent = fileBuffer.toString('utf-8');
      }

      if (!textContent || textContent.trim().length === 0) {
        await this.documentRepo.update(documentId, {
          status: DocumentStatus.ERROR,
          statusMessage: 'Không thể trích xuất nội dung từ file.',
        });
        return;
      }

      // Chunk the text
      const chunks = this.chunkText(textContent, 500);
      this.logger.log(`Document "${documentId}" split into ${chunks.length} chunks`);

      // Generate embeddings and save chunks
      for (let i = 0; i < chunks.length; i++) {
        const embeddingVector = await this.generateEmbedding(chunks[i]);

        const embedding = this.embeddingRepo.create({
          documentId,
          chunkIndex: i,
          content: chunks[i],
          embedding: embeddingVector ? `[${embeddingVector.join(',')}]` : undefined,
        });
        await this.embeddingRepo.save(embedding);
      }

      // Update document status
      await this.documentRepo.update(documentId, {
        status: DocumentStatus.READY,
        chunkCount: chunks.length,
      });

      this.logger.log(`Document "${documentId}" processed successfully`);
    } catch (error: any) {
      this.logger.error(`Error processing document ${documentId}: ${error.message}`);
      await this.documentRepo.update(documentId, {
        status: DocumentStatus.ERROR,
        statusMessage: error.message,
      });
    }
  }

  /**
   * Generate embedding vector using the configured AI provider.
   */
  private async generateEmbedding(text: string): Promise<number[] | null> {
    const config = await this.configService.getConfig();

    // Try OpenAI embeddings
    if (config.primaryApiKey && config.primaryProvider === 'openai') {
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.primaryApiKey}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: text.substring(0, 8000), // Limit input length
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          return data.data?.[0]?.embedding || null;
        }
      } catch (error: any) {
        this.logger.warn(`OpenAI embedding failed: ${error.message}`);
      }
    }

    // Fallback: no embedding (will use keyword search)
    return null;
  }

  /**
   * Search for relevant chunks using pgvector cosine similarity or keyword fallback.
   */
  async searchRelevantChunks(query: string, limit = 5): Promise<KnowledgeEmbedding[]> {
    // Try vector search first
    const config = await this.configService.getConfig();
    if (config.primaryApiKey) {
      const queryEmbedding = await this.generateEmbedding(query);
      if (queryEmbedding) {
        try {
          // Use raw SQL for pgvector cosine similarity search
          const vectorStr = `[${queryEmbedding.join(',')}]`;
          const results = await this.dataSource.query(
            `SELECT id, document_id as "documentId", chunk_index as "chunkIndex", content, 
             embedding <=> $1::vector as distance
             FROM knowledge_embeddings 
             WHERE embedding IS NOT NULL
             ORDER BY embedding <=> $1::vector
             LIMIT $2`,
            [vectorStr, limit],
          );
          return results;
        } catch (error: any) {
          this.logger.warn(`Vector search failed, falling back to keyword: ${error.message}`);
        }
      }
    }

    // Fallback: simple keyword search
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
   * Delete a document and its embeddings.
   */
  async deleteDocument(id: string): Promise<void> {
    const doc = await this.documentRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Tài liệu không tồn tại');

    // Delete embeddings (cascade should handle this, but explicit for safety)
    await this.embeddingRepo.delete({ documentId: id });
    await this.documentRepo.delete(id);

    this.logger.log(`Deleted document "${doc.filename}" (${id})`);
  }

  /**
   * Sync all products into RAG knowledge base.
   */
  async syncProducts(): Promise<{ message: string; productCount: number; chunkCount: number }> {
    // Find or create a special "products" document
    let productDoc = await this.documentRepo.findOne({ where: { filename: '__products_sync__' } });
    if (productDoc) {
      // Delete old embeddings
      await this.embeddingRepo.delete({ documentId: productDoc.id });
    } else {
      productDoc = this.documentRepo.create({
        filename: '__products_sync__',
        mimeType: 'text/plain',
        uploadedBy: 'system',
        status: DocumentStatus.PROCESSING,
      });
      productDoc = await this.documentRepo.save(productDoc);
    }

    // Fetch all products from database (JOIN categories to get category name)
    const products = await this.dataSource.query(
      `SELECT p.id, p.name, p.description, p.sku, p.base_sell_price, p.base_unit,
              c.name AS category
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id`,
    );

    let chunkCount = 0;
    for (const product of products) {
      const text = [
        `Sản phẩm: ${product.name}`,
        product.sku ? `Mã SP: ${product.sku}` : '',
        product.category ? `Danh mục: ${product.category}` : '',
        product.base_sell_price ? `Giá bán: ${product.base_sell_price}` : '',
        product.base_unit ? `Đơn vị: ${product.base_unit}` : '',
        product.description ? `Mô tả: ${product.description}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const embedding = this.embeddingRepo.create({
        documentId: productDoc.id,
        chunkIndex: chunkCount,
        content: text,
        embedding: undefined,
      });
      await this.embeddingRepo.save(embedding);
      chunkCount++;
    }

    // Update document
    await this.documentRepo.update(productDoc.id, {
      status: DocumentStatus.READY,
      chunkCount,
    });

    this.logger.log(`Synced ${products.length} products (${chunkCount} chunks)`);

    return {
      message: 'Đồng bộ thành công',
      productCount: products.length,
      chunkCount,
    };
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
