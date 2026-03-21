import { Controller, Get } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';

@Controller('public/testimonials')
export class PublicTestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Get()
  async getPublic() {
    return this.testimonialService.findAllPublic();
  }
}
