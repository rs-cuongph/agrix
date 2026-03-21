import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { FaqService } from './faq.service';

@Controller('admin/faq')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminFaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  async list() {
    return this.faqService.findAll();
  }

  @Post()
  async create(@Body() body: any) {
    return this.faqService.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.faqService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.faqService.delete(id);
    return { success: true };
  }
}
