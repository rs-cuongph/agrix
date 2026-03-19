import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductUnitConversion } from './entities/product-unit-conversion.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class UnitConversionService {
  constructor(
    @InjectRepository(ProductUnitConversion)
    private readonly unitRepo: Repository<ProductUnitConversion>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  /**
   * Convert a quantity from any unit to base units.
   * E.g., 10 "Thùng" (Box) × 40 factor = 400 base units (Chai/Bottle)
   */
  async toBaseUnits(productId: string, quantity: number, unitName: string): Promise<number> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new Error(`Product ${productId} not found`);

    // If unit matches base unit, return as-is
    if (unitName === product.baseUnit) return quantity;

    const conversion = await this.unitRepo.findOne({
      where: { productId, unitName },
    });
    if (!conversion) {
      throw new Error(`Unit "${unitName}" not defined for product ${productId}`);
    }

    return quantity * conversion.conversionFactor;
  }

  /**
   * Derive the price of any unit from the base sell price.
   * E.g., base = 10,000đ/Chai → Thùng (40 Chai) = 400,000đ/Thùng
   */
  async derivePrice(productId: string, unitName: string): Promise<number> {
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new Error(`Product ${productId} not found`);

    if (unitName === product.baseUnit) return product.baseSellPrice;

    const conversion = await this.unitRepo.findOne({
      where: { productId, unitName },
    });
    if (!conversion) {
      throw new Error(`Unit "${unitName}" not defined for product ${productId}`);
    }

    return product.baseSellPrice * conversion.conversionFactor;
  }

  /**
   * Get all available units with derived prices for a product.
   */
  async getAvailableUnits(productId: string): Promise<
    { unitName: string; conversionFactor: number; price: number }[]
  > {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['units'],
    });
    if (!product) throw new Error(`Product ${productId} not found`);

    const units = [
      {
        unitName: product.baseUnit,
        conversionFactor: 1,
        price: product.baseSellPrice,
      },
    ];

    for (const conversion of product.units) {
      units.push({
        unitName: conversion.unitName,
        conversionFactor: conversion.conversionFactor,
        price: product.baseSellPrice * conversion.conversionFactor,
      });
    }

    return units;
  }
}
