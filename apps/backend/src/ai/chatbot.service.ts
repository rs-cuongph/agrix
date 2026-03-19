import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnowledgeService } from './knowledge.service';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  answer: string;
  sources: { documentId: string; chunkIndex: number; snippet: string }[];
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly apiKey: string;

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
  }

  /**
   * Answer a question using RAG: retrieve relevant chunks, build context, call LLM.
   */
  async ask(question: string, productContext?: string): Promise<ChatResponse> {
    // Search for relevant knowledge chunks
    const chunks = await this.knowledgeService.searchRelevantChunks(question, 5);

    // Build context from chunks
    const contextParts: string[] = [];
    const sources: ChatResponse['sources'] = [];

    for (const chunk of chunks) {
      contextParts.push(chunk.content);
      sources.push({
        documentId: chunk.documentId,
        chunkIndex: chunk.chunkIndex,
        snippet: chunk.content.substring(0, 150) + '...',
      });
    }

    // Add product context if available
    if (productContext) {
      contextParts.unshift(`Thông tin sản phẩm liên quan:\n${productContext}`);
    }

    const context = contextParts.join('\n\n---\n\n');

    // Build messages for LLM
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `Bạn là chuyên gia nông nghiệp của Agrix. Trả lời câu hỏi dựa trên tài liệu cung cấp. 
Nếu không tìm thấy thông tin liên quan, hãy nói rõ ràng và gợi ý nguồn tham khảo.
Trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu.

Tài liệu tham khảo:
${context || 'Không có tài liệu nào được tải lên.'}`,
      },
      { role: 'user', content: question },
    ];

    // Call OpenAI API (or return a fallback)
    if (!this.apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured — returning placeholder response');
      return {
        answer: `[AI Demo] Câu hỏi của bạn: "${question}"\n\nHiện tại chưa cấu hình API key cho AI. Vui lòng cấu hình OPENAI_API_KEY trong .env để kích hoạt tính năng này.\n\nĐã tìm thấy ${chunks.length} đoạn tài liệu liên quan.`,
        sources,
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          max_tokens: 1024,
          temperature: 0.3,
        }),
      });

      const data = await response.json() as any;
      const answer = data.choices?.[0]?.message?.content || 'Không thể xử lý câu hỏi.';

      return { answer, sources };
    } catch (error: any) {
      this.logger.error(`AI call failed: ${error.message}`);
      return {
        answer: `Lỗi khi gọi AI: ${error.message}. Vui lòng thử lại sau.`,
        sources,
      };
    }
  }
}
