import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { ContactService } from './contact.service';
import { ContactStatus } from './entities/contact-submission.entity';

@Controller('admin/contact')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async list(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: ContactStatus,
  ) {
    return this.contactService.findAll(+page, +limit, status);
  }

  @Get('count-new')
  async countNew() {
    const count = await this.contactService.countNew();
    return { count };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ContactStatus,
  ) {
    return this.contactService.updateStatus(id, status);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.contactService.delete(id);
    return { success: true };
  }
}
