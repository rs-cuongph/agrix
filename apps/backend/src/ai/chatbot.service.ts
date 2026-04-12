import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnowledgeService } from './knowledge.service';
import { ChatConfigService } from './chat-config.service';

export interface ChatResponse {
  answer: string;
  sources: { documentId: string; chunkIndex: number; snippet: string }[];
}

interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly configService: ChatConfigService,
    private readonly nestConfigService: ConfigService,
  ) {}

  /**
   * Answer a question using RAG: retrieve relevant chunks, build context, call LLM with fallback.
   */
  async ask(question: string, productContext?: string): Promise<ChatResponse> {
    const config = await this.configService.getConfig();

    // Search for relevant knowledge chunks
    const chunks = await this.knowledgeService.searchRelevantChunks(
      question,
      5,
    );

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
    const systemPrompt =
      config.systemPrompt || 'Bạn là chuyên gia nông nghiệp của Agrix.';
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `${systemPrompt}\n\nTài liệu tham khảo:\n${context || 'Không có tài liệu nào được tải lên.'}`,
      },
      { role: 'user', content: question },
    ];

    // Try primary provider, then fallback
    const answer = await this.callWithFallback(messages, config);

    return { answer, sources };
  }

  /**
   * Stream answer using SSE — returns async generator of tokens.
   */
  async *streamAnswer(
    question: string,
    productContext?: string,
  ): AsyncGenerator<{ type: 'token' | 'done'; data: string }> {
    const config = await this.configService.getConfig();

    const chunks = await this.knowledgeService.searchRelevantChunks(
      question,
      5,
    );
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

    if (productContext) {
      contextParts.unshift(`Thông tin sản phẩm liên quan:\n${productContext}`);
    }

    const context = contextParts.join('\n\n---\n\n');
    const systemPrompt =
      config.systemPrompt || 'Bạn là chuyên gia nông nghiệp của Agrix.';

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `${systemPrompt}\n\nTài liệu tham khảo:\n${context || 'Không có tài liệu nào được tải lên.'}`,
      },
      { role: 'user', content: question },
    ];

    // Try streaming with primary, fallback to non-streaming if needed
    const providers = this.getProviderOrder(config);

    for (const { provider, apiKey } of providers) {
      if (!apiKey) continue;
      try {
        if (provider === 'openai') {
          yield* this.streamOpenAI(messages, apiKey);
        } else {
          yield* this.streamGemini(messages, apiKey);
        }
        yield { type: 'done', data: JSON.stringify({ sources }) };
        return;
      } catch (error: any) {
        this.logger.warn(
          `Streaming with ${provider} failed: ${error.message}, trying next...`,
        );
      }
    }

    // All providers failed
    yield {
      type: 'token',
      data: 'Lỗi: Không thể kết nối AI. Vui lòng liên hệ cửa hàng.',
    };
    yield { type: 'done', data: JSON.stringify({ sources: [] }) };
  }

  private async callWithFallback(
    messages: LLMMessage[],
    config: any,
  ): Promise<string> {
    const providers = this.getProviderOrder(config);

    for (const { provider, apiKey } of providers) {
      if (!apiKey) continue;
      try {
        if (provider === 'openai') {
          return await this.callOpenAI(messages, apiKey);
        } else {
          return await this.callGemini(messages, apiKey);
        }
      } catch (error: any) {
        this.logger.warn(`Provider ${provider} failed: ${error.message}`);
      }
    }

    return 'Lỗi: Không thể kết nối AI. Vui lòng thử lại sau hoặc liên hệ cửa hàng.';
  }

  private getProviderOrder(config: any) {
    const providers: { provider: string; apiKey: string }[] = [];
    if (config.primaryProvider && config.primaryApiKey) {
      providers.push({
        provider: config.primaryProvider,
        apiKey: config.primaryApiKey,
      });
    }
    if (config.secondaryProvider && config.secondaryApiKey) {
      providers.push({
        provider: config.secondaryProvider,
        apiKey: config.secondaryApiKey,
      });
    }
    return providers;
  }

  private async callOpenAI(
    messages: LLMMessage[],
    apiKey: string,
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:
          this.nestConfigService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini',
        messages,
        max_tokens: 1024,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Không thể xử lý câu hỏi.';
  }

  private async *streamOpenAI(
    messages: LLMMessage[],
    apiKey: string,
  ): AsyncGenerator<{ type: 'token' | 'done'; data: string }> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:
          this.nestConfigService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini',
        messages,
        max_tokens: 1024,
        temperature: 0.3,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI stream error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const json = JSON.parse(line.slice(6));
            const token = json.choices?.[0]?.delta?.content;
            if (token) {
              yield { type: 'token', data: token };
            }
          } catch {
            // skip invalid JSON lines
          }
        }
      }
    }
  }

  private async callGemini(
    messages: LLMMessage[],
    apiKey: string,
  ): Promise<string> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model:
        this.nestConfigService.get<string>('GEMINI_MODEL') ||
        'gemini-2.0-flash',
    });

    // Convert messages to Gemini format
    const systemInstruction =
      messages.find((m) => m.role === 'system')?.content || '';
    const userMessage = messages.find((m) => m.role === 'user')?.content || '';

    const result = await model.generateContent({
      systemInstruction,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    });

    return result.response.text() || 'Không thể xử lý câu hỏi.';
  }

  private async *streamGemini(
    messages: LLMMessage[],
    apiKey: string,
  ): AsyncGenerator<{ type: 'token' | 'done'; data: string }> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model:
        this.nestConfigService.get<string>('GEMINI_MODEL') ||
        'gemini-2.0-flash',
    });

    const systemInstruction =
      messages.find((m) => m.role === 'system')?.content || '';
    const userMessage = messages.find((m) => m.role === 'user')?.content || '';

    const result = await model.generateContentStream({
      systemInstruction,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield { type: 'token', data: text };
      }
    }
  }
}
