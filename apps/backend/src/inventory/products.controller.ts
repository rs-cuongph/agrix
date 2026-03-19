import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InventoryService } from './inventory.service';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
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

  @Get('lookup')
  async lookup(
    @Query('barcode') barcode?: string,
    @Query('qr') qr?: string,
  ) {
    if (barcode) return this.inventoryService.lookupByBarcode(barcode);
    if (qr) return this.inventoryService.lookupByQr(qr);
    return { error: 'Provide barcode or qr parameter' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.inventoryService.findById(id);
  }
}
