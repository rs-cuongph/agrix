# Research: Nâng cấp UX Lịch Mùa vụ

**Feature**: 017-calendar-ux-enhance  
**Date**: 2026-04-13

## 1. Gantt Timeline — UI Strategy

**Decision**: CSS Grid thuần (không dùng thư viện Gantt bên ngoài)

**Rationale**: Dữ liệu rất đơn giản (12 cột tháng, N hàng cây trồng, bars = gridColumn spans). Thư viện như `gantt-task-react` hoặc `frappe-gantt` quá nặng (~50-100KB) cho use case đơn giản này và khó customize style cho shadcn/ui. CSS Grid với `grid-column: startMonth / endMonth+1` cho kết quả tương đương.

**Alternatives considered**:
- `frappe-gantt`: Heavy dependency, DOM-based, không tích hợp React tốt
- `gantt-task-react`: TypeScript nhưng ~80KB, over-engineered cho 12 cột cố định
- Recharts BarChart: Có thể nhưng thiếu tính năng click/hover chính xác trên segment

**Implementation approach**:
```
<div style="display: grid; grid-template-columns: 180px repeat(12, 1fr)">
  <!-- Header row: crop name | T1 | T2 | ... | T12 -->
  <!-- Per crop row: name cell + bar cells spanning startMonth→endMonth -->
</div>
```

Cross-year bars (startMonth > endMonth): Render 2 bar segments — segment 1 từ startMonth→12, segment 2 từ 1→endMonth. Cùng màu + dashed border giữa để visual indicator "cùng giai đoạn".

"Hôm nay" indicator: Absolute-positioned div overlay ở cột = currentMonth, z-index trên bars, 2px solid red line + label.

## 2. Enriched Stage Detail — Data Strategy

**Decision**: Mở rộng growth_stages (thêm trường careActivities text[]) + bảng riêng pest_warnings (FK đến growth_stages và products)

**Rationale**: 
- `careActivities` là text[] đơn giản (checklist items: "Bón phân đạm 40kg/ha", "Tưới nước giữ 5cm") — không cần relationship phức tạp.
- `pestWarnings` cần link đến products (sản phẩm phòng trị) → bảng riêng cho phép N:N với products, có trường severity, symptoms riêng.

**Checklist UX**: Client-side only. Dùng React `useState` lưu checked items theo stageId. Không persist — reset mỗi lần mở Sheet. Giữ đơn giản.

## 3. Weather Baseline — Data Source

**Decision**: Dữ liệu tĩnh seed từ Wikipedia/Tổng cục Khí tượng Thủy văn VN, lưu trong bảng `weather_baselines`

**Rationale**: Không cần realtime weather API (chi phí, complexity). Dữ liệu khí hậu trung bình 8 vùng × 12 tháng = 96 rows — seed 1 lần, admin có thể chỉnh sửa.

**Data shape**: (zone_id, month, avg_temp_c, avg_rainfall_mm) — đơn giản nhất. Không cần min/max temp hay humidity.

**Visualization**: Mini bar chart (rainfall) + line (temperature) dùng inline SVG hoặc Recharts (đã có trong project). Recharts đã bundle → dùng luôn `<ResponsiveContainer><ComposedChart>`.

## 4. Activity Log — Implementation Pattern

**Decision**: Synchronous INSERT vào bảng `season_activity_logs` trong cùng transaction với CRUD operation

**Rationale**: 
- Message queue quá phức tạp cho volume thấp (~100 ops/day)
- TypeORM subscriber/listener có thể dùng nhưng khó pass actor (user) context → viết explicit trong service methods
- Purge: Scheduled CRON job (NestJS `@Cron`) chạy daily, DELETE WHERE created_at < NOW() - 6 months

**Alternatives considered**:
- TypeORM subscriber: Tự động nhưng thiếu actor context (user info không có trong subscriber)
- Event-driven (Redis pub/sub): Over-engineered cho use case này
- Soft delete + archive: Không cần — purge là đủ

## 5. Search Strategy — Frontend Filtering

**Decision**: Client-side filtering (không cần API call mới)

**Rationale**: Calendar page đã fetch toàn bộ crops + season data cho vùng đang chọn. Search chỉ filter array đã có trong memory. localNames matching đã có trong crop entity.

**Implementation**: `filteredItems.filter(item => item.crop.name.toLowerCase().includes(keyword) || item.crop.localNames?.some(n => n.includes(keyword)))`

Debounce input 200ms. Match highlight dùng Badge component.

## 6. Multi-Season Overlay — UX Approach

**Decision**: Multi-select dropdown cho crops + hiển thị trên cùng Gantt timeline

**Rationale**: Overlay mode = bản mở rộng của Timeline view. Thay vì hiển thị tất cả crops, user chọn subset. Timeline tự động chỉ hiện selected crops. Workload summary = computed từ data đã có.

**Alternatives considered**:
- Separate overlay component: Code duplication với Timeline
- Stacked bars per month: Khó đọc khi > 3 crops
- → Preserved separate rows per crop, compact height

## 7. View Mode Toggle Architecture

**Decision**: 3-mode toggle (Grid / Table / Timeline) cùng tồn tại, giữ cùng data source

**Rationale**: 
- Grid và Table đã hoạt động tốt
- Timeline bổ sung perspective mới mà Grid/Table không đạt được
- Cùng `calendar.items` data → không cần API call mới khi switch view
- Toggle UI: shadcn `Tabs` hoặc `ToggleGroup` — đã dùng Button group trong existing impl

## Summary of Dependencies (NPM)

Không cần thêm dependency mới:
- Recharts: đã có (cho WeatherOverlay mini chart)
- shadcn/ui: đã có (Tabs, Badge, Card, Sheet, etc.)
- lucide-react: đã có (CalendarDays, Search, Activity icons)
- Sonner: đã có (toast notifications)

Sole new NPM: **none** — tất cả dùng existing dependencies.
