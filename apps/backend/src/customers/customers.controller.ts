import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';
import { CustomersService } from './customers.service';

@Controller('customers')
@UseGuards(AuthGuard('jwt'))
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    return this.customersService.findAll(search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customersService.findById(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async create(
    @Body() body: { name: string; phone?: string; address?: string },
  ) {
    return this.customersService.create(body);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async update(@Param('id') id: string, @Body() body: any) {
    return this.customersService.update(id, body);
  }

  @Get(':id/debt-ledger')
  async getDebtLedger(@Param('id') id: string) {
    const [customer, ledger] = await Promise.all([
      this.customersService.findById(id),
      this.customersService.getDebtLedger(id),
    ]);
    return { customer, ledger };
  }

  @Post(':id/payment')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CASHIER)
  async recordPayment(
    @Param('id') id: string,
    @Body() body: { amount: number; note?: string },
    @Req() req: any,
  ) {
    return this.customersService.recordPayment(
      id,
      body.amount,
      req.user.id,
      body.note,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
