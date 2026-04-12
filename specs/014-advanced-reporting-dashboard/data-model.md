# Data Model: Advanced Reporting Dashboard

## 1. Reporting Filter

- **Purpose**: Đại diện cho bộ lọc được áp dụng nhất quán cho toàn dashboard và export.
- **Fields**:
  - `granularity`: `day | week | month | year`
  - `from`: mốc bắt đầu kỳ báo cáo
  - `to`: mốc kết thúc kỳ báo cáo
  - `timezone`: múi giờ áp dụng để gom nhóm theo kỳ
- **Validation Rules**:
  - `granularity` là bắt buộc.
  - `from` phải nhỏ hơn hoặc bằng `to`.
  - Khoảng thời gian phải nằm trong phạm vi hệ thống cho phép export/tổng hợp.

## 2. Revenue Series Point

- **Purpose**: Một điểm dữ liệu trong biểu đồ doanh thu theo trục thời gian.
- **Fields**:
  - `bucketLabel`: nhãn kỳ hiển thị cho người dùng
  - `bucketStart`: thời điểm bắt đầu bucket
  - `bucketEnd`: thời điểm kết thúc bucket
  - `revenue`: tổng doanh thu của bucket
  - `orderCount`: số đơn hoàn tất trong bucket
- **Relationships**:
  - Được sinh từ nhiều `Order`.
- **Validation Rules**:
  - Chỉ bao gồm đơn ở trạng thái hợp lệ cho báo cáo doanh thu.
  - Revenue không âm.

## 3. Top Selling Product Record

- **Purpose**: Dùng cho bảng xếp hạng sản phẩm bán chạy.
- **Fields**:
  - `productId`
  - `sku`
  - `productName`
  - `categoryId`
  - `categoryName`
  - `quantitySold`
  - `revenueContribution`
  - `rank`
- **Relationships**:
  - Tổng hợp từ `OrderItem` và `Product`.
- **Validation Rules**:
  - `quantitySold` phải lớn hơn hoặc bằng 0.
  - Xếp hạng ổn định khi bằng điểm.

## 4. Category Gross Profit Record

- **Purpose**: Dùng cho phân tích lợi nhuận gộp theo danh mục.
- **Fields**:
  - `categoryId`
  - `categoryName`
  - `revenue`
  - `costOfGoodsSold`
  - `grossProfit`
  - `hasIncompleteCostData`
  - `missingCostOrderCount`
- **Relationships**:
  - Tổng hợp từ `Category`, `Product`, `OrderItem`, `StockEntry`.
- **Validation Rules**:
  - `grossProfit = revenue - costOfGoodsSold` khi dữ liệu giá vốn đầy đủ.
  - Nếu thiếu dữ liệu giá vốn cho bất kỳ phần nào, `hasIncompleteCostData` phải bằng `true`.

## 5. Customer Purchase Ranking Record

- **Purpose**: Xếp hạng khách hàng mua nhiều nhất trong kỳ.
- **Fields**:
  - `customerId`
  - `customerName`
  - `phone`
  - `orderCount`
  - `totalPurchaseAmount`
  - `rank`
- **Relationships**:
  - Tổng hợp từ `Order` và `Customer`.
- **Validation Rules**:
  - Chỉ tính các đơn hoàn tất trong kỳ báo cáo.
  - Bỏ qua các đơn không gắn khách hàng khi tạo xếp hạng theo khách hàng.

## 6. Customer Debt Ranking Record

- **Purpose**: Xếp hạng khách hàng nợ nhiều nhất theo số dư hiện hành.
- **Fields**:
  - `customerId`
  - `customerName`
  - `phone`
  - `outstandingDebt`
  - `lastDebtActivityAt`
  - `rank`
- **Relationships**:
  - Đọc từ `Customer`, có thể tham chiếu `DebtLedgerEntry` để xác định hoạt động gần nhất.
- **Validation Rules**:
  - Chỉ bao gồm khách hàng có `outstandingDebt > 0`.
  - Sắp xếp giảm dần theo `outstandingDebt`.

## 7. Exported Report

- **Purpose**: Bản chụp dữ liệu báo cáo tại thời điểm xuất.
- **Fields**:
  - `format`: `pdf | xlsx`
  - `generatedAt`
  - `generatedBy`
  - `filter`: `Reporting Filter`
  - `revenueSeries`: danh sách `Revenue Series Point`
  - `topProducts`: danh sách `Top Selling Product Record`
  - `grossProfitByCategory`: danh sách `Category Gross Profit Record`
  - `topCustomersByPurchase`: danh sách `Customer Purchase Ranking Record`
  - `topCustomersByDebt`: danh sách `Customer Debt Ranking Record`
- **Validation Rules**:
  - Nội dung phải phản ánh cùng bộ lọc và cùng snapshot số liệu dashboard.
  - Metadata phải ghi rõ thời điểm tạo và người tạo báo cáo.

## 8. Domain Sources Used

- **Order**: nguồn doanh thu và số đơn theo kỳ.
- **OrderItem**: nguồn số lượng bán, doanh thu theo sản phẩm.
- **Product**: nối sản phẩm với danh mục.
- **Category**: chiều phân tích lợi nhuận gộp.
- **StockEntry**: nguồn giá vốn thực tế theo batch cho dòng SALE.
- **Customer**: nguồn tên khách hàng và số dư công nợ hiện hành.
- **DebtLedgerEntry**: nguồn hỗ trợ xác định thời điểm hoạt động công nợ gần nhất nếu cần hiển thị.

## State/Flow Notes

1. Người dùng chọn `Reporting Filter`.
2. Backend tổng hợp các record báo cáo từ domain sources.
3. Frontend hiển thị dashboard bằng cùng bộ lọc.
4. Khi export, hệ thống lấy lại cùng bộ dữ liệu tổng hợp và render sang định dạng đầu ra tương ứng.
