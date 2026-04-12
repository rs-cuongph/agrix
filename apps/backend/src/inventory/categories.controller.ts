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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { Category } from './entities/category.entity';

interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
}

@Controller('categories')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CategoriesController {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  @Get()
  async findAll() {
    return this.categoryRepo.find({
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  async create(@Body() dto: CreateCategoryDto) {
    const category = this.categoryRepo.create({
      name: dto.name,
      description: dto.description ?? undefined,
      parentId: dto.parentId ?? undefined,
    });
    return this.categoryRepo.save(category);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCategoryDto>,
  ) {
    await this.categoryRepo.update(id, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.parentId !== undefined && { parentId: dto.parentId }),
    });
    return this.categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.categoryRepo.delete(id);
    return { deleted: true };
  }
}
