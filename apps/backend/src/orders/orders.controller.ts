import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { OrderService } from './orders.service';
import type { CreateOrderDto } from './orders.service';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.orderService.createOrder(dto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async findAll(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.orderService.findOrders(from, to, +page, +limit);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async findOne(@Param('id') id: string) {
    return this.orderService.findById(id);
  }
}
