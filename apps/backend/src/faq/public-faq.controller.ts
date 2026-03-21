import { Controller, Get } from '@nestjs/common';
import { FaqService } from './faq.service';

@Controller('public/faq')
export class PublicFaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  async getPublic() {
    return this.faqService.findAllPublic();
  }
}
