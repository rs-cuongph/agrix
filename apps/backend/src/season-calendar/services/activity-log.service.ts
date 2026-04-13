import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { ActivityLogQueryDto } from '../dto/activity-log-query.dto';
import { SeasonActivityAction, SeasonActivityLog } from '../entities';

@Injectable()
export class ActivityLogService implements OnModuleInit, OnModuleDestroy {
  private purgeTimeout?: NodeJS.Timeout;
  private purgeInterval?: NodeJS.Timeout;

  constructor(
    @InjectRepository(SeasonActivityLog)
    private readonly activityLogRepo: Repository<SeasonActivityLog>,
  ) {}

  async log(
    actorId: string,
    actorName: string,
    action: SeasonActivityAction,
    entityType: string,
    entityId: string,
    entityName: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.activityLogRepo.save(
      this.activityLogRepo.create({
        actorId,
        actorName,
        action,
        entityType,
        entityId,
        entityName,
        metadata: metadata ?? null,
      }),
    );
  }

  async findPaginated(query: ActivityLogQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.activityLogRepo
      .createQueryBuilder('log')
      .orderBy('log.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.entityType) {
      qb.andWhere('log.entity_type = :entityType', {
        entityType: query.entityType,
      });
    }

    if (query.fromDate) {
      qb.andWhere('log.created_at >= :fromDate', {
        fromDate: new Date(query.fromDate),
      });
    }

    if (query.toDate) {
      const toDate = new Date(query.toDate);
      toDate.setHours(23, 59, 59, 999);
      qb.andWhere('log.created_at <= :toDate', { toDate });
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async purgeOlderThan(months: number) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    await this.activityLogRepo.delete({ createdAt: LessThan(cutoff) });
  }

  onModuleInit() {
    void this.purgeOlderThan(6);
    this.scheduleDailyPurge();
  }

  onModuleDestroy() {
    if (this.purgeTimeout) {
      clearTimeout(this.purgeTimeout);
    }
    if (this.purgeInterval) {
      clearInterval(this.purgeInterval);
    }
  }

  private scheduleDailyPurge() {
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(3, 0, 0, 0);
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    const delay = nextRun.getTime() - now.getTime();
    this.purgeTimeout = setTimeout(() => {
      void this.purgeOlderThan(6);
      this.purgeInterval = setInterval(() => {
        void this.purgeOlderThan(6);
      }, 24 * 60 * 60 * 1000);
    }, delay);
  }
}
