import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ContactSubmission,
  ContactStatus,
} from './entities/contact-submission.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactSubmission)
    private readonly repo: Repository<ContactSubmission>,
  ) {}

  async create(dto: {
    customerName: string;
    phoneNumber: string;
    email?: string;
    message: string;
  }): Promise<ContactSubmission> {
    const submission = this.repo.create(dto);
    return this.repo.save(submission);
  }

  async findAll(
    page = 1,
    limit = 20,
    status?: ContactStatus,
  ): Promise<{ items: ContactSubmission[]; total: number }> {
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async findOne(id: string): Promise<ContactSubmission> {
    const submission = await this.repo.findOne({ where: { id } });
    if (!submission)
      throw new NotFoundException(`Contact submission ${id} not found`);
    return submission;
  }

  async updateStatus(
    id: string,
    status: ContactStatus,
  ): Promise<ContactSubmission> {
    const submission = await this.findOne(id);
    submission.status = status;
    return this.repo.save(submission);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Contact submission ${id} not found`);
  }

  async countNew(): Promise<number> {
    return this.repo.count({ where: { status: ContactStatus.NEW } });
  }
}
