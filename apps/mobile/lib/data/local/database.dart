import 'package:drift/drift.dart';
import 'dart:io';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'database.g.dart';

// ──── Tables ────

class Products extends Table {
  TextColumn get id => text()();
  TextColumn get sku => text().unique()();
  TextColumn get name => text()();
  TextColumn get categoryId => text()();
  TextColumn get baseUnit => text()();
  IntColumn get baseCostPrice => integer()();
  IntColumn get baseSellPrice => integer()();
  IntColumn get currentStockBase => integer().withDefault(const Constant(0))();
  IntColumn get minStockThreshold => integer().withDefault(const Constant(0))();
  TextColumn get expirationDate => text().nullable()();
  TextColumn get usageInstructions => text().nullable()();
  TextColumn get description => text().nullable()();
  TextColumn get barcodeEan13 => text().nullable()();
  TextColumn get qrCodeInternal => text().nullable()();
  TextColumn get imageUrl => text().nullable()();
  BoolColumn get isActive => boolean().withDefault(const Constant(true))();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

class ProductUnits extends Table {
  TextColumn get id => text()();
  TextColumn get productId => text().references(Products, #id)();
  TextColumn get unitName => text()();
  IntColumn get conversionFactor => integer()();

  @override
  Set<Column> get primaryKey => {id};
}

class Customers extends Table {
  TextColumn get id => text()();
  TextColumn get name => text()();
  TextColumn get phone => text().nullable()();
  TextColumn get address => text().nullable()();
  IntColumn get outstandingDebt => integer().withDefault(const Constant(0))();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

class Orders extends Table {
  TextColumn get id => text()();
  TextColumn get customerId => text().nullable()();
  IntColumn get totalAmount => integer()();
  IntColumn get paidAmount => integer()();
  TextColumn get paymentMethod => text()(); // CASH, BANK_TRANSFER, MIXED
  TextColumn get syncStatus => text().withDefault(const Constant('PENDING'))();
  TextColumn get idempotencyKey => text().unique()();
  TextColumn get createdBy => text()();
  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

class OrderItems extends Table {
  TextColumn get id => text()();
  TextColumn get orderId => text().references(Orders, #id)();
  TextColumn get productId => text()();
  IntColumn get quantityBase => integer()();
  TextColumn get soldUnit => text()();
  IntColumn get unitPrice => integer()();
  IntColumn get lineTotal => integer()();

  @override
  Set<Column> get primaryKey => {id};
}

class StockEntries extends Table {
  TextColumn get id => text()();
  TextColumn get productId => text().references(Products, #id)();
  IntColumn get quantityBase => integer()();
  TextColumn get type => text()(); // IMPORT, SALE, ADJUSTMENT, SYNC
  TextColumn get batchNumber => text().nullable()();
  TextColumn get referenceId => text().nullable()();
  TextColumn get createdBy => text()();
  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

// ──── Sync Queue ────

class SyncQueue extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get entityType => text()(); // order, stockEntry
  TextColumn get entityId => text()();
  TextColumn get payload => text()(); // JSON
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  DateTimeColumn get createdAt => dateTime()();
}

// ──── Database Definition ────

@DriftDatabase(tables: [
  Products,
  ProductUnits,
  Customers,
  Orders,
  OrderItems,
  StockEntries,
  SyncQueue,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  static LazyDatabase _openConnection() {
    return LazyDatabase(() async {
      final dbFolder = await getApplicationDocumentsDirectory();
      final file = File(p.join(dbFolder.path, 'agrix.sqlite'));
      return NativeDatabase.createInBackground(file);
    });
  }
}
