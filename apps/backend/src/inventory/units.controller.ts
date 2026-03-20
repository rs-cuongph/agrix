import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';

@Controller('units')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UnitsController {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepo: Repository<Unit>,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.INVENTORY, UserRole.CASHIER)
  async findAll() {
    return this.unitRepo.find({ order: { name: 'ASC' } });
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() body: { name: string; abbreviation?: string; description?: string }) {
    const unit = this.unitRepo.create(body);
    return this.unitRepo.save(unit);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; abbreviation?: string; description?: string },
  ) {
    await this.unitRepo.update(id, body);
    return this.unitRepo.findOneByOrFail({ id });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.unitRepo.delete(id);
    return { deleted: true };
  }
}
