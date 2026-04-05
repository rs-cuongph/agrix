import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Headers,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { OrderService } from './orders.service';
import type { CreateOrderDto, BankTransferWebhookDto } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  // ─── Public Webhook (no JWT required, uses x-webhook-secret) ────────────────
  @Post('webhook/bank-transfer')
  @HttpCode(HttpStatus.OK)
  async bankTransferWebhook(
    @Headers('x-webhook-secret') secret: string,
    @Body() dto: BankTransferWebhookDto,
  ) {
    if (!this.orderService.validateWebhookSecret(secret)) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
    const result = await this.orderService.confirmBankTransfer(dto);
    return { success: true, ...result };
  }

  // ─── Authenticated endpoints ─────────────────────────────────────────────────
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.orderService.createOrder(dto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async findAll(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.orderService.findOrders(from, to, search, +page, +limit);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async findOne(@Param('id') id: string) {
    return this.orderService.findById(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.orderService.deleteOrder(id, req.user.id);
  }
}
