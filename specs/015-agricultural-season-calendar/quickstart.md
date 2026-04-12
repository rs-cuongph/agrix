# Quickstart: Lịch Mùa vụ Nông nghiệp

**Feature**: 015-agricultural-season-calendar  
**Date**: 2026-04-12

## Prerequisites

- Node.js 20+, npm/pnpm
- PostgreSQL 15+ đang chạy
- Backend NestJS đang chạy tại `http://localhost:3001`
- OpenAI hoặc Gemini API key đã cấu hình trong `.env`

## Không cần install dependency mới

Module dùng hoàn toàn các package đã có:
- TypeORM (database)
- @nestjs/* (NestJS core)
- shadcn/ui + lucide-react (frontend)

## Database Migration

```bash
cd apps/backend

# Generate migration sau khi thêm entities
npm run migration:generate -- src/database/migrations/015-season-calendar

# Chạy migration (tạo bảng + seed data)
npm run migration:run
```

## Chạy Development

```bash
# Terminal 1: Backend (nếu chưa chạy)
npm run backend:dev

# Terminal 2: Web admin
npm run web:dev
```

## Kiểm tra Feature

### Admin UI
1. Truy cập `http://localhost:3002/admin/season-calendar`
2. Chọn vùng "Đồng bằng Sông Cửu Long" → tháng 4
3. Thấy cây lúa trong giai đoạn "Đẻ nhánh" (seed data)
4. Click "Gợi ý sản phẩm" → thấy danh sách phân bón phù hợp

### API Test
```bash
# Lấy danh sách vùng
curl http://localhost:3001/api/season-calendar/zones

# Lịch mùa vụ tháng 4 vùng ĐBSCL
curl "http://localhost:3001/api/season-calendar/calendar?zoneId={uuid}&month=4"

# AI gợi ý sản phẩm
curl "http://localhost:3001/api/season-calendar/suggest?zoneId={uuid}&month=4&cropId={uuid}"
```

### Chatbot Test
```bash
# Mở chatbot trên web
# Nhập: "Cây lúa đang ở giai đoạn đẻ nhánh, nên dùng phân gì?"
# Kỳ vọng: Chatbot trả lời kèm danh sách sản phẩm phân bón
```

## Seed Data

Seed data MVP cho phiên bản đầu:
- 8 vùng nông nghiệp
- 10 cây trồng phổ biến
- Lịch lúa đầy đủ cho ĐBSCL (3 vụ × 5-6 giai đoạn)
- 10 product recommendations mẫu

Admin có thể bổ sung thêm qua giao diện quản trị.
