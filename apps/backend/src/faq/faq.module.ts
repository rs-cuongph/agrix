import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from './entities/faq.entity';
import { FaqService } from './faq.service';
import { PublicFaqController } from './public-faq.controller';
import { AdminFaqController } from './admin-faq.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Faq])],
  controllers: [PublicFaqController, AdminFaqController],
  providers: [FaqService],
  exports: [FaqService],
})
export class FaqModule {}
