# Research: Lịch Mùa vụ Nông nghiệp

**Feature**: 015-agricultural-season-calendar  
**Phase**: 0 — Research & Unknowns Resolution  
**Date**: 2026-04-12

## Q1: Cấu trúc Dữ liệu Lịch Mùa vụ

**Lựa chọn so sánh:**

| Approach | Pros | Cons |
|----------|------|------|
| Tháng (1-12) | Quen thuộc VN, đủ độ chính xác | Không capture tuần cụ thể |
| Tuần (1-52) | Chính xác hơn | Không quen với nông dân, data collection khó |
| Ngày cụ thể | Chính xác nhất | Over-engineered cho MVP, dữ liệu khó thu thập |

**Decision**: Month-based (`start_month`, `end_month` integer 1-12)  
**Cross-year support**: `start_month=11, end_month=2` → mùa Đông Xuân (tháng 11 → tháng 2 năm sau)  
**Implementation**: `if (end_month < start_month) → crosses year boundary`

## Q2: AI Gợi ý Sản phẩm — Approach

**Hybrid Rule-Based + LLM Ranking:**

```
Phase 1 — Database Query (fast, <500ms):
  SELECT products
  WHERE category.name IN ('Phân bón', 'Thuốc BVTV', 'Giống cây')
    AND products EXISTS IN product_recommendations
    WHERE growth_stage_id IN (giai đoạn hiện tại)
  ORDER BY recommendation.priority

Phase 2 — LLM Ranking + Explanation (optional enrichment):
  Input: question + top 5-10 products từ Phase 1
  Output: Ranked list + 1-2 câu giải thích tại sao phù hợp
  Timeout: 2500ms (fallback về Phase 1 results nếu LLM timeout)
```

**Decision**: Hybrid với graceful degradation  
**Rationale**: Phase 1 đảm bảo <1s. Phase 2 enrichment với LLM tăng chất lượng nhưng optional.

## Q3: Chatbot Integration — Keyword Detection

**Từ khóa crop mapping (seed data):**
```
"lúa", "lúa nước", "lúa mùa" → crop_id: [uuid lúa]
"ngô", "bắp" → crop_id: [uuid ngô]
"cà phê", "cafe" → crop_id: [uuid cà phê]
...
```

**Từ khóa growth stage mapping:**
```
"đẻ nhánh", "đẻ chồi" → growth_stage: "Đẻ nhánh"
"trổ bông", "làm đòng" → growth_stage: "Trổ bông"
"chín", "thu hoạch" → growth_stage: "Thu hoạch"
```

**Detection algorithm:**
```typescript
// Keyword matching + fuzzy search trong SeasonChatbotContextService
function detectSeasonIntent(question: string): {
  cropKeywords: string[];
  stageKeywords: string[];
} {
  // Normalize Vietnamese (remove diacritics)
  // Match against crop/stage keyword lists
  // Return matches for DB lookup
}
```

**Fallback**: Nếu không detect được crop/stage → không inject context (chatbot trả lời general knowledge).

## Q4: Admin Calendar UI

**Grid Layout Analysis:**
- 12 cột (tháng 1-12) × N hàng (cây trồng)
- Ô giao nhau hiển thị: màu giai đoạn, tên giai đoạn ngắn
- Color coding: Gieo trồng (xanh lá), Chăm sóc (xanh dương), Thu hoạch (vàng cam)

**Decision**: Custom CSS Grid trong React component  
**Shadcn components used**: `Select` (zone filter), `Badge` (giai đoạn tag), `Card` (product card), `Table` (list view alternative), `Dialog` (edit form)

## Vùng Nông nghiệp Seed Data (8 vùng)

| ID | Tên vùng | Tỉnh đại diện |
|----|----------|----------------|
| 1 | Tây Bắc | Sơn La, Điện Biên, Lai Châu |
| 2 | Đông Bắc | Lạng Sơn, Cao Bằng, Hà Giang |
| 3 | Đồng bằng Sông Hồng | Hà Nội, Nam Định, Thái Bình |
| 4 | Bắc Trung Bộ | Thanh Hóa, Nghệ An, Hà Tĩnh |
| 5 | Nam Trung Bộ | Đà Nẵng, Quảng Nam, Bình Định |
| 6 | Tây Nguyên | Đắk Lắk, Gia Lai, Lâm Đồng |
| 7 | Đông Nam Bộ | TP.HCM, Đồng Nai, Bình Dương |
| 8 | Đồng bằng Sông Cửu Long | Cần Thơ, An Giang, Kiên Giang |

## Cây trồng MVP (10 cây)

Lúa, Ngô, Đậu tương, Rau cải, Cà chua, Cà phê, Tiêu, Mía, Chuối, Lúa mì (miền núi)

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|-----------|
| Dữ liệu mùa vụ ban đầu chưa có | High | Seed data MVP cho lúa (3 mùa × 8 vùng) trong database migration; rõ ràng "Demo data" trong UI |
| LLM timeout khi gợi ý sản phẩm | Medium | Hybrid approach với fallback DB-only response <500ms |
| Chatbot keyword detection sai (false positive) | Medium | Conservative matching — chỉ inject context khi confidence cao; log tất cả detects để review |
| Product category mapping chưa đồng nhất | Medium | Tạo seed mapping `category → use_case` trong DB; admin có thể điều chỉnh |
