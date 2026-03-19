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

  // 3. Get category IDs
  const catRows = await ds.query(`SELECT id, name FROM categories`);
  const catMap = Object.fromEntries(catRows.map((c: any) => [c.name, c.id]));

  // 4. Create products
  const products = [
    { sku: 'TTS-001', name: 'Thuốc trừ sâu Regent 800WG', category: 'Thuốc trừ sâu', baseUnit: 'Gói', costPrice: 15000, sellPrice: 22000, stock: 500 },
    { sku: 'TTS-002', name: 'Thuốc diệt cỏ Gramaxone', category: 'Thuốc trừ sâu', baseUnit: 'Chai', costPrice: 45000, sellPrice: 65000, stock: 200 },
    { sku: 'PB-001', name: 'Phân NPK 16-16-8 Đầu Trâu', category: 'Phân bón', baseUnit: 'Kg', costPrice: 8000, sellPrice: 12000, stock: 2000 },
    { sku: 'PB-002', name: 'Phân hữu cơ vi sinh Sông Gianh', category: 'Phân bón', baseUnit: 'Kg', costPrice: 5000, sellPrice: 8000, stock: 3000 },
    { sku: 'HG-001', name: 'Hạt giống dưa leo F1', category: 'Hạt giống', baseUnit: 'Gói', costPrice: 25000, sellPrice: 40000, stock: 150 },
    { sku: 'HG-002', name: 'Hạt giống cà chua Savior', category: 'Hạt giống', baseUnit: 'Gói', costPrice: 35000, sellPrice: 55000, stock: 100 },
    { sku: 'DC-001', name: 'Bình xịt điện 20L', category: 'Dụng cụ', baseUnit: 'Cái', costPrice: 450000, sellPrice: 650000, stock: 20 },
  ];

  for (const p of products) {
    await ds.query(
      `INSERT INTO products (id, sku, name, category_id, base_unit, base_cost_price, base_sell_price, current_stock_base, is_active)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, true)
       ON CONFLICT (sku) DO NOTHING`,
      [p.sku, p.name, catMap[p.category], p.baseUnit, p.costPrice, p.sellPrice, p.stock],
    );
  }
  console.log('✅ Products seeded');

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

  console.log('\n🎉 Seed complete! You can login with:');
  console.log('   Admin: admin / admin123');
  console.log('   Cashier: thungan / cashier123');

  await ds.destroy();
}

seed().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
