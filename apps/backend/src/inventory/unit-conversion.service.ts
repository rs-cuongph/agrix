import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ── CRUD ────────────────────────────────────────────────

  async findAll(productId?: string) {
    const where = productId ? { productId } : {};
    return this.unitRepo.find({
      where,
      relations: ['product'],
      order: { productId: 'ASC', unitName: 'ASC' },
    });
  }

  async create(data: {
    productId: string;
    unitName: string;
    conversionFactor: number;
    sellPrice?: number | null;
  }) {
    const product = await this.productRepo.findOne({
      where: { id: data.productId },
    });
    if (!product)
      throw new NotFoundException(`Product ${data.productId} not found`);
    const entity = this.unitRepo.create(data);
    return this.unitRepo.save(entity);
  }

  async update(
    id: string,
    data: Partial<{
      unitName: string;
      conversionFactor: number;
      sellPrice: number | null;
    }>,
  ) {
    const existing = await this.unitRepo.findOne({ where: { id } });
    if (!existing)
      throw new NotFoundException(`UnitConversion ${id} not found`);
    Object.assign(existing, data);
    return this.unitRepo.save(existing);
  }

  async remove(id: string) {
    const existing = await this.unitRepo.findOne({ where: { id } });
    if (!existing)
      throw new NotFoundException(`UnitConversion ${id} not found`);
    await this.unitRepo.remove(existing);
    return { deleted: true };
  }

  // ── Conversion logic ───────────────────────────────────

  async toBaseUnits(
    productId: string,
    quantity: number,
    unitName: string,
  ): Promise<number> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    if (unitName === product.baseUnit) return quantity;

    const conversion = await this.unitRepo.findOne({
      where: { productId, unitName },
    });
    if (!conversion) {
      throw new NotFoundException(
        `Unit "${unitName}" not defined for product ${productId}`,
      );
    }

    return quantity * conversion.conversionFactor;
  }

  /**
   * Use sellPrice if set, otherwise derive from baseSellPrice * conversionFactor.
   */
  async derivePrice(productId: string, unitName: string): Promise<number> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    if (unitName === product.baseUnit) return product.baseSellPrice;

    const conversion = await this.unitRepo.findOne({
      where: { productId, unitName },
    });
    if (!conversion) {
      throw new NotFoundException(
        `Unit "${unitName}" not defined for product ${productId}`,
      );
    }

    return (
      conversion.sellPrice ??
      product.baseSellPrice * conversion.conversionFactor
    );
  }

  async getAvailableUnits(
    productId: string,
  ): Promise<{ unitName: string; conversionFactor: number; price: number }[]> {
    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['units'],
    });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

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
        price:
          conversion.sellPrice ??
          product.baseSellPrice * conversion.conversionFactor,
      });
    }

    return units;
  }
}
