import { Controller, Post, Body, UseGuards, Req, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { OrderService, CreateOrderDto } from './orders.service';

interface SyncOrdersDto {
  orders: CreateOrderDto[];
}

interface SyncResult {
  processed: number;
  skipped: number;
  errors: { idempotencyKey: string; error: string }[];
}

@Controller('sync')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(private readonly orderService: OrderService) {}

  /**
   * Idempotent sync endpoint: accepts batch of orders from offline tablets.
   * Skips orders whose idempotencyKey already exists (no duplicates).
   */
  @Post('orders')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async syncOrders(@Body() dto: SyncOrdersDto, @Req() req: any): Promise<SyncResult> {
    const result: SyncResult = { processed: 0, skipped: 0, errors: [] };

    for (const orderDto of dto.orders) {
      try {
        await this.orderService.createOrder(orderDto, req.user.id);
        result.processed++;
        this.logger.log(`Synced order ${orderDto.idempotencyKey}`);
      } catch (error: any) {
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          result.skipped++;
          this.logger.log(`Skipped duplicate ${orderDto.idempotencyKey}`);
        } else {
          result.errors.push({
            idempotencyKey: orderDto.idempotencyKey,
            error: error.message,
          });
          this.logger.error(`Failed sync ${orderDto.idempotencyKey}: ${error.message}`);
        }
      }
    }

    return result;
  }
}
