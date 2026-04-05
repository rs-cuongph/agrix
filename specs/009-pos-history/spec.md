# Feature Specification: POS History
**Feature Branch**: `009-pos-history`  
**Created**: 2026-04-05
**Status**: Draft  
**Input**: User description: "Xây dựng tính năng Xem lịch sử đơn hàng POS, cho phép xem lại bill và in lại bill"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem danh sách đơn hàng đã thanh toán (Priority: P1)

Nhân viên thu ngân đang làm việc, khách hàng quay lại phàn nàn hoặc cần đối soát tiền thừa, thu ngân mở màn hình "Lịch sử POS" để xem nhanh danh sách các hóa đơn gần nhất.

**Why this priority**: Cốt lõi của chức năng là khả năng theo dõi các giao dịch đã thực hiện trong thời gian thực, là nền tảng để xem chi tiết và in lại hóa đơn.

**Independent Test**: Có thể được kiểm thử độc lập thông qua việc vào trang Lịch sử và đối chiếu với các lịch sử đơn hàng đã được chốt (Checkout) trước đó.

**Acceptance Scenarios**:

1. **Given** một ca bán hàng đang diễn ra với một số đơn hàng đã hoàn tất, **When** thu ngân nhấn vào nút "History", **Then** màn hình hiển thị danh sách các đơn hàng, sắp xếp từ mới xuống cũ.
2. **Given** danh sách quá dài, **When** thu ngân cuộn xuống, **Then** hệ thống tải thêm hoặc phân trang để hiển thị đầy đủ giao dịch.

---

### User Story 2 - Xem chi tiết bill (Priority: P2)

Khách hàng mua hàng xong nhưng thắc mắc về giá trị của một món hàng. Thu ngân từ danh sách lịch sử, bấm chọn vào hóa đơn vừa thanh toán để mở rộng chi tiết các mặt hàng đã tính tiền.

**Why this priority**: Sau khi tìm được hóa đơn, khả năng xem lại các mục nội dung chi tiết là bắt buộc để giải quyết khiếu nại hoặc kiểm tra xem thiết bị đã đọc mã vạch đúng số lượng hay chưa.

**Independent Test**: Có thể test bằng cách kiểm tra hiển thị chi tiết (items, metadata) ứng với đúng ID của order trong cơ sở dữ liệu.

**Acceptance Scenarios**:

1. **Given** thu ngân đang ở trang Lịch sử, **When** nhấn vào một đơn hàng cụ thể, **Then** mở ra một Modal (hoặc bảng chi tiết) hiển thị danh sách sản phẩm, các khoản giảm giá, thuế, tổng thanh toán và phương thức thanh toán.

---

### User Story 3 - In lại hóa đơn (Priority: P2)

Máy in hóa đơn bị kẹt giấy hoặc khách hàng yêu cầu hóa đơn lần 2, thu ngân vào mục lịch sử và chọn lệnh in lại hóa đơn đưa cho khách hàng.

**Why this priority**: Đây là tiện ích rất quan trọng trong các cửa hàng bán lẻ vật lý do xác suất bị lỗi in vật lý khá cao.

**Independent Test**: Cần máy in kết nối thành công, kích hoạt hành động sẽ gửi đúng tín hiệu in phiếu bán hàng (Receipt).

**Acceptance Scenarios**:

1. **Given** thu ngân đang xem chi tiết hóa đơn, **When** nhấn nút "In lại" (Reprint), **Then** hóa đơn được định dạng đúng format 80mm/58mm và khởi chạy giao thức in ra máy in đang kết nối.

### Edge Cases

- Hệ thống xử lý thế nào khi thử xem / in lại một hóa đơn đã bị hủy (Voided/Refunded)?
- Lịch sử đơn hàng hiển thị tất cả thời gian hay chỉ trong ca làm việc hiện tại của thu ngân?
- Mất kế nối internet (đối với PWA Offline) thì lịch sử đơn hàng có thể truy xuất không hay phải chờ sync?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI có giao diện Lịch sử POS (dành cho cảm ứng) được thiết kế đồng nhất với layout của hệ thống bán hàng đa giỏ hàng hiện tại.
- **FR-002**: Hệ thống PHẢI truy xuất và hiển thị danh sách các đơn hàng ở trạng thái đã chốt (Paid/Completed). 
- **FR-003**: Hệ thống PHẢI cho phép lọc hoặc tìm kiếm đơn hàng linh hoạt: tìm kiếm theo Mã hoá đơn (ID) hoặc Số điện thoại khách hàng.
- **FR-004**: Người dùng PHẢI có khả năng mở xem màn chi tiết hoá đơn bao gồm: thông tin thu ngân xử lý, ngày giờ chuẩn xác, danh sách Item, tổng tiền (Thành tiền), chiết khấu, phương thức thanh toán.
- **FR-005**: Ứng dụng PHẢI có chức năng "Reprint Receipt" (In lại hoá đơn) kết nối logic với thư viện in hoá đơn hiện tại.
- **FR-006**: Ứng dụng PHẢI hiển thị nút Chức năng "Hoàn Trả" (Refund) bên cạnh nút In lại, tuy nhiên tạm thời UI nút này không gọi logic backend mà chỉ chuẩn bị sẵn chỗ (Placeholder) cho phase phát triển sau.

### Key Entities

- **Order (Đơn hàng)**: Các thông tin cơ bản: OrderID, TotalAmount, Status, CreatedAt, CashierID.
- **Order Item (Sản phẩm hoá đơn)**: Sản phẩm mua vào lúc đó bán với giá bao nhiêu, số lượng thế nào.
- **Transaction/Receipt**: Bản format in của biên lai.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nhân viên thu ngân có thể tìm thấy nút in lại bill chỉ với tối đa 2 lần chạm (click) từ danh sách lịch sử.
- **SC-002**: Thời gian truy xuất và hiển thị nội dung 1 trang danh sách hoá đơn mất không quá 1.5 giây.
- **SC-003**: Khi bấm in lại, bill vẫn giữ được logic format đúng chuẩn như lúc bấm thanh toán ban đầu (cùng template in).
