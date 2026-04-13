import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCropDto, UpdateCropDto } from '../dto/create-crop.dto';
import { Crop, SeasonCalendar } from '../entities';

@Injectable()
export class CropsService {
  constructor(
    @InjectRepository(Crop)
    private readonly cropRepo: Repository<Crop>,
    @InjectRepository(SeasonCalendar)
    private readonly seasonCalendarRepo: Repository<SeasonCalendar>,
  ) {}

  async findAll(zoneId?: string) {
    if (!zoneId) {
      return this.cropRepo.find({
        where: { isActive: true },
        order: { name: 'ASC' },
      });
    }

    const calendars = await this.seasonCalendarRepo.find({
      where: { zoneId, isActive: true },
      relations: ['crop'],
      order: { crop: { name: 'ASC' } },
    });

    const cropMap = new Map<string, Crop>();
    for (const calendar of calendars) {
      if (calendar.crop?.isActive) {
        cropMap.set(calendar.crop.id, calendar.crop);
      }
    }
    return Array.from(cropMap.values());
  }

  async findOne(id: string) {
    const crop = await this.cropRepo.findOne({ where: { id } });
    if (!crop) {
      throw new NotFoundException(`Crop ${id} not found`);
    }
    return crop;
  }

  async create(dto: CreateCropDto) {
    return this.cropRepo.save(
      this.cropRepo.create({
        ...dto,
        localNames: dto.localNames ?? [],
      }),
    );
  }

  async update(id: string, dto: UpdateCropDto) {
    const crop = await this.findOne(id);
    Object.assign(crop, dto);
    return this.cropRepo.save(crop);
  }

  async softDelete(id: string) {
    const crop = await this.findOne(id);
    crop.isActive = false;
    return this.cropRepo.save(crop);
  }
}
