import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GrowthStage,
  ProductRecommendation,
  SeasonCalendar,
} from '../entities';
import { SeasonCalendarService } from './season-calendar.service';

@Injectable()
export class SeasonSuggestionService {
  constructor(
    @InjectRepository(GrowthStage)
    private readonly growthStageRepo: Repository<GrowthStage>,
    @InjectRepository(ProductRecommendation)
    private readonly recommendationRepo: Repository<ProductRecommendation>,
    @InjectRepository(SeasonCalendar)
    private readonly seasonCalendarRepo: Repository<SeasonCalendar>,
    private readonly seasonCalendarService: SeasonCalendarService,
  ) {}

  async getSuggestions(
    zoneId: string,
    month: number,
    cropId: string,
    stageId?: string,
  ) {
    let stage: GrowthStage | null = null;
    let calendar:
      | Awaited<
          ReturnType<SeasonCalendarService['getCalendar']>
        >['items'][number]
      | undefined;

    if (stageId) {
      stage = await this.growthStageRepo.findOne({
        where: { id: stageId },
        relations: [
          'seasonCalendar',
          'seasonCalendar.crop',
          'seasonCalendar.zone',
        ],
      });
      if (!stage) {
        throw new NotFoundException(`Growth stage ${stageId} not found`);
      }
      calendar = {
        id: stage.seasonCalendar.id,
        seasonName: stage.seasonCalendar.seasonName,
        year: stage.seasonCalendar.year,
        notes: stage.seasonCalendar.notes,
        zone: {
          id: stage.seasonCalendar.zone.id,
          name: stage.seasonCalendar.zone.name,
          code: stage.seasonCalendar.zone.code,
        },
        crop: {
          id: stage.seasonCalendar.crop.id,
          name: stage.seasonCalendar.crop.name,
          category: stage.seasonCalendar.crop.category,
          imageUrl: stage.seasonCalendar.crop.imageUrl,
          localNames: stage.seasonCalendar.crop.localNames ?? [],
        },
        currentStage: {
          id: stage.id,
          name: stage.name,
          stageType: stage.stageType,
          description: stage.description,
        },
        stages: [],
      };
    } else {
      const calendarData = await this.seasonCalendarService.getCalendar(
        zoneId,
        month,
        cropId,
      );
      calendar = calendarData.items[0];
      if (!calendar?.currentStage) {
        throw new NotFoundException(
          'No active growth stage found for this query',
        );
      }
      stage = await this.growthStageRepo.findOne({
        where: { id: calendar.currentStage.id },
      });
    }

    if (!stage || !calendar?.currentStage) {
      throw new NotFoundException('No growth stage found');
    }

    const recommendations = await this.recommendationRepo.find({
      where: { growthStageId: stage.id },
      relations: ['product'],
      order: { priority: 'ASC', product: { name: 'ASC' } },
    });

    const products = recommendations.map((recommendation) => ({
      id: recommendation.product.id,
      name: recommendation.product.name,
      sku: recommendation.product.sku,
      baseSellPrice: recommendation.product.baseSellPrice,
      baseUnit: recommendation.product.baseUnit,
      currentStockBase: recommendation.product.currentStockBase,
      reason: recommendation.reason,
      dosageNote: recommendation.dosageNote,
      priority: recommendation.priority,
    }));

    const alternatives =
      products.some((product) => product.currentStockBase <= 0) &&
      recommendations.length > 0
        ? await this.findAlternativeProducts(
            recommendations[0].product.categoryId,
          )
        : [];

    const explanationParts = [
      calendar.currentStage.description,
      recommendations
        .map((recommendation) => recommendation.reason)
        .filter(Boolean)
        .slice(0, 3)
        .join(' '),
    ].filter(Boolean);

    return {
      context: {
        zone: calendar.zone.name,
        crop: calendar.crop.name,
        stage: calendar.currentStage.name,
        month,
      },
      explanation:
        explanationParts.join(' ') ||
        `Giai đoạn ${calendar.currentStage.name} cần vật tư phù hợp theo lịch mùa vụ.`,
      products,
      alternatives,
    };
  }

  async buildStageContext(stageId: string) {
    const stage = await this.growthStageRepo.findOne({
      where: { id: stageId },
      relations: [
        'seasonCalendar',
        'seasonCalendar.crop',
        'seasonCalendar.zone',
      ],
    });
    if (!stage) {
      return null;
    }

    const calendar = await this.seasonCalendarRepo.findOne({
      where: { id: stage.seasonCalendarId },
      relations: ['crop', 'zone'],
    });
    if (!calendar) {
      return null;
    }

    return {
      stage,
      calendar,
    };
  }

  private async findAlternativeProducts(categoryId: string) {
    const recommendations = await this.recommendationRepo
      .createQueryBuilder('recommendation')
      .innerJoinAndSelect('recommendation.product', 'product')
      .where('product.categoryId = :categoryId', { categoryId })
      .andWhere('product.currentStockBase > 0')
      .orderBy('product.name', 'ASC')
      .limit(3)
      .getMany();

    return recommendations.map((recommendation) => ({
      id: recommendation.product.id,
      name: recommendation.product.name,
      sku: recommendation.product.sku,
      baseSellPrice: recommendation.product.baseSellPrice,
      baseUnit: recommendation.product.baseUnit,
      currentStockBase: recommendation.product.currentStockBase,
    }));
  }
}
