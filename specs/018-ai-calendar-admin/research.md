# Research: Quản lý Mùa vụ & AI Sinh Lịch Canh tác

**Feature**: 018-ai-calendar-admin  
**Date**: 2026-04-13

## 1. AI Generate — Structured JSON Approach

**Decision**: Dùng JSON mode response (OpenAI `response_format: { type: "json_object" }` / Gemini `responseMimeType: "application/json"`)

**Rationale**: AI cần trả về structured data (mùa vụ, giai đoạn, thời gian, pestWarnings...) — free-text sẽ cần parse phức tạp và error-prone. JSON mode đảm bảo output luôn valid JSON. Cả OpenAI lẫn Gemini đều hỗ trợ.

**Alternatives considered**:
- Free-text + regex parsing: Fragile, không đáng tin cậy
- Function calling: Over-engineered cho single-shot generation
- JSON mode: ✅ Simple, reliable, supported by both providers

**JSON schema expected from AI**:
```json
{
  "seasons": [
    {
      "seasonName": "Vụ Đông Xuân",
      "notes": "...",
      "stages": [
        {
          "name": "Gieo sạ",
          "stageType": "planting",
          "startMonth": 11,
          "endMonth": 12,
          "description": "...",
          "keywords": ["gieo sạ", "xuống giống"],
          "careActivities": ["Xử lý giống", "Bón lót"],
          "pestWarnings": [
            {
              "name": "Rầy nâu",
              "severity": "high",
              "symptoms": "...",
              "preventionNote": "..."
            }
          ]
        }
      ]
    }
  ]
}
```

## 2. AI Generate — Service Architecture

**Decision**: New `AiCalendarGeneratorService` in season-calendar module, reusing `ChatbotService` for LLM communication

**Rationale**: 
- Không nên gọi ChatbotService trực tiếp vì: (a) ChatbotService gắn với RAG chunks — không cần ở đây, (b) ChatbotService streaming không cần — chỉ cần 1 response hoàn chỉnh.
- Thay vào đó: copy pattern `callWithFallback` + `callOpenAI` / `callGemini` nhưng với JSON mode và prompt riêng biệt.
- Inject `ChatConfigService` (đã có) để lấy API keys + provider config.

**AI Prompt Strategy**:
```
System: Bạn là chuyên gia nông nghiệp Việt Nam. Sinh lịch mùa vụ cho cây [{crop.name}] 
tại vùng [{zone.name}] ({zone.provinces.join(', ')}). 

Yêu cầu: Trả về JSON gồm danh sách các mùa vụ phổ biến, mỗi mùa vụ có giai đoạn 
sinh trưởng với thời gian (tháng), hoạt động chăm sóc, và cảnh báo sâu bệnh thường gặp.
Thông tin thêm từ admin: [{userNotes}]

JSON schema: { "seasons": [...] }
```

## 3. Batch Save — Transaction Strategy

**Decision**: TypeORM `DataSource.transaction()` wrapping tất cả inserts

**Rationale**: Spec yêu cầu atomic save — hoặc tất cả thành công, hoặc rollback toàn bộ. TypeORM transaction manager cho phép pass `EntityManager` qua tất cả repo operations.

**Implementation**:
```typescript
await this.dataSource.transaction(async (manager) => {
  for (const season of data.seasons) {
    const calendar = await manager.save(SeasonCalendar, { ... });
    for (const stage of season.stages) {
      const savedStage = await manager.save(GrowthStage, { ...stage, seasonCalendarId: calendar.id });
      for (const pw of stage.pestWarnings ?? []) {
        await manager.save(PestWarning, { ...pw, growthStageId: savedStage.id });
      }
    }
  }
});
```

## 4. Admin List Calendars — Missing Endpoint

**Decision**: Thêm GET endpoint `GET /admin/season-calendar/calendars` vào AdminCalendarController

**Rationale**: Controller hiện chỉ có POST/PATCH/DELETE — thiếu GET list. Frontend manage page cần list tất cả calendars (with related zone, crop info + stage count) để hiển thị bảng.

**Response shape**:
```json
{
  "items": [
    {
      "id": "uuid",
      "seasonName": "Vụ Đông Xuân",
      "zone": { "id": "uuid", "name": "ĐBSCL", "code": "DBSCL" },
      "crop": { "id": "uuid", "name": "Lúa", "category": "Lúa gạo" },
      "stageCount": 4,
      "isActive": true,
      "createdAt": "2026-04-13T00:00:00Z"
    }
  ],
  "total": 12
}
```

## 5. Manage Page — Routing & Navigation

**Decision**: `/admin/season-calendar/manage` (list) + `/admin/season-calendar/manage/[id]` (detail)

**Rationale**: 
- List page: bảng tất cả calendars, filter theo zone + crop, nút "Thêm mùa vụ" + "AI tạo lịch"
- Detail page: xem 1 calendar chi tiết — list stages (accordion), CRUD stages, recommendations, pest warnings
- Tách riêng khỏi trang lịch view chính (per clarification Q1)

**Navigation**: Thêm nút "Quản lý dữ liệu" vào trang calendar chính, bên cạnh "Quản lý vùng" + "Quản lý cây trồng"

## 6. AI Preview — Frontend State Management

**Decision**: React useState + client-side editing, không persist preview

**Rationale**: 
- Preview data là transient — chỉ tồn tại trong dialog session
- Không cần global state (Redux/Zustand) vì scope hẹp (1 dialog)
- useState đủ cho: edit season name, remove season, edit stage fields, add/remove careActivities, add/remove pestWarnings
- On "Lưu tất cả" → gửi final edited data lên backend batch endpoint

## Summary of Dependencies (NPM)

Không cần thêm dependency mới — tất cả dùng existing:
- shadcn/ui: Table, Dialog, Select, Accordion, Badge, Input, Textarea, Skeleton
- lucide-react: Database, Plus, Pencil, Trash2, Sparkles icons
- Sonner: toasts
- Recharts: không cần cho feature này
