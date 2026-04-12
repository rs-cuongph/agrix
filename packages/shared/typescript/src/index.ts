export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  INVENTORY = 'INVENTORY',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MIXED = 'MIXED',
}

export enum SyncStatus {
  SYNCED = 'SYNCED',
  PENDING = 'PENDING',
}

export enum StockEntryType {
  IMPORT = 'IMPORT',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  SYNC = 'SYNC',
}

export enum DebtType {
  SALE_DEBT = 'SALE_DEBT',
  PAYMENT = 'PAYMENT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export * from './reporting';
