import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as path from 'path';

/**
 * Seed script for demo/testing data.
 * Run: npx ts-node src/database/seeds/seed.ts
 */
async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgres://agrix:agrix_secret@localhost:5432/agrix',
    entities: [path.join(__dirname, '../../**/*.entity.{ts,js}')],
    synchronize: false,
  });

  await ds.initialize();
  console.log('Connected to database');

  // 0. Drop stale columns removed from entity (TypeORM sync doesn't drop columns)
  const staleCols = [
    { table: 'products', col: 'base_cost_price' },
    { table: 'products', col: 'usage_instructions' },
    { table: 'products', col: 'image_url' },
  ];
  for (const { table, col } of staleCols) {
    await ds.query(
      `ALTER TABLE ${table} DROP COLUMN IF EXISTS ${col}`,
    ).catch(() => {});
  }
  console.log('✅ Stale columns cleaned');

  // 1. Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await ds.query(
    `INSERT INTO users (id, username, password_hash, full_name, role, is_active)
     VALUES (gen_random_uuid(), 'admin', $1, 'Quản trị viên', 'ADMIN', true)
     ON CONFLICT (username) DO NOTHING`,
    [passwordHash],
  );

  // Create cashier user
  const cashierHash = await bcrypt.hash('cashier123', 10);
  await ds.query(
    `INSERT INTO users (id, username, password_hash, full_name, role, is_active)
     VALUES (gen_random_uuid(), 'thungan', $1, 'Thu Ngân', 'CASHIER', true)
     ON CONFLICT (username) DO NOTHING`,
    [cashierHash],
  );
  console.log('✅ Users seeded');

  // 2. Create categories
  const categories = [
    { name: 'Thuốc trừ sâu', description: 'Các loại thuốc bảo vệ thực vật' },
    { name: 'Phân bón', description: 'Phân hữu cơ, phân vô cơ, phân vi sinh' },
    { name: 'Hạt giống', description: 'Hạt giống rau, hoa, cây ăn trái' },
    { name: 'Dụng cụ', description: 'Dụng cụ nông nghiệp' },
  ];

  for (const cat of categories) {
    await ds.query(
      `INSERT INTO categories (id, name, description)
       VALUES (gen_random_uuid(), $1, $2)
       ON CONFLICT DO NOTHING`,
      [cat.name, cat.description],
    );
  }
  console.log('✅ Categories seeded');

  // 2b. Create base units
  const units = [
    { name: 'Kg', abbreviation: 'Kg', description: 'Kilogram' },
    { name: 'Gói', abbreviation: 'Gói', description: 'Gói / Bịch' },
    { name: 'Cái', abbreviation: 'Cái', description: 'Cái / Chiếc' },
    { name: 'Chai', abbreviation: 'Chai', description: 'Chai / Lọ' },
  ];
  for (const u of units) {
    await ds.query(
      `INSERT INTO units (id, name, abbreviation, description)
       VALUES (gen_random_uuid(), $1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [u.name, u.abbreviation, u.description],
    );
  }
  console.log('✅ Units seeded');

  // 3. Get category IDs
  const catRows = await ds.query(`SELECT id, name FROM categories`);
  const catMap = Object.fromEntries(catRows.map((c: any) => [c.name, c.id]));

  // 4. Create products (initial stock = 0, will be set via stock entries)
  const products = [
    { sku: 'TTS-001', name: 'Thuốc trừ sâu Regent 800WG', category: 'Thuốc trừ sâu', baseUnit: 'Gói', sellPrice: 22000, stock: 500, costPrice: 15000 },
    { sku: 'TTS-002', name: 'Thuốc diệt cỏ Gramaxone', category: 'Thuốc trừ sâu', baseUnit: 'Chai', sellPrice: 65000, stock: 200, costPrice: 45000 },
    { sku: 'PB-001', name: 'Phân NPK 16-16-8 Đầu Trâu', category: 'Phân bón', baseUnit: 'Kg', sellPrice: 12000, stock: 2000, costPrice: 8000 },
    { sku: 'PB-002', name: 'Phân hữu cơ vi sinh Sông Gianh', category: 'Phân bón', baseUnit: 'Kg', sellPrice: 8000, stock: 3000, costPrice: 5000 },
    { sku: 'HG-001', name: 'Hạt giống dưa leo F1', category: 'Hạt giống', baseUnit: 'Gói', sellPrice: 40000, stock: 150, costPrice: 25000 },
    { sku: 'HG-002', name: 'Hạt giống cà chua Savior', category: 'Hạt giống', baseUnit: 'Gói', sellPrice: 55000, stock: 100, costPrice: 35000 },
    { sku: 'DC-001', name: 'Bình xịt điện 20L', category: 'Dụng cụ', baseUnit: 'Cái', sellPrice: 650000, stock: 20, costPrice: 450000 },
  ];

  for (const p of products) {
    await ds.query(
      `INSERT INTO products (id, sku, name, category_id, base_unit, base_sell_price, current_stock_base, is_active)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true)
       ON CONFLICT (sku) DO NOTHING`,
      [p.sku, p.name, catMap[p.category], p.baseUnit, p.sellPrice, p.stock],
    );
  }
  console.log('✅ Products seeded');

  // 4b. Create stock entry IMPORT records for initial stock (data consistency)
  const adminRow = await ds.query(`SELECT id FROM users WHERE username = 'admin' LIMIT 1`);
  const adminId = adminRow[0]?.id;
  const prodRows = await ds.query(`SELECT id, sku FROM products`);
  const prodMap = Object.fromEntries(prodRows.map((r: any) => [r.sku, r.id]));

  for (const p of products) {
    const productId = prodMap[p.sku];
    if (!productId) continue;
    const now = new Date();
    const batchNumber = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${p.sku}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    await ds.query(
      `INSERT INTO stock_entries (id, product_id, quantity_base, type, cost_price_per_unit, batch_number, remaining_quantity, note, created_by)
       VALUES (gen_random_uuid(), $1, $2, 'IMPORT', $3, $4, $2, 'Nhập tồn kho ban đầu (seed)', $5)
       ON CONFLICT DO NOTHING`,
      [productId, p.stock, p.costPrice, batchNumber, adminId],
    );
  }
  console.log('✅ Stock entries seeded');

  // 5. Create unit conversions for NPK (Bao = 50kg)
  const npkRow = await ds.query(`SELECT id FROM products WHERE sku = 'PB-001'`);
  if (npkRow.length > 0) {
    await ds.query(
      `INSERT INTO product_unit_conversions (id, product_id, unit_name, conversion_factor)
       VALUES (gen_random_uuid(), $1, 'Bao 50kg', 50)
       ON CONFLICT DO NOTHING`,
      [npkRow[0].id],
    );
  }
  console.log('✅ Unit conversions seeded');

  // 6. Create demo customers
  const customers = [
    { name: 'Nguyễn Văn An', phone: '0901234567', address: 'Ấp 3, xã Tân Hiệp' },
    { name: 'Trần Thị Bình', phone: '0912345678', address: 'Thôn 2, xã Hòa Bình' },
    { name: 'Lê Minh Châu', phone: '0923456789', address: 'Ấp Long Thạnh, xã An Phú' },
  ];

  for (const c of customers) {
    await ds.query(
      `INSERT INTO customers (id, name, phone, address, outstanding_debt)
       VALUES (gen_random_uuid(), $1, $2, $3, 0)
       ON CONFLICT DO NOTHING`,
      [c.name, c.phone, c.address],
    );
  }
  console.log('✅ Customers seeded');

  // 7. Seed role permissions (ACL)
  const modules = ['products', 'orders', 'customers', 'blog', 'settings', 'units'];
  const permissionMatrix: Record<string, Record<string, [boolean, boolean, boolean, boolean]>> = {
    ADMIN: Object.fromEntries(modules.map(m => [m, [true, true, true, true]])),
    CASHIER: {
      products: [true, false, false, false],
      orders: [true, true, false, false],
      customers: [true, true, false, false],
      blog: [false, false, false, false],
      settings: [false, false, false, false],
      units: [true, false, false, false],
    },
    INVENTORY: {
      products: [true, true, true, false],
      orders: [true, false, false, false],
      customers: [false, false, false, false],
      blog: [false, false, false, false],
      settings: [false, false, false, false],
      units: [true, true, true, false],
    },
  };

  for (const [role, perms] of Object.entries(permissionMatrix)) {
    for (const [mod, [canRead, canCreate, canEdit, canDelete]] of Object.entries(perms)) {
      await ds.query(
        `INSERT INTO role_permissions (id, role, module, can_read, can_create, can_edit, can_delete)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
         ON CONFLICT (role, module) DO UPDATE SET can_read=$3, can_create=$4, can_edit=$5, can_delete=$6`,
        [role, mod, canRead, canCreate, canEdit, canDelete],
      );
    }
  }
  console.log('✅ Role permissions seeded');

  console.log('\n🎉 Seed complete! You can login with:');
  console.log('   Admin: admin / admin123');
  console.log('   Cashier: thungan / cashier123');

  await ds.destroy();
}

seed().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
