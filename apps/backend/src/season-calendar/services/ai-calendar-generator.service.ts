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
import { ServiceLoggerService } from '../../common/service-logger.service';
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
    private readonly serviceLogger: ServiceLoggerService,
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

    this.serviceLogger.logAiCall({
      provider: 'multi',
      action: 'calendar-generate',
      status: 'request',
      request: {
        zoneId: dto.zoneId,
        zoneName: zone.name,
        cropId: dto.cropId,
        cropName: crop.name,
        userNotes: dto.userNotes,
      },
    });

    const startTime = Date.now();

    for (const { provider, apiKey } of providers) {
      try {
        const result = await this.generateWithProvider(provider, apiKey, messages);

        this.serviceLogger.logAiCall({
          provider,
          action: 'calendar-generate',
          status: 'success',
          durationMs: Date.now() - startTime,
          metadata: {
            zoneName: zone.name,
            cropName: crop.name,
            seasonsCount: result.seasons.length,
            totalStages: result.seasons.reduce((sum, s) => sum + s.stages.length, 0),
          },
        });

        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown provider error';
        this.logger.warn(`AI provider ${provider} failed: ${message}`);

        this.serviceLogger.logAiCall({
          provider,
          action: 'calendar-generate',
          status: 'error',
          durationMs: Date.now() - startTime,
          error: message,
          request: { zoneName: zone.name, cropName: crop.name },
        });
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
    const notes = userNotes?.trim() || '';

    return [
      {
        role: 'system',
        content: [
          `Bạn là chuyên gia nông nghiệp Việt Nam với kinh nghiệm thực tế trồng trọt tại các vùng miền.`,
          `Hãy tạo lịch mùa vụ chi tiết cho cây ${crop.name} tại vùng ${zone.name} (${zone.code}), bao gồm các tỉnh: ${provinces}.`,
          notes ? `Thông tin bổ sung từ người dùng: ${notes}` : '',
          '',
          'Trả về **chỉ JSON** theo cấu trúc sau (không giải thích gì thêm):',
          JSON.stringify({
            seasons: [
              {
                seasonName: 'Tên mùa vụ (VD: Vụ Đông Xuân)',
                notes: 'Mô tả ngắn về đặc điểm mùa vụ tại vùng này',
                stages: [
                  {
                    name: 'Tên giai đoạn (VD: Gieo sạ, Đẻ nhánh, Thu hoạch...)',
                    stageType: 'gieo trồng | chăm sóc | thu hoạch',
                    startMonth: 1,
                    endMonth: 12,
                    description:
                      'Mô tả chi tiết hoạt động trong giai đoạn, kỹ thuật áp dụng, lưu ý thực tế',
                    keywords: ['từ khóa liên quan'],
                    careActivities: [
                      'Hoạt động chăm sóc cụ thể (VD: Bón phân NPK 20-20-15 liều 25kg/ha)',
                    ],
                    sortOrder: 1,
                    pestWarnings: [
                      {
                        name: 'Tên sâu bệnh phổ biến',
                        severity: 'thấp | trung bình | cao',
                        symptoms:
                          'Mô tả triệu chứng nhận biết trên cây/lá/quả',
                        preventionNote:
                          'Biện pháp phòng ngừa và xử lý cụ thể',
                      },
                    ],
                  },
                ],
              },
            ],
          }, null, 0),
          '',
          'QUY TẮC:',
          '- stageType dùng tiếng Việt: "gieo trồng", "chăm sóc", hoặc "thu hoạch"',
          '- severity dùng tiếng Việt: "thấp", "trung bình", hoặc "cao"',
          '- Mô tả (description) nên chi tiết, thực tế, phù hợp với điều kiện vùng miền',
          '- careActivities nên cụ thể: ghi rõ loại phân, liều lượng, thời điểm nếu biết',
          '- Mỗi giai đoạn nên có 1-3 cảnh báo sâu bệnh phổ biến nhất',
          '- Đảm bảo JSON hoàn chỉnh, đóng đủ tất cả ngoặc',
        ]
          .filter((line) => line !== undefined)
          .join('\n'),
      },
      {
        role: 'user',
        content: `Tạo lịch mùa vụ cho cây ${crop.name} tại ${zone.name}. Gồm 1-3 vụ chính trong năm, mỗi vụ có 3-6 giai đoạn sinh trưởng chi tiết. Đưa ra careActivities cụ thể và cảnh báo sâu bệnh phổ biến cho từng giai đoạn. Chỉ trả về JSON.`,
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
      const cleaned = this.stripMarkdownFences(raw);
      this.logger.debug(`AI raw response from ${provider} (${cleaned.length} chars): ${cleaned.substring(0, 200)}...`);

      this.serviceLogger.logAiCall({
        provider,
        action: 'calendar-generate-raw',
        status: 'success',
        response: cleaned,
      });

      return this.normalizeResult(JSON.parse(cleaned));
    } catch (firstError) {
      const firstMsg = firstError instanceof Error ? firstError.message : String(firstError);
      this.logger.warn(`Invalid AI JSON from ${provider}: ${firstMsg}. Retrying once...`);
      this.logger.debug(`Raw response was: ${raw.substring(0, 500)}`);

      this.serviceLogger.logAiCall({
        provider,
        action: 'calendar-generate-parse',
        status: 'retry',
        error: firstMsg,
        response: raw,
      });

      const retryRaw = await this.callProvider(provider, apiKey, messages);

      try {
        const retryCleaned = this.stripMarkdownFences(retryRaw);
        return this.normalizeResult(JSON.parse(retryCleaned));
      } catch (secondError) {
        const secondMsg = secondError instanceof Error ? secondError.message : String(secondError);
        this.logger.error(`AI retry also failed from ${provider}: ${secondMsg}`);
        this.logger.error(`Retry raw response: ${retryRaw.substring(0, 500)}`);
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
        max_tokens: 8192,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(60_000),
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
        maxOutputTokens: 16384,
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
        timeout: 90_000,
      },
    );

    const text = result.response.text() || '{}';
    // Check if Gemini flagged a finish reason other than STOP
    const candidate = result.response.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      this.logger.warn(`Gemini finish reason: ${candidate.finishReason}`);
    }
    return text;
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
    const value = String(input ?? '').toLowerCase().trim();
    if (
      value === GrowthStageType.PLANTING ||
      value === GrowthStageType.CARE ||
      value === GrowthStageType.HARVEST
    ) {
      return value as GrowthStageType;
    }
    // Map Vietnamese / alternative names to enum
    const mappings: Record<string, GrowthStageType> = {
      'gieo trồng': GrowthStageType.PLANTING,
      'gieo sạ': GrowthStageType.PLANTING,
      'trồng': GrowthStageType.PLANTING,
      'xuống giống': GrowthStageType.PLANTING,
      'làm đất': GrowthStageType.PLANTING,
      'chăm sóc': GrowthStageType.CARE,
      'chăm bón': GrowthStageType.CARE,
      'bón phân': GrowthStageType.CARE,
      'tưới': GrowthStageType.CARE,
      'thu hoạch': GrowthStageType.HARVEST,
      'thu hái': GrowthStageType.HARVEST,
      'harvesting': GrowthStageType.HARVEST,
      'planting': GrowthStageType.PLANTING,
      'caring': GrowthStageType.CARE,
      'preparation': GrowthStageType.PLANTING,
      'growth': GrowthStageType.CARE,
      'flowering': GrowthStageType.CARE,
      'fruiting': GrowthStageType.CARE,
    };
    const mapped = mappings[value];
    if (mapped) {
      return mapped;
    }
    this.logger.warn(`Unknown stageType "${String(input)}", defaulting to care`);
    return GrowthStageType.CARE;
  }

  private normalizeSeverity(input: unknown): PestWarningSeverity {
    const value = String(input ?? '').toLowerCase().trim();
    if (
      value === PestWarningSeverity.LOW ||
      value === PestWarningSeverity.MEDIUM ||
      value === PestWarningSeverity.HIGH
    ) {
      return value as PestWarningSeverity;
    }
    // Map Vietnamese severity names
    const mappings: Record<string, PestWarningSeverity> = {
      'thấp': PestWarningSeverity.LOW,
      'nhẹ': PestWarningSeverity.LOW,
      'trung bình': PestWarningSeverity.MEDIUM,
      'vừa': PestWarningSeverity.MEDIUM,
      'cao': PestWarningSeverity.HIGH,
      'nặng': PestWarningSeverity.HIGH,
      'nghiêm trọng': PestWarningSeverity.HIGH,
    };
    return mappings[value] ?? PestWarningSeverity.MEDIUM;
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

  /**
   * Strip markdown code fences that Gemini sometimes wraps around JSON.
   * e.g. ```json\n{...}\n``` → {...}
   */
  private stripMarkdownFences(text: string): string {
    let cleaned = text.trim();
    // Remove opening fence: ```json or ``` at start
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
    // Remove closing fence: ``` at end
    cleaned = cleaned.replace(/\n?```\s*$/i, '');
    return cleaned.trim();
  }
}
