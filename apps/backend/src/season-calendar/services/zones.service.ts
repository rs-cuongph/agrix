import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateZoneDto, UpdateZoneDto } from '../dto/create-zone.dto';
import { AgriculturalZone } from '../entities';

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(AgriculturalZone)
    private readonly zoneRepo: Repository<AgriculturalZone>,
  ) {}

  async findAll(activeOnly = true) {
    return this.zoneRepo.find({
      where: activeOnly ? { isActive: true } : {},
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const zone = await this.zoneRepo.findOne({ where: { id } });
    if (!zone) {
      throw new NotFoundException(`Zone ${id} not found`);
    }
    return zone;
  }

  async create(dto: CreateZoneDto) {
    return this.zoneRepo.save(
      this.zoneRepo.create({
        ...dto,
        provinces: dto.provinces ?? [],
      }),
    );
  }

  async update(id: string, dto: UpdateZoneDto) {
    const zone = await this.findOne(id);
    Object.assign(zone, dto);
    return this.zoneRepo.save(zone);
  }

  async softDelete(id: string) {
    const zone = await this.findOne(id);
    zone.isActive = false;
    return this.zoneRepo.save(zone);
  }
}
