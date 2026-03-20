import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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

      if (dto.paidAmount > totalAmount) {
        throw new BadRequestException('Paid amount exceeds total');
      }

      // Create order
      const order = manager.create(Order, {
        id: dto.id,
        idempotencyKey: dto.idempotencyKey,
        customerId: dto.customerId ?? undefined,
        totalAmount,
        paidAmount: dto.paidAmount,
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
      if (dto.customerId && dto.paidAmount < totalAmount) {
        const debtAmount = totalAmount - dto.paidAmount;
        await manager.increment(Customer, { id: dto.customerId }, 'outstandingDebt', debtAmount);
      }

      return saved;
    });
  }

  async findOrders(from?: string, to?: string, page = 1, limit = 20) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.customer', 'customer')
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (from) qb.andWhere('order.createdAt >= :from', { from });
    if (to) qb.andWhere('order.createdAt <= :to', { to });

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit } };
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items', 'customer'],
    });
    if (!order) throw new BadRequestException(`Order ${id} not found`);
    return order;
  }
}
