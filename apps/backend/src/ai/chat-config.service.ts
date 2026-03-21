import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatbotConfig } from './entities/chatbot-config.entity';
import { encrypt, decrypt, isEncrypted } from '../common/crypto.util';

@Injectable()
export class ChatConfigService implements OnModuleInit {
  private readonly logger = new Logger(ChatConfigService.name);

  constructor(
    @InjectRepository(ChatbotConfig)
    private readonly configRepo: Repository<ChatbotConfig>,
  ) {}

  /**
   * On module init, migrate any existing plain text keys to encrypted format.
   */
  async onModuleInit() {
    try {
      const config = await this.configRepo.findOne({ where: {} });
      if (!config) return;

      let needsSave = false;

      if (config.primaryApiKey && !isEncrypted(config.primaryApiKey)) {
        config.primaryApiKey = encrypt(config.primaryApiKey);
        needsSave = true;
        this.logger.log('Migrated primary API key to encrypted format');
      }

      if (config.secondaryApiKey && !isEncrypted(config.secondaryApiKey)) {
        config.secondaryApiKey = encrypt(config.secondaryApiKey);
        needsSave = true;
        this.logger.log('Migrated secondary API key to encrypted format');
      }

      if (needsSave) {
        await this.configRepo.save(config);
        this.logger.log('API key encryption migration complete');
      }
    } catch (error) {
      this.logger.warn('Could not migrate API keys to encrypted format. Set AES_ENCRYPTION_KEY env variable.');
    }
  }

  /**
   * Get the singleton config, creating default if none exists.
   * API keys are returned decrypted for internal use.
   */
  async getConfig(): Promise<ChatbotConfig> {
    let config = await this.configRepo.findOne({ where: {} });
    if (!config) {
      config = this.configRepo.create({});
      config = await this.configRepo.save(config);
      this.logger.log('Created default chatbot config');
    }

    // Decrypt API keys for internal use
    return this.decryptConfig(config);
  }

  /**
   * Get config for admin view (masks API keys).
   */
  async getConfigForAdmin() {
    const config = await this.configRepo.findOne({ where: {} });
    if (!config) {
      const newConfig = this.configRepo.create({});
      await this.configRepo.save(newConfig);
    }
    const c = config || (await this.configRepo.findOne({ where: {} }));

    return {
      systemPrompt: c!.systemPrompt,
      primaryProvider: c!.primaryProvider,
      hasPrimaryKey: !!c!.primaryApiKey,
      secondaryProvider: c!.secondaryProvider,
      hasSecondaryKey: !!c!.secondaryApiKey,
      enabled: c!.enabled,
      maxMessagesPerSession: c!.maxMessagesPerSession,
    };
  }

  /**
   * Update config. API keys are encrypted before saving.
   */
  async updateConfig(updates: Partial<ChatbotConfig>): Promise<ChatbotConfig> {
    const config = await this.configRepo.findOne({ where: {} }) || this.configRepo.create({});

    if (updates.systemPrompt !== undefined) config.systemPrompt = updates.systemPrompt;
    if (updates.primaryProvider !== undefined) config.primaryProvider = updates.primaryProvider;
    if (updates.secondaryProvider !== undefined) config.secondaryProvider = updates.secondaryProvider;
    if (updates.enabled !== undefined) config.enabled = updates.enabled;
    if (updates.maxMessagesPerSession !== undefined) config.maxMessagesPerSession = updates.maxMessagesPerSession;

    // Encrypt API keys before saving
    if (updates.primaryApiKey !== undefined) {
      config.primaryApiKey = updates.primaryApiKey ? encrypt(updates.primaryApiKey) : updates.primaryApiKey;
    }
    if (updates.secondaryApiKey !== undefined) {
      config.secondaryApiKey = updates.secondaryApiKey ? encrypt(updates.secondaryApiKey) : updates.secondaryApiKey;
    }

    const saved = await this.configRepo.save(config);
    this.logger.log('Updated chatbot config');
    return this.decryptConfig(saved);
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
        // Use list models endpoint — lightweight, doesn't consume generation quota
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        );
        if (!res.ok) return { valid: false, error: `Gemini: ${res.status} ${res.statusText}` };
        return { valid: true };
      }
      return { valid: false, error: 'Unknown provider' };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Decrypt API keys in a config object (returns a copy).
   */
  private decryptConfig(config: ChatbotConfig): ChatbotConfig {
    const decrypted = { ...config } as ChatbotConfig;
    try {
      if (decrypted.primaryApiKey && isEncrypted(decrypted.primaryApiKey)) {
        decrypted.primaryApiKey = decrypt(decrypted.primaryApiKey);
      }
      if (decrypted.secondaryApiKey && isEncrypted(decrypted.secondaryApiKey)) {
        decrypted.secondaryApiKey = decrypt(decrypted.secondaryApiKey);
      }
    } catch (error) {
      this.logger.error('Failed to decrypt API keys', error);
    }
    return decrypted;
  }
}
