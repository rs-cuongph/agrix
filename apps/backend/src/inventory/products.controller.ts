import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { Product } from './entities/product.entity';
import { ProductUnitConversion } from './entities/product-unit-conversion.entity';
import { InventoryService } from './inventory.service';
import { UnitConversionService } from './unit-conversion.service';

interface CreateProductDto {
  sku: string;
  name: string;
  categoryId: string;
  baseUnit: string;
  baseCostPrice: number;
  baseSellPrice: number;
  minStockThreshold?: number;
  expirationDate?: string;
  usageInstructions?: string;
  description?: string;
  barcodeEan13?: string;
  imageUrl?: string;
  unitConversions?: { unitName: string; conversionFactor: number }[];
}

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductUnitConversion)
    private readonly unitRepo: Repository<ProductUnitConversion>,
    private readonly inventoryService: InventoryService,
    private readonly unitConversionService: UnitConversionService,
  ) {}

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

  @Get(':id/units')
  async getUnits(@Param('id') id: string) {
    return this.unitConversionService.getAvailableUnits(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  async create(@Body() dto: CreateProductDto) {
    const product = this.productRepo.create({
      sku: dto.sku,
      name: dto.name,
      categoryId: dto.categoryId,
      baseUnit: dto.baseUnit,
      baseCostPrice: dto.baseCostPrice,
      baseSellPrice: dto.baseSellPrice,
      minStockThreshold: dto.minStockThreshold ?? 0,
      expirationDate: dto.expirationDate,
      usageInstructions: dto.usageInstructions,
      description: dto.description,
      barcodeEan13: dto.barcodeEan13,
    });

    const savedProduct = await this.productRepo.save(product);

    // Create unit conversions if provided
    if (dto.unitConversions?.length) {
      const units = dto.unitConversions.map((u) =>
        this.unitRepo.create({
          productId: savedProduct.id,
          unitName: u.unitName,
          conversionFactor: u.conversionFactor,
        }),
      );
      await this.unitRepo.save(units);
    }

    return this.inventoryService.findById(savedProduct.id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  async update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    const { unitConversions, ...productFields } = dto;

    // Update product fields
    await this.productRepo.update(id, productFields as any);

    // Replace unit conversions if provided
    if (unitConversions) {
      await this.unitRepo.delete({ productId: id });
      if (unitConversions.length > 0) {
        const units = unitConversions.map((u) =>
          this.unitRepo.create({
            productId: id,
            unitName: u.unitName,
            conversionFactor: u.conversionFactor,
          }),
        );
        await this.unitRepo.save(units);
      }
    }

    return this.inventoryService.findById(id);
  }
}
