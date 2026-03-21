import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('public/contact')
export class PublicContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async submitContact(
    @Body()
    body: {
      customerName: string;
      phoneNumber: string;
      email?: string;
      message: string;
    },
  ) {
    const submission = await this.contactService.create(body);
    return { success: true, id: submission.id };
  }
}
