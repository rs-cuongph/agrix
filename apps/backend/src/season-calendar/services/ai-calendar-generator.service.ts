import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatConfigService } from '../../ai/chat-config.service';
import { AiGenerateCalendarDto } from '../dto/ai-generate-calendar.dto';
import {
  AgriculturalZone,
  Crop,
  GrowthStageType,
  PestWarningSeverity,
} from '../entities';

type LLMMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type AiPestWarning = {
  name: string;
  severity: PestWarningSeverity;
  symptoms?: string;
  preventionNote?: string;
};

type AiStage = {
  name: string;
  stageType: GrowthStageType;
  startMonth: number;
  endMonth: number;
  description?: string;
  keywords?: string[];
  careActivities?: string[];
  sortOrder: number;
  pestWarnings?: AiPestWarning[];
};

type AiSeason = {
  seasonName: string;
  notes?: string;
  stages: AiStage[];
};

export type AiGenerateResult = {
  seasons: AiSeason[];
};

@Injectable()
export class AiCalendarGeneratorService {
  private readonly logger = new Logger(AiCalendarGeneratorService.name);

  constructor(
    private readonly chatConfigService: ChatConfigService,
    private readonly configService: ConfigService,
    @InjectRepository(AgriculturalZone)
    private readonly zoneRepo: Repository<AgriculturalZone>,
    @InjectRepository(Crop)
    private readonly cropRepo: Repository<Crop>,
  ) {}

  async generate(dto: AiGenerateCalendarDto): Promise<AiGenerateResult> {
    const [zone, crop, config] = await Promise.all([
      this.zoneRepo.findOne({ where: { id: dto.zoneId } }),
      this.cropRepo.findOne({ where: { id: dto.cropId } }),
      this.chatConfigService.getConfig(),
    ]);

    if (!zone) {
      throw new NotFoundException(`Zone ${dto.zoneId} not found`);
    }
    if (!crop) {
      throw new NotFoundException(`Crop ${dto.cropId} not found`);
    }

    const providers = this.getProviderOrder(config);
    if (!providers.length) {
      throw new InternalServerErrorException(
        'Không thể tạo lịch tự động. Vui lòng cấu hình AI trước.',
      );
    }

    const messages = this.buildMessages(zone, crop, dto.userNotes);

    for (const { provider, apiKey } of providers) {
      try {
        return await this.generateWithProvider(provider, apiKey, messages);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown provider error';
        this.logger.warn(`AI provider ${provider} failed: ${message}`);
      }
    }

    throw new InternalServerErrorException(
      'Không thể tạo lịch tự động. Vui lòng thử lại hoặc nhập thủ công.',
    );
  }

  private buildMessages(
    zone: AgriculturalZone,
    crop: Crop,
    userNotes?: string,
  ): LLMMessage[] {
    const provinces =
      zone.provinces?.length ? zone.provinces.join(', ') : 'Không rõ tỉnh';
    const notes = userNotes?.trim() || 'Không có ghi chú bổ sung.';

    return [
      {
        role: 'system',
        content: [
          'Bạn là chuyên gia nông nghiệp Việt Nam.',
          `Hãy tạo lịch mùa vụ cho cây ${crop.name} tại vùng ${zone.name} (${zone.code}).`,
          `Các tỉnh liên quan: ${provinces}.`,
          `Ghi chú thêm từ admin: ${notes}`,
          'Chỉ trả về JSON hợp lệ theo schema:',
          JSON.stringify({
            seasons: [
              {
                seasonName: 'string',
                notes: 'string',
                stages: [
                  {
                    name: 'string',
                    stageType: 'planting | care | harvest',
                    startMonth: 1,
                    endMonth: 12,
                    description: 'string',
                    keywords: ['string'],
                    careActivities: ['string'],
                    sortOrder: 1,
                    pestWarnings: [
                      {
                        name: 'string',
                        severity: 'low | medium | high',
                        symptoms: 'string',
                        preventionNote: 'string',
                      },
                    ],
                  },
                ],
              },
            ],
          }),
        ].join('\n'),
      },
      {
        role: 'user',
        content:
          'Tạo 1-3 mùa vụ phổ biến, mỗi mùa vụ có 2-6 giai đoạn. Không thêm giải thích ngoài JSON.',
      },
    ];
  }

  private getProviderOrder(config: {
    primaryProvider?: string | null;
    primaryApiKey?: string | null;
    secondaryProvider?: string | null;
    secondaryApiKey?: string | null;
  }) {
    return [
      config.primaryProvider && config.primaryApiKey
        ? {
            provider: config.primaryProvider,
            apiKey: config.primaryApiKey,
          }
        : null,
      config.secondaryProvider && config.secondaryApiKey
        ? {
            provider: config.secondaryProvider,
            apiKey: config.secondaryApiKey,
          }
        : null,
    ].filter(
      (item): item is { provider: string; apiKey: string } => Boolean(item),
    );
  }

  private async generateWithProvider(
    provider: string,
    apiKey: string,
    messages: LLMMessage[],
  ) {
    const raw = await this.callProvider(provider, apiKey, messages);

    try {
      return this.normalizeResult(JSON.parse(raw));
    } catch (firstError) {
      this.logger.warn(`Invalid AI JSON from ${provider}, retrying once`);
      const retryRaw = await this.callProvider(provider, apiKey, messages);

      try {
        return this.normalizeResult(JSON.parse(retryRaw));
      } catch (secondError) {
        throw secondError instanceof Error
          ? secondError
          : new Error(String(secondError));
      }
    }
  }

