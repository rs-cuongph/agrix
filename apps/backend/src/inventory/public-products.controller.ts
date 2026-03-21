import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('public/products')
export class PublicProductsController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('category') categoryId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.inventoryService.findProducts(search, categoryId, +page, +limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.inventoryService.findById(id);
  }
}
