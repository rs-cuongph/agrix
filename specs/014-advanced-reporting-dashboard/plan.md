# Implementation Plan: Advanced Reporting Dashboard

**Branch**: `014-advanced-reporting-dashboard` | **Date**: 2026-04-12 | **Spec**: [spec.md](/Users/cuongph/Workspace/agrix/specs/014-advanced-reporting-dashboard/spec.md)
**Input**: Feature specification from `/specs/014-advanced-reporting-dashboard/spec.md`

## Summary

Mở rộng dashboard admin hiện tại để hỗ trợ báo cáo doanh thu theo nhiều cấp độ thời gian, bảng xếp hạng sản phẩm và khách hàng theo bộ lọc kỳ báo cáo, phân tích lợi nhuận gộp theo danh mục, và xuất báo cáo PDF/Excel cho nhu cầu in sổ sách. Thiết kế bám sát kiến trúc monorepo hiện có: NestJS backend tổng hợp dữ liệu từ orders, order_items, stock_entries, customers, categories; Next.js admin hiển thị dashboard và kích hoạt export; các hợp đồng API mới được tách rõ cho từng nhóm chỉ số để giữ tính độc lập và dễ cache.

## Technical Context

**Language/Version**: TypeScript 5.x trên Node.js cho backend NestJS và Next.js 14 cho web admin  
**Primary Dependencies**: NestJS 11, TypeORM 0.3, PostgreSQL, Next.js 14, React 18, shadcn/ui, Sonner, jsPDF  
**Storage**: PostgreSQL cho dữ liệu nghiệp vụ; file xuất được tạo theo yêu cầu từ dữ liệu truy vấn thời gian thực  
**Testing**: Jest cho backend; kiểm thử tích hợp API cho phép đối chiếu số liệu; kiểm thử UI/admin flow cho bộ lọc và export  
**Target Platform**: Backend API nội bộ và web admin chạy trên trình duyệt desktop trong monorepo Agrix  
**Project Type**: Ứng dụng web admin + backend API trong monorepo  
**Performance Goals**: Chuyển đổi kỳ báo cáo và tải đầy đủ dashboard trong khoảng 3 giây với dữ liệu cửa hàng thông thường; export hoàn tất đủ nhanh để phục vụ thao tác vận hành trong ngày  
**Constraints**: Phải giữ độ chính xác tài chính; không sai lệch giữa dashboard và file export; chỉ người dùng đã xác thực mới truy cập; UI admin tuân thủ shadcn/ui và toast rules; không dùng emoji icon trong UI mới  
**Scale/Scope**: Một dashboard admin, khoảng 5 nhóm chỉ số chính, dữ liệu tổng hợp trên orders, order_items, stock_entries, customers, categories, hỗ trợ kỳ ngày/tuần/tháng/năm và khoảng thời gian tùy chọn

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Mobile-First & Offline-First**: PASS. Tính năng nằm ở web admin, chỉ đọc dữ liệu đồng bộ từ backend, không thay đổi cơ chế offline của POS.
- **II. Monorepo Architecture**: PASS. Toàn bộ thay đổi dự kiến nằm trong `apps/backend`, `apps/web-base`, và có thể thêm kiểu dùng chung trong workspace hiện có.
- **III. Scalable Core (Modular Monolith)**: PASS. Báo cáo nâng cao được triển khai như phần mở rộng của dashboard domain, chỉ đọc dữ liệu qua ranh giới orders, inventory, customers.
- **IV. Traceability & Financial Accuracy**: PASS WITH CARE. Thiết kế bắt buộc dùng dữ liệu gốc `orders`, `order_items`, `stock_entries`, `customers` để đảm bảo truy vết doanh thu, giá vốn, và công nợ; cần quy định rõ cách xử lý thiếu giá vốn.
- **V. Simple & Intuitive UI**: PASS. Admin UI sẽ dùng shadcn/ui, hiển thị rõ bộ lọc và trạng thái rỗng; tất cả thao tác export phải có Sonner toast; tuyệt đối không dùng emoji icon trong phần UI mới.

**Post-Design Re-check**: PASS. Các artifact thiết kế giữ nguyên monorepo boundaries, không phá vỡ offline flow, dùng dữ liệu truy vết tài chính hiện có, và định nghĩa contract export/dashboard nhất quán với UI admin hiện tại.

## Project Structure

### Documentation (this feature)

```text
specs/014-advanced-reporting-dashboard/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── advanced-reporting.yaml
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── backend/
│   ├── src/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── inventory/
│   │   └── customers/
│   └── test/
├── web-base/
│   ├── src/
│   │   ├── app/admin/
│   │   ├── components/admin/
│   │   └── lib/
│   └── public/
packages/
└── shared/
    ├── typescript/
    └── dart/
docker/
└── docker-compose.yml
```

**Structure Decision**: Sử dụng cấu trúc web application hiện có của monorepo. Backend mở rộng `apps/backend/src/dashboard` để tổng hợp số liệu báo cáo từ các domain liên quan; frontend admin mở rộng `apps/web-base/src/app/admin` và `apps/web-base/src/components/admin`; kiểu dữ liệu chia sẻ có thể đặt ở `packages/shared/typescript` nếu cần tái sử dụng contract response.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
