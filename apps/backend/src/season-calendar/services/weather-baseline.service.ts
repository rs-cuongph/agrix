import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWeatherBaselineDto } from '../dto/create-weather-baseline.dto';
import { AgriculturalZone, WeatherBaseline } from '../entities';

@Injectable()
export class WeatherBaselineService {
  constructor(
    @InjectRepository(WeatherBaseline)
    private readonly weatherBaselineRepo: Repository<WeatherBaseline>,
    @InjectRepository(AgriculturalZone)
    private readonly zoneRepo: Repository<AgriculturalZone>,
  ) {}

  async findAll(zoneId?: string) {
    return this.weatherBaselineRepo.find({
      where: zoneId ? { zoneId } : {},
      order: { zoneId: 'ASC', month: 'ASC' },
    });
  }

  async findByZone(zoneId: string) {
    const zone = await this.zoneRepo.findOne({ where: { id: zoneId } });
    if (!zone) {
      throw new NotFoundException(`Zone ${zoneId} not found`);
    }

    const months = await this.weatherBaselineRepo.find({
      where: { zoneId },
      order: { month: 'ASC' },
    });

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      months: months.map((item) => ({
        month: item.month,
        avgTempC: Number(item.avgTempC),
        avgRainfallMm: Number(item.avgRainfallMm),
        notes: item.notes,
      })),
    };
  }

  async createOrUpsert(dto: CreateWeatherBaselineDto) {
    await this.ensureZone(dto.zoneId);
    const current = await this.weatherBaselineRepo.findOne({
      where: { zoneId: dto.zoneId, month: dto.month },
    });

    const record = this.weatherBaselineRepo.create({
      id: current?.id,
      zoneId: dto.zoneId,
      month: dto.month,
      avgTempC: dto.avgTempC,
      avgRainfallMm: dto.avgRainfallMm,
      notes: dto.notes ?? null,
    });
    return this.weatherBaselineRepo.save(record);
  }

  async delete(id: string) {
    const current = await this.weatherBaselineRepo.findOne({ where: { id } });
    if (!current) {
      throw new NotFoundException(`Weather baseline ${id} not found`);
    }
    await this.weatherBaselineRepo.remove(current);
    return { id, deleted: true, month: current.month, zoneId: current.zoneId };
  }

  private async ensureZone(zoneId: string) {
    const zone = await this.zoneRepo.findOne({ where: { id: zoneId } });
    if (!zone) {
      throw new NotFoundException(`Zone ${zoneId} not found`);
    }
    return zone;
  }
}
