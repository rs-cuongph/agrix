import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private readonly repo: Repository<Faq>,
  ) {}

  async findAllPublic(): Promise<Faq[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Faq[]> {
    return this.repo.find({ order: { order: 'ASC', createdAt: 'DESC' } });
  }

  async create(dto: Partial<Faq>): Promise<Faq> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: Partial<Faq>): Promise<Faq> {
    const faq = await this.repo.findOne({ where: { id } });
    if (!faq) throw new NotFoundException(`FAQ ${id} not found`);
    Object.assign(faq, dto);
    return this.repo.save(faq);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`FAQ ${id} not found`);
  }
}
