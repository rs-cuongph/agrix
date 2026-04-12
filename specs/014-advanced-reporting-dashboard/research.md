# Research: Advanced Reporting Dashboard

## Decision 1: Mở rộng dashboard bằng các endpoint chuyên biệt thay vì một endpoint tổng hợp duy nhất

- **Decision**: Thiết kế các endpoint báo cáo riêng cho chuỗi doanh thu, top sản phẩm, lợi nhuận gộp theo danh mục, top khách hàng, và export.
- **Rationale**: Repo hiện đã có pattern `GET /dashboard/revenue`, `GET /dashboard/top-products`, `GET /dashboard/alerts`. Giữ cấu trúc endpoint chuyên biệt giúp frontend tải từng phần độc lập, phù hợp với định hướng trong spec gốc của nền tảng về dashboard endpoints tách rời để dễ cache và mở rộng.
- **Alternatives considered**:
  - Một endpoint trả toàn bộ dashboard: bị loại vì payload lớn, khó cache từng phần, và khiến một truy vấn chậm chặn toàn bộ màn hình.
  - Tính toán toàn bộ ở frontend: bị loại vì không bảo đảm bảo mật và không thể truy cập trực tiếp dữ liệu tài chính gốc.

## Decision 2: Dùng dữ liệu order + order_item + stock_entry để tính doanh thu và lợi nhuận gộp

- **Decision**: Doanh thu lấy từ `orders.totalAmount` trong phạm vi đơn hoàn tất; top sản phẩm lấy từ `order_items`; giá vốn và lợi nhuận gộp lấy từ các `stock_entries` loại SALE gắn với `referenceId` của đơn hàng để đảm bảo truy vết theo batch.
- **Rationale**: Constitution yêu cầu độ chính xác tài chính và khả năng truy vết. Codebase hiện đã lưu `costPricePerUnit`, `batchNumber`, `remainingQuantity`, và `referenceId` trong `stock_entries`, đúng với dữ liệu cần thiết để dựng gross profit theo danh mục.
- **Alternatives considered**:
  - Tính lợi nhuận từ `products.baseSellPrice`: bị loại vì đó là giá bán niêm yết, không phản ánh giá vốn thực tế theo batch.
  - Lưu sẵn profit trên order item: bị loại vì chưa tồn tại trong mô hình hiện tại và sẽ tạo thêm điểm đồng bộ dữ liệu.

## Decision 3: Định nghĩa rõ bộ lọc thời gian và quy tắc hiển thị dữ liệu thiếu

- **Decision**: Mọi endpoint phân tích dùng chung bộ lọc `granularity`, `from`, `to`; nếu không đủ dữ liệu giá vốn cho một danh mục thì trả về trạng thái dữ liệu không đầy đủ thay vì nội suy.
- **Rationale**: Spec yêu cầu tất cả widget và file export dùng cùng bộ lọc. Xử lý rõ ràng dữ liệu thiếu giúp tránh sai số tài chính và giữ niềm tin của người dùng với báo cáo.
- **Alternatives considered**:
  - Mỗi widget có bộ lọc riêng: bị loại vì dễ gây lệch số liệu giữa các phần.
  - Tự động thay giá vốn thiếu bằng 0: bị loại vì làm sai gross profit.

## Decision 4: Export được sinh từ cùng service tổng hợp dữ liệu đang phục vụ dashboard

- **Decision**: Tạo PDF/Excel từ cùng lớp tổng hợp dữ liệu dùng cho dashboard, chỉ thay đổi tầng biểu diễn đầu ra.
- **Rationale**: Spec yêu cầu dashboard và file export không chênh lệch. Chia sẻ cùng nguồn tổng hợp dữ liệu là cách trực tiếp nhất để bảo đảm điều đó.
- **Alternatives considered**:
  - Dựng logic export riêng: bị loại vì dễ phát sinh lệch format, lệch bộ lọc, hoặc lệch quy tắc xếp hạng.
  - Cho frontend tự lắp dữ liệu rồi xuất file: chấp nhận được cho phần dựng file, nhưng nguồn dữ liệu vẫn phải lấy từ cùng contract backend đã chuẩn hóa.

## Decision 5: UI admin nên dùng dashboard filter cố định ở đầu trang và toast cho export

- **Decision**: Đặt bộ lọc kỳ báo cáo ở đầu trang, cho phép đổi granularity và khoảng ngày; export PDF/Excel là các hành động rõ ràng có trạng thái đang xử lý và hoàn tất bằng Sonner toast.
- **Rationale**: Constitution yêu cầu UI đơn giản, trực quan, dùng shadcn/ui và toast cho các thao tác CRUD/hành động quản trị. Dashboard reporting là thao tác vận hành nên cần luồng rõ ràng và phản hồi nhanh.
- **Alternatives considered**:
  - Đặt bộ lọc cục bộ trong từng card: bị loại vì tạo cảm giác rời rạc và tăng rủi ro hiểu nhầm số liệu.
  - Tự động tải export không phản hồi trạng thái: bị loại vì người dùng không biết hệ thống đang xử lý hay lỗi.

## Decision 6: Kiểm thử tập trung vào độ nhất quán số liệu và hợp đồng API

- **Decision**: Ưu tiên kiểm thử tích hợp backend cho công thức tổng hợp, bộ lọc thời gian, xử lý thiếu giá vốn, đồng hạng; và kiểm thử UI/admin flow cho đổi kỳ báo cáo và export.
- **Rationale**: Đây là tính năng tài chính tổng hợp, rủi ro lớn nằm ở công thức dữ liệu và contract response hơn là UI layout thuần túy.
- **Alternatives considered**:
  - Chỉ kiểm thử thủ công trên dashboard: bị loại vì không đủ độ tin cậy cho logic tài chính.
  - Chỉ snapshot UI: bị loại vì không kiểm soát được độ đúng của số liệu.

## Performance Notes

- Các truy vấn báo cáo nên luôn lọc theo `orders.created_at` và `orders.status`, vì đây là trục lọc chung cho revenue, top products, gross profit, và purchase ranking.
- Với dữ liệu tăng trưởng lớn, nên ưu tiên index hoặc composite index quanh các cột `orders(status, created_at)`, `order_items(order_id, product_id)`, và `stock_entries(reference_id, type, product_id)` để giảm chi phí join cho báo cáo.
- Export hiện dùng cùng snapshot dữ liệu từ service tổng hợp, nên chi phí export tỉ lệ thuận với chi phí truy vấn dashboard; khi dataset lớn hơn, có thể cân nhắc cache snapshot ngắn hạn theo bộ lọc.
