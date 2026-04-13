# Data Model: Quản lý Mùa vụ & AI Sinh Lịch Canh tác

**Feature**: 018-ai-calendar-admin  
**Phase**: 1 — Design  
**Date**: 2026-04-13

## Schema — No New Tables

Feature 018 **KHÔNG tạo bảng mới**. Tất cả entities đã tồn tại từ feature 015 + 017:

| Entity | Table | Feature | Status |
|--------|-------|---------|--------|
| SeasonCalendar | `season_calendars` | 015 | ✅ Existing |
| GrowthStage | `growth_stages` | 015 + 017 (careActivities) | ✅ Existing |
| ProductRecommendation | `product_recommendations` | 015 | ✅ Existing |
| PestWarning | `pest_warnings` | 017 | ✅ Existing |
| PestWarningProduct | `pest_warning_products` | 017 | ✅ Existing |
| AgriculturalZone | `agricultural_zones` | 015 | ✅ Existing |
| Crop | `crops` | 015 | ✅ Existing |

## New Service Methods Only

### SeasonCalendarService — New Methods

```typescript
// List all calendars with related info (for manage table)
async listCalendars(filters?: { zoneId?: string; cropId?: string }): Promise<{
  items: CalendarListItem[];
  total: number;
}>

// Bulk create calendars + stages + pest warnings in 1 transaction
async bulkCreate(zoneId: string, cropId: string, data: AiGenerateResult): Promise<{
  calendarsCreated: number;
  stagesCreated: number;
}>
```

### AiCalendarGeneratorService — New Service

```typescript
// Generate season calendar data via AI
async generate(request: {
  zoneId: string;
  cropId: string;
  userNotes?: string;
}): Promise<AiGenerateResult>
```

### AiGenerateResult Type

```typescript
interface AiGenerateResult {
  seasons: {
    seasonName: string;
    notes?: string;
    stages: {
      name: string;
      stageType: 'planting' | 'care' | 'harvest';
      startMonth: number;  // 1-12
      endMonth: number;    // 1-12
      description?: string;
      keywords?: string[];
      careActivities?: string[];
      sortOrder: number;
      pestWarnings?: {
        name: string;
        severity: 'low' | 'medium' | 'high';
        symptoms?: string;
        preventionNote?: string;
      }[];
    }[];
  }[];
}
```

## Migration Plan

Không cần migration — tất cả schema đã có sẵn.
