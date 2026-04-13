import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crop, GrowthStage, ProductRecommendation } from '../entities';

type MatchResult = {
  value: string;
  score: number;
};

@Injectable()
export class SeasonChatbotContextService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropRepo: Repository<Crop>,
    @InjectRepository(GrowthStage)
    private readonly growthStageRepo: Repository<GrowthStage>,
    @InjectRepository(ProductRecommendation)
    private readonly recommendationRepo: Repository<ProductRecommendation>,
  ) {}

  async buildContext(question: string): Promise<string | null> {
    const normalizedQuestion = this.normalize(question);
    const [crops, stages] = await Promise.all([
      this.cropRepo.find({
        where: { isActive: true },
        relations: ['seasonCalendars', 'seasonCalendars.zone'],
        order: { name: 'ASC' },
      }),
      this.growthStageRepo.find({
        relations: [
          'seasonCalendar',
          'seasonCalendar.crop',
          'seasonCalendar.zone',
        ],
      }),
    ]);

    const cropMatch = this.findCropMatch(normalizedQuestion, crops);
    const stageMatch = this.findStageMatch(normalizedQuestion, stages);

    if (!cropMatch || !stageMatch) {
      return null;
    }

    const matchedStage = stages.find(
      (stage) =>
        stage.id === stageMatch.value &&
        stage.seasonCalendar?.cropId === cropMatch.value,
    );
    if (!matchedStage) {
      return null;
    }

    const recommendations = await this.recommendationRepo.find({
      where: { growthStageId: matchedStage.id },
      relations: ['product'],
      order: { priority: 'ASC', product: { name: 'ASC' } },
      take: 5,
    });

    const season = matchedStage.seasonCalendar;
    const header = `[MÙA VỤ] ${season.crop.name} - Giai đoạn ${matchedStage.name} (${season.seasonName} - ${season.zone.name}):`;
    const activity = matchedStage.description
      ? `Hoạt động: ${matchedStage.description}`
      : null;

    const productLines = recommendations.map((recommendation) => {
      const product = recommendation.product;
      return `- ${product.name} (SKU: ${product.sku}) - ${product.baseSellPrice.toLocaleString(
        'vi-VN',
      )}đ/${product.baseUnit} - Còn ${product.currentStockBase}${product.baseUnit} - Lý do: ${
        recommendation.reason ?? 'Phù hợp với giai đoạn hiện tại'
      }`;
    });

    return [header, activity, 'Sản phẩm phù hợp:', ...productLines]
      .filter(Boolean)
      .join('\n');
  }

  private findCropMatch(question: string, crops: Crop[]): MatchResult | null {
    const matches = crops
      .map((crop) => {
        const keywords = [crop.name, ...(crop.localNames ?? [])];
        const bestScore = keywords.reduce((score, keyword) => {
          const normalizedKeyword = this.normalize(keyword);
          if (!normalizedKeyword) {
            return score;
          }
          return question.includes(normalizedKeyword)
            ? Math.max(score, normalizedKeyword.length)
            : score;
        }, 0);
        return bestScore > 0 ? { value: crop.id, score: bestScore } : null;
      })
      .filter((match): match is MatchResult => Boolean(match))
      .sort((left, right) => right.score - left.score);

    return matches[0] ?? null;
  }

  private findStageMatch(
    question: string,
    stages: GrowthStage[],
  ): MatchResult | null {
    const matches = stages
      .map((stage) => {
        const keywords = [stage.name, ...(stage.keywords ?? [])];
        const bestScore = keywords.reduce((score, keyword) => {
          const normalizedKeyword = this.normalize(keyword);
          if (!normalizedKeyword) {
            return score;
          }
          return question.includes(normalizedKeyword)
            ? Math.max(score, normalizedKeyword.length)
            : score;
        }, 0);
        return bestScore > 0 ? { value: stage.id, score: bestScore } : null;
      })
      .filter((match): match is MatchResult => Boolean(match))
      .sort((left, right) => right.score - left.score);

    return matches[0] ?? null;
  }

  private normalize(value: string) {
    return value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }
}
