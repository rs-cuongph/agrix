import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Testimonial } from './entities/testimonial.entity';

@Injectable()
export class TestimonialService {
  constructor(
    @InjectRepository(Testimonial)
    private readonly repo: Repository<Testimonial>,
  ) {}

  async findAllPublic(): Promise<Testimonial[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Testimonial[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: Partial<Testimonial>): Promise<Testimonial> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: Partial<Testimonial>): Promise<Testimonial> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Testimonial ${id} not found`);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Testimonial ${id} not found`);
  }
}
