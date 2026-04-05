import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Brackets } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { InventoryService } from '../inventory/inventory.service';
import { Customer } from '../customers/entities/customer.entity';

export interface CreateOrderDto {
  id: string;
  idempotencyKey: string;
  customerId?: string;
  paymentMethod: string;
  paidAmount: number;
  items: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
  productId: string;
  quantityBase: number;
  soldUnit: string;
  unitPrice: number;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly inventoryService: InventoryService,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(dto: CreateOrderDto, userId: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      // Calculate total
      let totalAmount = 0;
      const items: Partial<OrderItem>[] = [];

      for (const item of dto.items) {
        const lineTotal = item.unitPrice * item.quantityBase;
        totalAmount += lineTotal;
        items.push({
          productId: item.productId,
          quantityBase: item.quantityBase,
          soldUnit: item.soldUnit,
          unitPrice: item.unitPrice,
          lineTotal,
        });
      }

      // The settled amount should logically not exceed total order amount in accounting
      const actualPaidAmount = Math.min(dto.paidAmount, totalAmount);

      // Create order
      const order = manager.create(Order, {
        id: dto.id,
        idempotencyKey: dto.idempotencyKey,
        customerId: dto.customerId ?? undefined,
        totalAmount,
        paidAmount: actualPaidAmount,
        paymentMethod: dto.paymentMethod as any,
        createdBy: userId,
        items: items as OrderItem[],
      });

      const saved = await manager.save(Order, order);

      // Deduct stock for each item
      for (const item of dto.items) {
        await this.inventoryService.deductStock(
          item.productId,
          item.quantityBase,
          saved.id,
          userId,
        );
      }

      // Update customer debt if partial payment
      if (dto.customerId && actualPaidAmount < totalAmount) {
        const debtAmount = totalAmount - actualPaidAmount;
        await manager.increment(Customer, { id: dto.customerId }, 'outstandingDebt', debtAmount);
      }

      return saved;
    });
  }

  async findOrders(from?: string, to?: string, search?: string, page = 1, limit = 20) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.customer', 'customer')
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (from) qb.andWhere('order.createdAt >= :from', { from });
    if (to) qb.andWhere('order.createdAt <= :to', { to });
    if (search) {
      qb.andWhere(new Brackets(qb => {
        qb.where('CAST(order.id AS VARCHAR) LIKE :search', { search: `%${search}%` })
          .orWhere('LOWER(customer.name) LIKE LOWER(:search)', { search: `%${search}%` });
      }));
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit } };
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'items.product', 'customer'],
    });
    if (!order) throw new BadRequestException(`Order ${id} not found`);
    return order;
  }

  async deleteOrder(id: string, userId: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id },
        relations: ['items'],
      });

      if (!order) throw new BadRequestException(`Order ${id} not found`);

      // 1. Revert debt if applicable
      if (order.customerId && order.paidAmount < order.totalAmount) {
        const debtAmount = order.totalAmount - order.paidAmount;
        await manager.decrement(Customer, { id: order.customerId }, 'outstandingDebt', debtAmount);
      }

      // 2. Revert stock via Inventory Service
      for (const item of order.items) {
        await this.inventoryService.addStock(
          item.productId,
          item.quantityBase,
          order.id, // Using the order's ID as reference for the RETURN
          userId,
        );
      }

      // 3. Remove order (and cascaded items)
      await manager.remove(Order, order);
    });
  }
}