  private async callProvider(
    provider: string,
    apiKey: string,
    messages: LLMMessage[],
  ): Promise<string> {
    if (provider === 'openai') {
      return this.callOpenAI(messages, apiKey);
    }

    if (provider === 'gemini') {
      return this.callGemini(messages, apiKey);
    }

    throw new Error(`Unsupported provider ${provider}`);
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
          this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini',
        messages,
        max_tokens: 4096,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '{}';
  }

  private async callGemini(
    messages: LLMMessage[],
    apiKey: string,
  ): Promise<string> {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model:
        this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 4096,
        temperature: 0.4,
      },
    });

    const systemInstruction =
      messages.find((message) => message.role === 'system')?.content ?? '';
    const userMessage =
      messages.find((message) => message.role === 'user')?.content ?? '';

    const result = await model.generateContent(
      {
        systemInstruction,
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      },
      {
        timeout: 30000,
      },
    );

    return result.response.text() || '{}';
  }

  private normalizeResult(payload: unknown): AiGenerateResult {
    if (
      !payload ||
      typeof payload !== 'object' ||
      !Array.isArray((payload as { seasons?: unknown[] }).seasons)
    ) {
      throw new Error('AI response missing seasons array');
    }

    const seasons = (payload as { seasons: unknown[] }).seasons
      .map((season, seasonIndex) =>
        this.normalizeSeason(season, seasonIndex + 1),
      )
      .filter((season) => season.stages.length > 0);

    if (!seasons.length) {
      throw new Error('AI response did not contain any valid season');
    }

    return { seasons };
  }

  private normalizeSeason(input: unknown, fallbackIndex: number): AiSeason {
    const season = this.asRecord(input);
    const stages = Array.isArray(season.stages)
      ? season.stages
          .map((stage, index) => this.normalizeStage(stage, index + 1))
          .filter(Boolean)
      : [];

    return {
      seasonName:
        this.asNonEmptyString(season.seasonName) || `Mùa vụ ${fallbackIndex}`,
      notes: this.asOptionalString(season.notes),
      stages,
    };
  }

  private normalizeStage(input: unknown, fallbackIndex: number): AiStage {
    const stage = this.asRecord(input);
    const stageType = this.normalizeStageType(stage.stageType);
    const startMonth = this.normalizeMonth(stage.startMonth);
    const endMonth = this.normalizeMonth(stage.endMonth);

    return {
      name: this.asNonEmptyString(stage.name) || `Giai đoạn ${fallbackIndex}`,
      stageType,
      startMonth,
      endMonth,
      description: this.asOptionalString(stage.description),
      keywords: this.normalizeStringArray(stage.keywords),
      careActivities: this.normalizeStringArray(stage.careActivities),
      sortOrder: this.normalizeNumber(stage.sortOrder) ?? fallbackIndex,
      pestWarnings: Array.isArray(stage.pestWarnings)
        ? stage.pestWarnings.map((warning) => this.normalizeWarning(warning))
        : [],
    };
  }

  private normalizeWarning(input: unknown): AiPestWarning {
    const warning = this.asRecord(input);
    return {
      name: this.asNonEmptyString(warning.name) || 'Cảnh báo sâu bệnh',
      severity: this.normalizeSeverity(warning.severity),
      symptoms: this.asOptionalString(warning.symptoms),
      preventionNote: this.asOptionalString(warning.preventionNote),
    };
  }

  private normalizeStageType(input: unknown): GrowthStageType {
    const value = String(input ?? '').toLowerCase();
    if (
      value === GrowthStageType.PLANTING ||
      value === GrowthStageType.CARE ||
      value === GrowthStageType.HARVEST
    ) {
      return value as GrowthStageType;
    }
    throw new Error(`Invalid stageType ${String(input)}`);
  }

  private normalizeSeverity(input: unknown): PestWarningSeverity {
    const value = String(input ?? '').toLowerCase();
    if (
      value === PestWarningSeverity.LOW ||
      value === PestWarningSeverity.MEDIUM ||
      value === PestWarningSeverity.HIGH
    ) {
      return value as PestWarningSeverity;
    }
    return PestWarningSeverity.MEDIUM;
  }

  private normalizeMonth(input: unknown): number {
    const value = this.normalizeNumber(input);
    if (!value || value < 1 || value > 12) {
      throw new Error(`Invalid month ${String(input)}`);
    }
    return value;
  }

  private normalizeNumber(input: unknown): number | null {
    if (typeof input === 'number' && Number.isInteger(input)) {
      return input;
    }
    if (typeof input === 'string' && input.trim()) {
      const value = Number(input);
      if (Number.isInteger(value)) {
        return value;
      }
    }
    return null;
  }

  private normalizeStringArray(input: unknown) {
    if (!Array.isArray(input)) {
      return [];
    }
    return input
      .map((item) => this.asOptionalString(item))
      .filter((item): item is string => Boolean(item));
  }

  private asRecord(input: unknown): Record<string, unknown> {
    return input && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {};
  }

  private asOptionalString(input: unknown) {
    return typeof input === 'string' && input.trim() ? input.trim() : undefined;
  }

  private asNonEmptyString(input: unknown) {
    return this.asOptionalString(input);
  }
}
