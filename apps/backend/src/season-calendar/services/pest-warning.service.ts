import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  CreatePestWarningDto,
  UpdatePestWarningDto,
} from '../dto/create-pest-warning.dto';
import {
  GrowthStage,
  PestWarning,
  PestWarningProduct,
  PestWarningSeverity,
} from '../entities';
import { Product } from '../../inventory/entities/product.entity';

@Injectable()
export class PestWarningService {
  constructor(
    @InjectRepository(PestWarning)
    private readonly pestWarningRepo: Repository<PestWarning>,
    @InjectRepository(PestWarningProduct)
    private readonly pestWarningProductRepo: Repository<PestWarningProduct>,
    @InjectRepository(GrowthStage)
    private readonly growthStageRepo: Repository<GrowthStage>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findByStageId(stageId: string) {
    await this.ensureStage(stageId);
    const warnings = await this.pestWarningRepo.find({
      where: { growthStageId: stageId },
      relations: ['treatmentLinks', 'treatmentLinks.product'],
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    return warnings.map((warning) => this.serialize(warning));
  }

  async create(stageId: string, dto: CreatePestWarningDto) {
    await this.ensureStage(stageId);
    const warning = await this.pestWarningRepo.save(
      this.pestWarningRepo.create({
        growthStageId: stageId,
        name: dto.name,
        symptoms: dto.symptoms ?? null,
        severity: dto.severity ?? PestWarningSeverity.MEDIUM,
        preventionNote: dto.preventionNote ?? null,
        sortOrder: dto.sortOrder ?? 0,
      }),
    );
    await this.replaceTreatmentLinks(
      warning.id,
      dto.treatmentProductIds ?? [],
      dto.usageNotes ?? {},
    );
    return this.findOneSerialized(warning.id);
  }

  async update(id: string, dto: UpdatePestWarningDto) {
    const warning = await this.findOne(id);
    Object.assign(warning, {
      name: dto.name ?? warning.name,
      symptoms: dto.symptoms ?? warning.symptoms,
      severity: dto.severity ?? warning.severity,
      preventionNote: dto.preventionNote ?? warning.preventionNote,
      sortOrder: dto.sortOrder ?? warning.sortOrder,
    });
    await this.pestWarningRepo.save(warning);

    if (dto.treatmentProductIds || dto.usageNotes) {
      await this.replaceTreatmentLinks(
        warning.id,
        dto.treatmentProductIds ?? [],
        dto.usageNotes ?? {},
      );
    }

    return this.findOneSerialized(warning.id);
  }

  async delete(id: string) {
    const warning = await this.findOne(id);
    await this.pestWarningRepo.remove(warning);
    return {
      id,
      deleted: true,
      name: warning.name,
      growthStageId: warning.growthStageId,
    };
  }

  private async ensureStage(stageId: string) {
    const stage = await this.growthStageRepo.findOne({ where: { id: stageId } });
    if (!stage) {
      throw new NotFoundException(`Growth stage ${stageId} not found`);
    }
    return stage;
  }

  private async findOne(id: string) {
    const warning = await this.pestWarningRepo.findOne({ where: { id } });
    if (!warning) {
      throw new NotFoundException(`Pest warning ${id} not found`);
    }
    return warning;
  }

  private async findOneSerialized(id: string) {
    const warning = await this.pestWarningRepo.findOne({
      where: { id },
      relations: ['treatmentLinks', 'treatmentLinks.product'],
    });
    if (!warning) {
      throw new NotFoundException(`Pest warning ${id} not found`);
    }
    return this.serialize(warning);
  }

  private async replaceTreatmentLinks(
    pestWarningId: string,
    productIds: string[],
    usageNotes: Record<string, string>,
  ) {
    await this.pestWarningProductRepo.delete({ pestWarningId });
    if (!productIds.length) {
      return;
    }

    const products = await this.productRepo.find({
      where: { id: In(productIds), isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        baseUnit: true,
        baseSellPrice: true,
        currentStockBase: true,
      },
    });

    const validIds = new Set(products.map((product) => product.id));
    const links = productIds
      .filter((productId) => validIds.has(productId))
      .map((productId) =>
        this.pestWarningProductRepo.create({
          pestWarningId,
          productId,
          usageNote: usageNotes[productId] ?? null,
        }),
      );

    if (links.length) {
      await this.pestWarningProductRepo.save(links);
    }
  }

  private serialize(warning: PestWarning) {
    return {
      id: warning.id,
      growthStageId: warning.growthStageId,
      name: warning.name,
      symptoms: warning.symptoms,
      severity: warning.severity,
      preventionNote: warning.preventionNote,
      sortOrder: warning.sortOrder,
      treatmentProducts: (warning.treatmentLinks ?? []).map((link) => ({
        productId: link.productId,
        productName: link.product?.name ?? '',
        productSku: link.product?.sku ?? '',
        usageNote: link.usageNote,
      })),
    };
  }
}
