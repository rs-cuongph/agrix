import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { DebtLedgerEntry, DebtEntryType } from './entities/debt-ledger-entry.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(DebtLedgerEntry)
    private readonly debtRepo: Repository<DebtLedgerEntry>,
  ) {}

  async findAll(search?: string) {
    const where: any = {};
    if (search) {
      where.name = ILike(`%${search}%`);
    }
    return this.customerRepo.find({ where, order: { name: 'ASC' } });
  }

  async findById(id: string): Promise<Customer> {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException(`Customer ${id} not found`);
    return customer;
  }

  async create(data: Partial<Customer>): Promise<Customer> {
    const customer = this.customerRepo.create(data);
    return this.customerRepo.save(customer);
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    await this.customerRepo.update(id, data);
    return this.findById(id);
  }

  async getDebtLedger(customerId: string): Promise<DebtLedgerEntry[]> {
    return this.debtRepo.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async recordPayment(
    customerId: string,
    amount: number,
    userId: string,
    note?: string,
  ): Promise<DebtLedgerEntry> {
    const customer = await this.findById(customerId);

    // Create payment entry (negative amount = debt reduction)
    const entry = this.debtRepo.create({
      customerId,
      amount: -Math.abs(amount),
      type: DebtEntryType.PAYMENT,
      note: note || 'Thanh toán công nợ',
      createdBy: userId,
    });
    const saved = await this.debtRepo.save(entry);

    // Update customer outstanding debt
    customer.outstandingDebt = Math.max(0, customer.outstandingDebt - Math.abs(amount));
    await this.customerRepo.save(customer);

    return saved;
  }

  async addDebt(
    customerId: string,
    amount: number,
    userId: string,
    referenceId?: string,
  ): Promise<DebtLedgerEntry> {
    const customer = await this.findById(customerId);

    const entry = this.debtRepo.create({
      customerId,
      amount: Math.abs(amount),
      type: DebtEntryType.SALE,
      referenceId,
      createdBy: userId,
    });
    const saved = await this.debtRepo.save(entry);

    customer.outstandingDebt += Math.abs(amount);
    await this.customerRepo.save(customer);

    return saved;
  }

  async remove(id: string) {
    const customer = await this.findById(id);
    await this.customerRepo.remove(customer);
    return { deleted: true };
  }
}
