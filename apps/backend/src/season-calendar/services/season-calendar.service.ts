import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  CreateGrowthStageDto,
  CreateProductRecommendationDto,
  CreateSeasonCalendarDto,
  UpdateGrowthStageDto,
  UpdateSeasonCalendarDto,
} from '../dto/create-season-calendar.dto';
import {
  AgriculturalZone,
  Crop,
  GrowthStage,
  PestWarning,
  ProductRecommendation,
  SeasonCalendar,
} from '../entities';
import {
  BulkCreateCalendarDto,
  type BulkCreateStageDto,
} from '../dto/ai-generate-calendar.dto';

function isMonthInRange(month: number, startMonth: number, endMonth: number) {
  if (startMonth <= endMonth) {
    return month >= startMonth && month <= endMonth;
  }
  return month >= startMonth || month <= endMonth;
}

@Injectable()
export class SeasonCalendarService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(SeasonCalendar)
    private readonly seasonCalendarRepo: Repository<SeasonCalendar>,
    @InjectRepository(AgriculturalZone)
    private readonly zoneRepo: Repository<AgriculturalZone>,
    @InjectRepository(Crop)
    private readonly cropRepo: Repository<Crop>,
    @InjectRepository(GrowthStage)
    private readonly growthStageRepo: Repository<GrowthStage>,
    @InjectRepository(ProductRecommendation)
    private readonly recommendationRepo: Repository<ProductRecommendation>,
  ) {}

  async getCalendar(zoneId: string, month?: number, cropId?: string) {
    if (!zoneId) {
      throw new BadRequestException('zoneId is required');
    }

    const zone = await this.zoneRepo.findOne({
      where: { id: zoneId, isActive: true },
    });
    if (!zone) {
      throw new NotFoundException(`Zone ${zoneId} not found`);
    }

    const calendars = await this.seasonCalendarRepo.find({
      where: {
        zoneId,
        isActive: true,
        ...(cropId ? { cropId } : {}),
      },
      relations: [
        'crop',
        'zone',
        'growthStages',
        'growthStages.recommendations',
        'growthStages.recommendations.product',
        'growthStages.pestWarnings',
        'growthStages.pestWarnings.treatmentLinks',
        'growthStages.pestWarnings.treatmentLinks.product',
      ],
      order: {
        crop: { name: 'ASC' },
        seasonName: 'ASC',
        growthStages: { sortOrder: 'ASC', startMonth: 'ASC' },
      },
    });

    const items = calendars
      .map((calendar) => {
        const stages = [...(calendar.growthStages ?? [])].sort(
          (left, right) => {
            if (left.sortOrder !== right.sortOrder) {
              return left.sortOrder - right.sortOrder;
            }
            return left.startMonth - right.startMonth;
          },
        );

        const currentStage =
          month == null
            ? null
            : (stages.find((stage) =>
                isMonthInRange(month, stage.startMonth, stage.endMonth),
              ) ?? null);

        return {
          id: calendar.id,
          seasonName: calendar.seasonName,
          year: calendar.year,
          notes: calendar.notes,
          zone: {
            id: calendar.zone.id,
            name: calendar.zone.name,
            code: calendar.zone.code,
          },
          crop: {
            id: calendar.crop.id,
            name: calendar.crop.name,
            category: calendar.crop.category,
            imageUrl: calendar.crop.imageUrl,
            localNames: calendar.crop.localNames ?? [],
          },
          currentStage: currentStage
            ? {
                id: currentStage.id,
                name: currentStage.name,
                stageType: currentStage.stageType,
                description: currentStage.description,
              }
            : null,
          stages: stages.map((stage) => ({
            id: stage.id,
            name: stage.name,
            stageType: stage.stageType,
            startMonth: stage.startMonth,
            endMonth: stage.endMonth,
            description: stage.description,
            keywords: stage.keywords ?? [],
            careActivities: stage.careActivities ?? [],
            sortOrder: stage.sortOrder,
            pestWarnings: (stage.pestWarnings ?? []).map((warning: PestWarning) => ({
              id: warning.id,
              name: warning.name,
              symptoms: warning.symptoms,
              severity: warning.severity,
              preventionNote: warning.preventionNote,
              treatmentProducts: (warning.treatmentLinks ?? []).map((link) => ({
                productId: link.productId,
                productName: link.product?.name ?? '',
                productSku: link.product?.sku ?? '',
                usageNote: link.usageNote,
              })),
            })),
            recommendations: (stage.recommendations ?? []).map(
              (recommendation) => ({
                id: recommendation.id,
                productId: recommendation.productId,
                reason: recommendation.reason,
                priority: recommendation.priority,
                dosageNote: recommendation.dosageNote,
                product: recommendation.product
                  ? {
                      id: recommendation.product.id,
                      name: recommendation.product.name,
                      sku: recommendation.product.sku,
                      baseUnit: recommendation.product.baseUnit,
                      baseSellPrice: recommendation.product.baseSellPrice,
                      currentStockBase: recommendation.product.currentStockBase,
                    }
                  : null,
              }),
            ),
          })),
        };
      })
      .filter((item) => (month == null ? true : item.currentStage !== null));

    return {
      zone: {
        id: zone.id,
        name: zone.name,
        code: zone.code,
      },
      month: month ?? null,
      items,
      suggestedZones:
        items.length > 0
          ? []
          : await this.zoneRepo.find({
              where: { isActive: true },
              select: { id: true, name: true, code: true },
              take: 3,
              order: { name: 'ASC' },
            }),
    };
  }

  async create(dto: CreateSeasonCalendarDto) {
    await this.ensureZoneAndCrop(dto.zoneId, dto.cropId);
    return this.seasonCalendarRepo.save(this.seasonCalendarRepo.create(dto));
  }

  async listCalendars(filters?: { zoneId?: string; cropId?: string }) {
    const query = this.seasonCalendarRepo
      .createQueryBuilder('calendar')
      .leftJoinAndSelect('calendar.zone', 'zone')
      .leftJoinAndSelect('calendar.crop', 'crop')
      .loadRelationCountAndMap('calendar.stageCount', 'calendar.growthStages')
      .orderBy('calendar.createdAt', 'DESC')
      .addOrderBy('calendar.seasonName', 'ASC');

    if (filters?.zoneId) {
      query.andWhere('calendar.zoneId = :zoneId', { zoneId: filters.zoneId });
    }
    if (filters?.cropId) {
      query.andWhere('calendar.cropId = :cropId', { cropId: filters.cropId });
    }

    const [items, total] = await query.getManyAndCount();

    return {
      items: items.map((calendar) => ({
        id: calendar.id,
        seasonName: calendar.seasonName,
        year: calendar.year,
        notes: calendar.notes,
        isActive: calendar.isActive,
        zone: calendar.zone
          ? {
              id: calendar.zone.id,
              name: calendar.zone.name,
              code: calendar.zone.code,
            }
          : null,
        crop: calendar.crop
          ? {
              id: calendar.crop.id,
              name: calendar.crop.name,
              category: calendar.crop.category,
            }
          : null,
        stageCount: Number((calendar as SeasonCalendar & { stageCount?: number }).stageCount ?? 0),
        createdAt: calendar.createdAt,
      })),
      total,
    };
  }

  async getCalendarDetail(calendarId: string) {
    const calendar = await this.seasonCalendarRepo.findOne({
      where: { id: calendarId },
      relations: [
        'zone',
        'crop',
        'growthStages',
        'growthStages.recommendations',
        'growthStages.recommendations.product',
        'growthStages.pestWarnings',
        'growthStages.pestWarnings.treatmentLinks',
        'growthStages.pestWarnings.treatmentLinks.product',
      ],
      order: {
        growthStages: {
          sortOrder: 'ASC',
          startMonth: 'ASC',
        },
      },
    });

    if (!calendar) {
      throw new NotFoundException(`Season calendar ${calendarId} not found`);
    }

    return {
      id: calendar.id,
      seasonName: calendar.seasonName,
      year: calendar.year,
      notes: calendar.notes,
      isActive: calendar.isActive,
      zone: calendar.zone
        ? {
            id: calendar.zone.id,
            name: calendar.zone.name,
            code: calendar.zone.code,
          }
        : null,
      crop: calendar.crop
        ? {
            id: calendar.crop.id,
            name: calendar.crop.name,
            category: calendar.crop.category,
          }
        : null,
      stages: [...(calendar.growthStages ?? [])]
        .sort((left, right) => {
          if (left.sortOrder !== right.sortOrder) {
            return left.sortOrder - right.sortOrder;
          }
          return left.startMonth - right.startMonth;
        })
        .map((stage) => ({
          id: stage.id,
          name: stage.name,
          stageType: stage.stageType,
          startMonth: stage.startMonth,
          endMonth: stage.endMonth,
          description: stage.description,
          keywords: stage.keywords ?? [],
          careActivities: stage.careActivities ?? [],
          sortOrder: stage.sortOrder,
          recommendations: (stage.recommendations ?? []).map(
            (recommendation) => ({
              id: recommendation.id,
              productId: recommendation.productId,
              reason: recommendation.reason,
              priority: recommendation.priority,
              dosageNote: recommendation.dosageNote,
              product: recommendation.product
                ? {
                    id: recommendation.product.id,
                    name: recommendation.product.name,
                    sku: recommendation.product.sku,
                  }
                : null,
            }),
          ),
          pestWarnings: (stage.pestWarnings ?? []).map((warning) => ({
            id: warning.id,
            name: warning.name,
            severity: warning.severity,
            symptoms: warning.symptoms,
            preventionNote: warning.preventionNote,
            treatmentProducts: (warning.treatmentLinks ?? []).map((link) => ({
              productId: link.productId,
              productName: link.product?.name ?? '',
              productSku: link.product?.sku ?? '',
              usageNote: link.usageNote,
            })),
          })),
        })),
      createdAt: calendar.createdAt,
    };
  }

  async update(id: string, dto: UpdateSeasonCalendarDto) {
    const calendar = await this.findCalendar(id);
    if (dto.zoneId || dto.cropId) {
      await this.ensureZoneAndCrop(
        dto.zoneId ?? calendar.zoneId,
        dto.cropId ?? calendar.cropId,
      );
    }
    Object.assign(calendar, dto);
    return this.seasonCalendarRepo.save(calendar);
  }

  async delete(id: string) {
    const calendar = await this.findCalendar(id);
    await this.seasonCalendarRepo.remove(calendar);
    return {
      id,
      deleted: true,
      seasonName: calendar.seasonName,
      cropId: calendar.cropId,
      zoneId: calendar.zoneId,
    };
  }

  async addStage(calendarId: string, dto: CreateGrowthStageDto) {
    await this.findCalendar(calendarId);
    return this.growthStageRepo.save(
      this.growthStageRepo.create({
        ...dto,
        seasonCalendarId: calendarId,
        keywords: dto.keywords ?? [],
        careActivities: dto.careActivities ?? [],
      }),
    );
  }

  async updateStage(stageId: string, dto: UpdateGrowthStageDto) {
    const stage = await this.findStage(stageId);
    Object.assign(stage, dto);
    return this.growthStageRepo.save(stage);
  }

  async deleteStage(stageId: string) {
    const stage = await this.findStage(stageId);
    await this.growthStageRepo.remove(stage);
    return {
      id: stageId,
      deleted: true,
      name: stage.name,
      seasonCalendarId: stage.seasonCalendarId,
    };
  }

  async addRecommendation(
    stageId: string,
    dto: CreateProductRecommendationDto,
  ) {
    await this.findStage(stageId);
    return this.recommendationRepo.save(
      this.recommendationRepo.create({
        ...dto,
        growthStageId: stageId,
        priority: dto.priority ?? 1,
      }),
    );
  }

  async deleteRecommendation(id: string) {
    const recommendation = await this.recommendationRepo.findOne({
      where: { id },
    });
    if (!recommendation) {
      throw new NotFoundException(`Recommendation ${id} not found`);
    }
    await this.recommendationRepo.remove(recommendation);
    return {
      id,
      deleted: true,
      productId: recommendation.productId,
      growthStageId: recommendation.growthStageId,
    };
  }

  async findStage(stageId: string) {
    const stage = await this.growthStageRepo.findOne({
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
    return stage;
  }

  async bulkCreate(dto: BulkCreateCalendarDto) {
    await this.ensureZoneAndCrop(dto.zoneId, dto.cropId);

    return this.dataSource.transaction(async (manager) => {
      if (dto.replaceExisting) {
        await manager.delete(SeasonCalendar, {
          zoneId: dto.zoneId,
          cropId: dto.cropId,
        });
      }

      let calendarsCreated = 0;
      let stagesCreated = 0;
      let pestWarningsCreated = 0;
      const createdCalendars: Array<{ id: string; seasonName: string }> = [];

      for (const season of dto.seasons) {
        const calendar = await manager.save(
          SeasonCalendar,
          manager.create(SeasonCalendar, {
            zoneId: dto.zoneId,
            cropId: dto.cropId,
            seasonName: season.seasonName,
            notes: season.notes ?? null,
            isActive: true,
          }),
        );
        calendarsCreated += 1;
        createdCalendars.push({
          id: calendar.id,
          seasonName: calendar.seasonName,
        });

        for (const stage of season.stages) {
          const savedStage = await manager.save(
            GrowthStage,
            manager.create(GrowthStage, this.createStagePayload(calendar.id, stage)),
          );
          stagesCreated += 1;

          if (!stage.pestWarnings?.length) {
            continue;
          }

          const warnings = stage.pestWarnings.map((warning) =>
            manager.create(PestWarning, {
              growthStageId: savedStage.id,
              name: warning.name,
              severity: warning.severity,
              symptoms: warning.symptoms ?? null,
              preventionNote: warning.preventionNote ?? null,
            }),
          );
          await manager.save(PestWarning, warnings);
          pestWarningsCreated += warnings.length;
        }
      }

      return {
        calendarsCreated,
        stagesCreated,
        pestWarningsCreated,
        createdCalendars,
      };
    });
  }

  async checkExistingCalendars(zoneId: string, cropId: string) {
    if (!zoneId || !cropId) {
      throw new BadRequestException('zoneId and cropId are required');
    }

    const count = await this.seasonCalendarRepo.count({
      where: {
        zoneId,
        cropId,
        isActive: true,
      },
    });

    return { count };
  }

  private async findCalendar(id: string) {
    const calendar = await this.seasonCalendarRepo.findOne({ where: { id } });
    if (!calendar) {
      throw new NotFoundException(`Season calendar ${id} not found`);
    }
    return calendar;
  }

  private async ensureZoneAndCrop(zoneId: string, cropId: string) {
    const [zone, crop] = await Promise.all([
      this.zoneRepo.findOne({ where: { id: zoneId } }),
      this.cropRepo.findOne({ where: { id: cropId } }),
    ]);
    if (!zone) {
      throw new NotFoundException(`Zone ${zoneId} not found`);
    }
    if (!crop) {
      throw new NotFoundException(`Crop ${cropId} not found`);
    }
  }

  private createStagePayload(
    calendarId: string,
    stage: BulkCreateStageDto,
  ): Partial<GrowthStage> {
    return {
      seasonCalendarId: calendarId,
      name: stage.name,
      stageType: stage.stageType,
      startMonth: stage.startMonth,
      endMonth: stage.endMonth,
      description: stage.description ?? null,
      keywords: stage.keywords ?? [],
      careActivities: stage.careActivities ?? [],
      sortOrder: stage.sortOrder ?? 0,
    };
  }
}
