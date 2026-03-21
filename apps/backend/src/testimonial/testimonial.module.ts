import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { TestimonialService } from './testimonial.service';
import { PublicTestimonialController } from './public-testimonial.controller';
import { AdminTestimonialController } from './admin-testimonial.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Testimonial])],
  controllers: [PublicTestimonialController, AdminTestimonialController],
  providers: [TestimonialService],
  exports: [TestimonialService],
})
export class TestimonialModule {}
