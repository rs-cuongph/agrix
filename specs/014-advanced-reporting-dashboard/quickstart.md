# Quickstart: Advanced Reporting Dashboard

## Goal

Triển khai và xác minh dashboard báo cáo nâng cao cho admin, bao gồm xem số liệu theo kỳ và xuất PDF/Excel.

## Prerequisites

- Dữ liệu seed hoặc dữ liệu test phải có:
  - đơn hàng hoàn tất ở nhiều ngày khác nhau
  - order items thuộc nhiều danh mục
  - stock entries loại SALE có giá vốn theo batch
  - khách hàng có lịch sử mua hàng và một số dư công nợ
- Người dùng admin có thể đăng nhập vào `apps/web-base` và gọi được backend `/api/v1`.

## Implementation Steps

1. Mở rộng backend dashboard:
   - thêm service tổng hợp báo cáo nâng cao trong `apps/backend/src/dashboard`
   - bổ sung các endpoint cho revenue series, gross profit by category, top customers, và export
   - giữ endpoint hiện có hoặc chuyển dần sang contract mới mà không làm hỏng dashboard admin hiện tại
2. Chuẩn hóa logic truy vấn:
   - áp dụng cùng `granularity`, `from`, `to` cho mọi truy vấn
   - chỉ lấy đơn hợp lệ cho báo cáo doanh thu
   - dùng `stock_entries` loại SALE để tính giá vốn thực tế
   - đánh dấu các danh mục thiếu giá vốn thay vì tự suy luận
3. Mở rộng UI admin:
   - thêm bộ lọc kỳ báo cáo ở đầu dashboard admin
   - hiển thị biểu đồ doanh thu, top sản phẩm, lợi nhuận gộp theo danh mục, top khách hàng mua nhiều, top khách hàng nợ nhiều
   - thêm hành động export PDF và Excel với trạng thái loading/success/error bằng Sonner toast
4. Bảo đảm nhất quán dashboard/export:
   - export phải dùng cùng filter và cùng nguồn dữ liệu tổng hợp
   - file xuất phải ghi rõ kỳ báo cáo và thời điểm tạo

## Verification Checklist

1. Chọn lần lượt `day`, `week`, `month`, `year` và xác minh biểu đồ doanh thu thay đổi đúng theo dữ liệu.
2. Chọn một khoảng thời gian cụ thể và kiểm tra:
   - top sản phẩm phản ánh đúng số lượng bán trong kỳ
   - lợi nhuận gộp theo danh mục khớp với doanh thu trừ giá vốn
   - top khách hàng mua nhiều chỉ tính đơn trong kỳ
   - top khách hàng nợ nhiều phản ánh số dư hiện hành
3. Kiểm tra trạng thái rỗng:
   - không có đơn trong kỳ
   - danh mục thiếu dữ liệu giá vốn
   - không có khách hàng nợ
4. Thực hiện export PDF và Excel:
   - tên file hợp lý
   - metadata kỳ báo cáo hiển thị đúng
   - số liệu trong file trùng với dashboard đang xem
5. Chạy test backend cho các hàm tổng hợp và các tình huống thiếu dữ liệu giá vốn.

## Suggested Test Focus

- Query grouping theo ngày/tuần/tháng/năm
- Mapping `referenceId` giữa sale stock entries và order
- Xử lý đồng hạng trong bảng xếp hạng
- Tính nhất quán giữa response API và nội dung export

## Validation Notes

- Backend reporting tests đã được thêm và chạy pass:
  - `npm test --workspace=apps/backend -- --runInBand src/dashboard/reporting-range.util.spec.ts src/dashboard/dashboard.controller.spec.ts src/dashboard/advanced-reporting.service.spec.ts`
- Web reporting tests đã được thêm và chạy pass:
  - `npm test --workspace=apps/web-base`
- Build validation đã được chạy:
  - `npm run build --workspace=apps/backend`
  - `npm run build --workspace=apps/web-base`
- Lưu ý: `npm run lint --workspace=apps/backend` vẫn fail do nhiều lỗi sẵn có ngoài phạm vi dashboard reporting.
