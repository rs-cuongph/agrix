import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { UnitConversionService } from './unit-conversion.service';

@Controller('unit-conversions')
export class UnitConversionController {
  constructor(private readonly service: UnitConversionService) {}

  @Get()
  findAll(@Query('productId') productId?: string) {
    return this.service.findAll(productId);
  }

  @Post()
  create(
    @Body()
    body: {
      productId: string;
      unitName: string;
      conversionFactor: number;
      sellPrice?: number | null;
    },
  ) {
    return this.service.create(body);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      unitName: string;
      conversionFactor: number;
      sellPrice: number | null;
    }>,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
