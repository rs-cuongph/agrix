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
import { TestimonialService } from './testimonial.service';

@Controller('admin/testimonials')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminTestimonialController {
  constructor(private readonly testimonialService: TestimonialService) {}

  @Get()
  async list() {
    return this.testimonialService.findAll();
  }

  @Post()
  async create(@Body() body: any) {
    return this.testimonialService.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.testimonialService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.testimonialService.delete(id);
    return { success: true };
  }
}
