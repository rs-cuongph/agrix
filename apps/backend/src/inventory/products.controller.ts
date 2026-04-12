import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { Product } from './entities/product.entity';
import { ProductUnitConversion } from './entities/product-unit-conversion.entity';
import { InventoryService } from './inventory.service';
import { UnitConversionService } from './unit-conversion.service';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';

interface CreateProductDto {
  sku: string;
  name: string;
  categoryId: string;
  baseUnit: string;
  baseSellPrice: number;
  minStockThreshold?: number;
  expirationDate?: string;
  description?: string;
  imageUrls?: string[];
  barcodeEan13?: string;
  unitConversions?: { unitName: string; conversionFactor: number }[];
}

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB per file

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
    private readonly storageService: StorageService,
  ) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('category') categoryId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.inventoryService.findProducts(
      search,
      categoryId,
      +page,
      +limit,
    );
  }

  @Get('lookup')
  async lookup(@Query('barcode') barcode?: string, @Query('qr') qr?: string) {
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

  @Post('admin/upload')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  @UseInterceptors(FilesInterceptor('files', 10))
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0)
      throw new BadRequestException('No files provided');

    const uploadPromises = files.map((file) => {
      if (!ALLOWED_MIMES.includes(file.mimetype)) {
        throw new BadRequestException(
          `File type not allowed for ${file.originalname}. Allowed: JPEG, PNG, WebP, GIF`,
        );
      }
      if (file.size > MAX_SIZE) {
        throw new BadRequestException(
          `File ${file.originalname} too large. Maximum 5MB`,
        );
      }

      const ext = file.originalname.split('.').pop() || 'jpg';
      const key = `products/${uuidv4()}.${ext}`;
      return this.storageService.uploadFile(key, file.buffer, file.mimetype);
    });

    const results = await Promise.all(uploadPromises);
    // Assuming uploadFile returns an object { url: string } or a string directly based on Blog implementation
    return { urls: results.map((r) => (typeof r === 'string' ? r : r.url)) };
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
      baseSellPrice: dto.baseSellPrice,
      minStockThreshold: dto.minStockThreshold ?? 0,
      expirationDate: dto.expirationDate,
      description: dto.description,
      imageUrls: dto.imageUrls || [],
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
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    const {
      unitConversions,
      units,
      category,
      createdAt,
      updatedAt,
      id: productId,
      ...productFields
    } = dto as any;

    // Update product fields
    await this.productRepo.update(id, productFields);

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

  @Patch(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async toggleActive(@Param('id') id: string) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new Error(`Product ${id} not found`);
    product.isActive = !product.isActive;
    await this.productRepo.save(product);
    return { id, isActive: product.isActive };
  }
}
