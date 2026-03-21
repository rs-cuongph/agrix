import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatbotConfig } from './entities/chatbot-config.entity';

@Injectable()
export class ChatConfigService {
  private readonly logger = new Logger(ChatConfigService.name);

  constructor(
    @InjectRepository(ChatbotConfig)
    private readonly configRepo: Repository<ChatbotConfig>,
  ) {}

  /**
   * Get the singleton config, creating default if none exists.
   */
  async getConfig(): Promise<ChatbotConfig> {
    let config = await this.configRepo.findOne({ where: {} });
    if (!config) {
      config = this.configRepo.create({});
      config = await this.configRepo.save(config);
      this.logger.log('Created default chatbot config');
    }
    return config;
  }

  /**
   * Get config for admin view (masks API keys).
   */
  async getConfigForAdmin() {
    const config = await this.getConfig();
    return {
      systemPrompt: config.systemPrompt,
      primaryProvider: config.primaryProvider,
      hasPrimaryKey: !!config.primaryApiKey,
      secondaryProvider: config.secondaryProvider,
      hasSecondaryKey: !!config.secondaryApiKey,
      enabled: config.enabled,
      maxMessagesPerSession: config.maxMessagesPerSession,
    };
  }

  /**
   * Update config.
   */
  async updateConfig(updates: Partial<ChatbotConfig>): Promise<ChatbotConfig> {
    const config = await this.getConfig();

    if (updates.systemPrompt !== undefined) config.systemPrompt = updates.systemPrompt;
    if (updates.primaryProvider !== undefined) config.primaryProvider = updates.primaryProvider;
    if (updates.primaryApiKey !== undefined) config.primaryApiKey = updates.primaryApiKey;
    if (updates.secondaryProvider !== undefined) config.secondaryProvider = updates.secondaryProvider;
    if (updates.secondaryApiKey !== undefined) config.secondaryApiKey = updates.secondaryApiKey;
    if (updates.enabled !== undefined) config.enabled = updates.enabled;
    if (updates.maxMessagesPerSession !== undefined) config.maxMessagesPerSession = updates.maxMessagesPerSession;

    const saved = await this.configRepo.save(config);
    this.logger.log('Updated chatbot config');
    return saved;
  }

  /**
   * Validate an API key by making a test call.
   */
  async validateApiKey(provider: string, apiKey: string): Promise<{ valid: boolean; error?: string }> {
    try {
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!response.ok) return { valid: false, error: `OpenAI: ${response.status} ${response.statusText}` };
        return { valid: true };
      } else if (provider === 'gemini') {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        await model.generateContent('test');
        return { valid: true };
      }
      return { valid: false, error: 'Unknown provider' };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }
}
