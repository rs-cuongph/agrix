# Implementation Plan: Lịch Mùa vụ Nông nghiệp

**Branch**: `015-agricultural-season-calendar` | **Date**: 2026-04-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/015-agricultural-season-calendar/spec.md`

## Summary

Xây dựng module Lịch Mùa vụ Nông nghiệp cho nền tảng Agrix, bao gồm: (1) backend NestJS quản lý dữ liệu lịch mùa vụ theo vùng và cây trồng với PostgreSQL, (2) tính năng AI gợi ý sản phẩm theo giai đoạn mùa vụ bằng cách join với danh mục hàng hóa hiện có, và (3) tích hợp ngữ cảnh mùa vụ vào chatbot hiện tại (RAG-enhanced) để trả lời câu hỏi canh tác kèm sản phẩm gợi ý.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 (backend NestJS), TypeScript 5.x / React 18 (Next.js 14 frontend admin), Dart/Flutter (mobile — không implement trong phase này)  
**Primary Dependencies**: NestJS 11, TypeORM 0.3, PostgreSQL 15; Next.js 14 + shadcn/ui + Recharts (calendar view); OpenAI/Gemini API (AI gợi ý); ChatbotService (tích hợp ngữ cảnh mùa vụ)  
**Storage**: PostgreSQL (bảng mới: `agricultural_zones`, `crops`, `season_calendars`, `growth_stages`, `product_recommendations`)  
**Testing**: Jest (NestJS unit tests), Supertest (e2e integration tests)  
**Target Platform**: Web Admin (Next.js) + API REST; Mobile (future)  
**Project Type**: Web application (monorepo — NestJS backend + Next.js admin)  
**Performance Goals**: Tra cứu lịch mùa vụ < 5 giây; AI gợi ý sản phẩm < 3 giây  
**Constraints**: Dữ liệu mùa vụ ban đầu nhập thủ công; AI gợi ý dùng AI đã có (không thêm provider mới); Chatbot tích hợp qua `productContext` của `ChatbotService.ask()` (đã có)  
**Scale/Scope**: ~8 vùng, ~20 cây trồng, ~100 lịch mùa vụ trong MVP; admin giao diện quản lý CRUD

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Mobile-First & Offline-First | ⚠️ Partial | Web admin không offline (acceptable). Mobile Flutter (Phase 2+) cần offline cache lịch mùa vụ — không trong scope MVP này. |
| II. Monorepo Architecture | ✅ Pass | Module mới nằm trong `apps/backend/src/season-calendar/` và `apps/web-base/src/app/admin/season-calendar/` — cùng monorepo. |
| III. Scalable Core (Modular Monolith) | ✅ Pass | Tạo `SeasonCalendarModule` độc lập, bounded context rõ ràng. Import `InventoryModule` để access products — không phá vỡ boundary. |
| IV. Traceability & Financial Accuracy | ✅ Pass | Không ảnh hưởng đến giao dịch tài chính. Gợi ý sản phẩm là read-only. |
| V. Simple & Intuitive UI | ✅ Pass | shadcn/ui + lucide-react icons + Sonner toast cho CRUD. Không dùng emoji. Calendar view dùng shadcn primitives. |

**Violations**: Không có.

## Project Structure

### Documentation (this feature)

```text
specs/015-agricultural-season-calendar/
├── plan.md              ← file này
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── contracts/           ← Phase 1 output
│   └── api.md
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← /speckit.tasks output (NOT created here)
```

### Source Code (repository root)

```text
apps/backend/src/
└── season-calendar/                           # [NEW MODULE]
    ├── season-calendar.module.ts              # [NEW]
    ├── entities/
    │   ├── agricultural-zone.entity.ts        # [NEW] Vùng nông nghiệp
    │   ├── crop.entity.ts                     # [NEW] Cây trồng
    │   ├── season-calendar.entity.ts          # [NEW] Lịch mùa vụ
    │   ├── growth-stage.entity.ts             # [NEW] Giai đoạn sinh trưởng
    │   └── product-recommendation.entity.ts   # [NEW] Sản phẩm gợi ý theo giai đoạn
    ├── dto/
    │   ├── create-zone.dto.ts                 # [NEW]
    │   ├── create-crop.dto.ts                 # [NEW]
    │   ├── create-season-calendar.dto.ts      # [NEW]
    │   ├── season-suggestion.dto.ts           # [NEW] AI gợi ý sản phẩm response
    │   └── chatbot-season-context.dto.ts      # [NEW] Context inject vào chatbot
    ├── controllers/
    │   ├── zones.controller.ts                # [NEW] GET/POST/PATCH/DELETE zones
    │   ├── crops.controller.ts                # [NEW] GET/POST/PATCH/DELETE crops
    │   ├── season-calendar.controller.ts      # [NEW] GET lịch mùa vụ (public + admin)
    │   └── season-suggestion.controller.ts   # [NEW] GET AI gợi ý sản phẩm
    └── services/
        ├── zones.service.ts                   # [NEW]
        ├── crops.service.ts                   # [NEW]
        ├── season-calendar.service.ts         # [NEW]
        ├── season-suggestion.service.ts       # [NEW] AI logic gợi ý
        └── season-chatbot-context.service.ts  # [NEW] Inject mùa vụ vào chatbot

apps/backend/src/ai/
└── ai.controller.ts                           # [MODIFY] inject SeasonChatbotContextService

