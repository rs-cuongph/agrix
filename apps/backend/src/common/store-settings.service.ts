import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreSettings } from './entities/store-settings.entity';

@Injectable()
export class StoreSettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(StoreSettings)
    private readonly repo: Repository<StoreSettings>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      await this.repo.save(
        this.repo.create({
          storeName: 'Agrix Nông Nghiệp',
          address: 'Việt Nam',
          phoneNumber: '0900000000',
          email: 'contact@agrix.vn',
          description:
            'Hệ thống quản lý bán hàng, tồn kho, và tư vấn nông nghiệp toàn diện cho đại lý vật tư nông nghiệp Việt Nam.',
          heroTitle: 'Nền tảng Nông nghiệp Thông minh',
          heroSubtitle:
            'Giải pháp toàn diện cho đại lý vật tư nông nghiệp: POS offline-first, quản lý đơn vị linh hoạt, và chatbot AI tư vấn kỹ thuật.',
        }),
      );
    }
  }

  async getPublicSettings(): Promise<Partial<StoreSettings>> {
    const settings = await this.repo.findOne({ where: {} });
    if (!settings) return {};
    const { id, createdAt, updatedAt, ...publicFields } = settings;
    return publicFields;
  }

  async getFullSettings(): Promise<StoreSettings | null> {
    return this.repo.findOne({ where: {} });
  }

  async upsertSettings(dto: Partial<StoreSettings>): Promise<StoreSettings> {
    const settings = await this.repo.findOne({ where: {} });
    if (settings) {
      Object.assign(settings, dto);
      return this.repo.save(settings);
    }
    return this.repo.save(this.repo.create(dto));
  }
}