apps/web-base/src/app/admin/
└── season-calendar/                           # [NEW ADMIN SECTION]
    ├── page.tsx                               # Calendar overview page
    ├── zones/
    │   └── page.tsx                           # CRUD zones
    ├── crops/
    │   └── page.tsx                           # CRUD crops
    └── components/
        ├── SeasonCalendarGrid.tsx             # Grid/calendar view tháng × cây trồng
        ├── ZoneSelector.tsx                   # Dropdown chọn vùng
        └── ProductSuggestionPanel.tsx         # Panel gợi ý sản phẩm theo mùa

apps/backend/src/app.module.ts                 # [MODIFY] import SeasonCalendarModule
```

## Complexity Tracking

Không có violation. Module mới là bounded context rõ ràng, không vi phạm kiến trúc monolith.

---

## Phase 0: Research

*Output: [research.md](./research.md)*

### Câu hỏi cần giải quyết

1. **Cấu trúc dữ liệu mùa vụ** — Lịch theo tháng (start/end month) hay theo tuần/ngày?
2. **AI gợi ý sản phẩm** — Dùng LLM call hay rule-based matching từ tag/category trong PostgreSQL?
3. **Chatbot integration** — Inject context như thế nào vào `ChatbotService.ask()` đã có?
4. **Admin calendar UI** — Grid tùy chỉnh hay dùng component có sẵn?

### Kết quả Research

#### Decision 1: Cấu trúc lịch theo tháng

- **Decision**: Lưu `start_month` (integer 1-12) và `end_month` (integer 1-12) cho mỗi giai đoạn sinh trưởng
- **Rationale**: Đủ độ chính xác cho nông nghiệp Việt Nam. Tuần/ngày quá chi tiết cho MVP và dữ liệu ban đầu từ chuyên gia sẽ ở dạng tháng. Hỗ trợ cross-year (ví dụ: start_month=11, end_month=2 = tháng 11 đến tháng 2 năm sau).
- **Alternatives**: Ngày cụ thể (quá chi tiết), tuần trong năm (không quen thuộc với người dùng VN)

#### Decision 2: AI Gợi ý Sản phẩm

- **Decision**: Hybrid approach — Rule-based matching từ product categories + AI ranking/explanation
  1. Query products theo category_id (phân bón, thuốc BVTV) + tag giai đoạn
  2. Dùng LLM (OpenAI/Gemini có sẵn) để rank và explain kết quả
- **Rationale**: Pure LLM tốn API call nhiều và chậm (>3s). Pure rule-based thiếu intelligence và khó maintain. Hybrid cho kết quả tốt và dưới 3s.
- **Alternatives**: Vector similarity search (cần embedding, over-engineered cho MVP)

#### Decision 3: Chatbot Integration

- **Decision**: Inject mùa vụ context vào `productContext` param của `ChatbotService.ask()` khi chatbot detect ý định mùa vụ
- **Rationale**: `ChatbotService.ask(question, productContext?)` đã có sẵn, chỉ cần bổ sung service detect & build context. Không cần thay đổi core chatbot logic.
- **Flow**:
  1. `ai.controller.ts` nhận câu hỏi
  2. `SeasonChatbotContextService.buildContext(question)` — detect từ khóa cây trồng + giai đoạn → query lịch mùa vụ + sản phẩm gợi ý
  3. Pass context vào `chatbotService.ask(question, seasonContext)`
- **Alternatives**: Tạo chatbot riêng cho mùa vụ (rejected — duplicate chatbot infra)

#### Decision 4: Admin Calendar UI

- **Decision**: Grid tự custom (CSS Grid) với shadcn/ui primitives (Select, Card, Badge, Table)
- **Rationale**: Không có shadcn calendar component phù hợp cho dạng "cây trồng × tháng". Custom grid đơn giản hơn import thư viện nặng như FullCalendar. Dùng Recharts chỉ nếu cần chart, không cần cho calendar grid.
- **Implementation**: 12 cột = 12 tháng, các row = cây trồng, ô giao nhau = giai đoạn sinh trưởng

---

## Phase 1: Design & Contracts

### Data Model

*Output: [data-model.md](./data-model.md)*

Xem chi tiết schema 5 bảng mới tại [data-model.md](./data-model.md).

### API Contracts

*Output: [contracts/api.md](./contracts/api.md)*

#### Core Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/season-calendar/zones` | Danh sách 8 vùng nông nghiệp |
| GET | `/api/season-calendar/crops` | Danh sách cây trồng |
| GET | `/api/season-calendar/calendar?zoneId=&month=` | Lịch mùa vụ theo vùng và tháng |
| GET | `/api/season-calendar/suggest?zoneId=&month=&cropId=` | AI gợi ý sản phẩm |
| POST/PATCH/DELETE | `/api/admin/season-calendar/...` | Admin CRUD endpoints |

Xem chi tiết: [contracts/api.md](./contracts/api.md)

### Chatbot Integration Flow

```
Người dùng: "Cây lúa đang ở giai đoạn đẻ nhánh, nên dùng phân gì?"
                         ↓
         ai.controller.ts nhận request
                         ↓
SeasonChatbotContextService.buildContext(question):
  1. Detect keywords: "lúa" → crop_id | "đẻ nhánh" → growth_stage
  2. Query SeasonCalendar cho giai đoạn "đẻ nhánh" của cây lúa
  3. Query ProductRecommendation → list sản phẩm phân bón phù hợp
  4. Build context string: "Giai đoạn đẻ nhánh cây lúa cần: [Phân DAP - 150.000đ/kg], [Phân Urê - 12.000đ/kg]..."
                         ↓
ChatbotService.ask(question, seasonContext)
  → RAG search knowledge base
  → LLM answer với full context (knowledge + season products)
                         ↓
Response: Câu trả lời chuyên sâu + danh sách sản phẩm mua được
```

### Quickstart

*Xem: [quickstart.md](./quickstart.md)*
