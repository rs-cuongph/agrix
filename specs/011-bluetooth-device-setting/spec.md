# Feature Specification: Bluetooth Device Setting (Máy In Nhiệt)

**Feature Branch**: `011-bluetooth-device-setting`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "thêm tính năng setting device (bluetooth) tôi muốn quản lý các device bluetooth đã kết nối hoặc quét gần đây, mục đích để chọn máy in nhiệt để in thông qua bluetooth"

## Clarifications

### Session 2026-04-05

- Q: Giao diện cài đặt Bluetooth nằm ở đâu (trang riêng vs dialog/drawer)? → A: Dialog/Drawer mở từ icon ⚙️ trên header POS.
- Q: In hóa đơn tự động hay thủ công sau khi hoàn tất đơn hàng? → A: Bấm nút "In hóa đơn" thủ công — mặc định không in.
- Q: Nội dung hóa đơn in ra gồm những gì? → A: Tên cửa hàng, ngày giờ, danh sách sản phẩm (tên + số lượng + đơn giá + thành tiền), tổng tiền, phương thức thanh toán, mã đơn hàng, mã QR thanh toán (nếu là chuyển khoản).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quét và kết nối máy in Bluetooth (Priority: P1)

Thu ngân nhấn icon ⚙️ trên header POS để mở Drawer cài đặt, chọn mục "Thiết bị Bluetooth" và nhấn nút "Quét thiết bị Bluetooth". Hệ thống yêu cầu quyền truy cập Bluetooth qua trình duyệt, sau đó hiển thị danh sách các thiết bị Bluetooth gần đây. Thu ngân chọn một thiết bị máy in nhiệt từ danh sách, hệ thống kết nối và lưu lại thiết bị đó làm máy in mặc định.

**Why this priority**: Đây là luồng chính — nếu không thể quét và kết nối thiết bị, toàn bộ tính năng in nhiệt qua Bluetooth sẽ không hoạt động.

**Independent Test**: Có thể test bằng cách mở POS Setting, nhấn "Quét thiết bị", thấy danh sách thiết bị Bluetooth hiển thị, chọn 1 máy in → hệ thống xác nhận kết nối thành công.

**Acceptance Scenarios**:

1. **Given** thu ngân nhấn icon ⚙️ trên header POS để mở Drawer cài đặt, **When** chọn mục "Thiết bị Bluetooth" và nhấn "Quét thiết bị Bluetooth", **Then** hiển thị danh sách thiết bị Bluetooth có thể kết nối (lọc theo service UUID của máy in nhiệt).
2. **Given** danh sách thiết bị Bluetooth đang hiển thị, **When** thu ngân chọn một thiết bị, **Then** hệ thống kết nối đến thiết bị đó và hiển thị trạng thái "Đã kết nối".
3. **Given** thiết bị đã kết nối thành công, **When** thu ngân xác nhận chọn làm máy in mặc định, **Then** thiết bị được lưu lại (localStorage/IndexedDB) và hiển thị ở đầu danh sách "Thiết bị đã lưu".

---

### User Story 2 - Quản lý danh sách thiết bị đã lưu (Priority: P2)

Thu ngân xem lại danh sách các máy in Bluetooth đã từng kết nối. Thu ngân có thể chọn máy in mặc định khác, đổi tên gợi nhớ cho thiết bị, hoặc xóa thiết bị khỏi danh sách đã lưu.

**Why this priority**: Khi cửa hàng có nhiều máy in hoặc thay máy in mới, thu ngân cần quản lý danh sách thiết bị để tránh nhầm lẫn.

**Independent Test**: Có thể test bằng cách xem danh sách thiết bị đã lưu, đổi tên một thiết bị, chọn thiết bị khác làm mặc định, và xóa một thiết bị — tất cả thao tác phản ánh ngay trên giao diện.

**Acceptance Scenarios**:

1. **Given** có ít nhất 1 thiết bị đã lưu, **When** mở Drawer cài đặt > Thiết bị Bluetooth, **Then** hiển thị danh sách thiết bị đã lưu với tên, trạng thái kết nối (đã kết nối / ngắt kết nối), và đánh dấu thiết bị mặc định.
2. **Given** danh sách thiết bị đã lưu, **When** thu ngân nhấn chọn thiết bị khác làm mặc định, **Then** thiết bị đó trở thành mặc định và thiết bị cũ mất đánh dấu.
3. **Given** danh sách thiết bị đã lưu, **When** thu ngân xóa một thiết bị, **Then** thiết bị bị loại khỏi danh sách và nếu đó là thiết bị mặc định thì không còn thiết bị mặc định nào được chọn.

---

### User Story 3 - In hóa đơn qua máy in Bluetooth đã chọn (Priority: P1)

Sau khi hoàn tất đơn hàng trên POS, thu ngân nhấn nút "In hóa đơn". Hệ thống tự động gửi dữ liệu đến máy in nhiệt Bluetooth mặc định đã cấu hình. Nếu máy in không kết nối được, hiển thị thông báo lỗi và đề xuất chọn máy in khác.

**Why this priority**: Đây là mục tiêu cuối cùng — mọi thao tác quét/lưu thiết bị đều nhằm phục vụ việc in hóa đơn. Tính năng này cần được ưu tiên ngang hàng P1.

**Independent Test**: Có thể test bằng cách hoàn thành 1 đơn hàng → nhấn "In hóa đơn" → kiểm tra máy in nhiệt có nhận và in ra hóa đơn đúng format.

**Acceptance Scenarios**:

1. **Given** thu ngân đã hoàn tất đơn hàng và có máy in mặc định đã cấu hình, **When** nhấn nút "In hóa đơn", **Then** hóa đơn được gửi qua Bluetooth đến máy in và in ra giấy.
2. **Given** máy in mặc định đang tắt hoặc ngoài tầm phủ sóng, **When** nhấn "In hóa đơn", **Then** hiển thị thông báo lỗi "Không thể kết nối máy in" kèm nút "Chọn máy in khác" hoặc "Thử lại".
3. **Given** chưa cấu hình máy in mặc định nào, **When** nhấn "In hóa đơn", **Then** hiển thị thông báo hướng dẫn vào POS Setting để thiết lập máy in.

---

### User Story 4 - Kiểm tra tương thích trình duyệt (Priority: P2)

Khi thu ngân mở POS Setting trên trình duyệt không hỗ trợ Web Bluetooth API (ví dụ Firefox, Safari iOS), hệ thống hiển thị thông báo rõ ràng rằng tính năng in Bluetooth không được hỗ trợ trên trình duyệt hiện tại, kèm đề xuất dùng trình duyệt hỗ trợ.

**Why this priority**: Tránh trải nghiệm xấu khi user mở trên trình duyệt không tương thích mà không hiểu tại sao không hoạt động.

**Independent Test**: Mở POS Setting trên Firefox → thấy thông báo trình duyệt không hỗ trợ.

**Acceptance Scenarios**:

1. **Given** thu ngân mở POS Setting trên trình duyệt không hỗ trợ Web Bluetooth, **When** truy cập phần Thiết bị Bluetooth, **Then** hiển thị thông báo "Trình duyệt không hỗ trợ Bluetooth. Vui lòng sử dụng Chrome hoặc Edge trên máy tính/Android."
2. **Given** thu ngân mở POS Setting trên trình duyệt hỗ trợ Web Bluetooth, **When** truy cập phần Thiết bị Bluetooth, **Then** hiển thị nút "Quét thiết bị" và danh sách thiết bị đã lưu bình thường.

---

### Edge Cases

- Trình duyệt hỗ trợ Bluetooth nhưng Bluetooth của thiết bị (laptop/tablet) đang tắt → hiển thị hướng dẫn bật Bluetooth trong cài đặt hệ điều hành.
- Kết nối Bluetooth bị ngắt giữa chừng khi đang in → hiển thị thông báo lỗi, cho phép thử lại hoặc chọn máy in khác.
- Nhiều thu ngân cùng dùng chung 1 thiết bị POS (máy tính bảng) nhưng có máy in khác nhau → mỗi tài khoản thu ngân có danh sách thiết bị riêng (lưu kèm userId trong localStorage key).
- Máy in nhiệt hết giấy hoặc đang bận → hành vi phụ thuộc vào firmware máy in, hệ thống nên timeout sau 10 giây và thông báo lỗi.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cho phép thu ngân quét các thiết bị Bluetooth khả dụng xung quanh, lọc theo service UUID phổ biến của máy in nhiệt (ESC/POS).
- **FR-002**: Hệ thống PHẢI cho phép thu ngân chọn kết nối đến một thiết bị Bluetooth từ kết quả quét.
- **FR-003**: Hệ thống PHẢI lưu thông tin thiết bị đã kết nối (tên thiết bị, ID, tên gợi nhớ tùy chỉnh) vào bộ nhớ cục bộ của trình duyệt, phân biệt theo tài khoản thu ngân.
- **FR-004**: Hệ thống PHẢI cho phép thu ngân chọn một thiết bị đã lưu làm máy in mặc định.
- **FR-005**: Hệ thống PHẢI cho phép thu ngân đổi tên gợi nhớ cho thiết bị đã lưu.
- **FR-006**: Hệ thống PHẢI cho phép thu ngân xóa thiết bị khỏi danh sách đã lưu.
- **FR-007**: Hệ thống PHẢI gửi dữ liệu hóa đơn theo định dạng ESC/POS đến máy in mặc định khi thu ngân nhấn "In hóa đơn".
- **FR-008**: Hệ thống PHẢI hiển thị thông báo lỗi rõ ràng khi không thể kết nối máy in, kèm tùy chọn "Thử lại" hoặc "Chọn máy in khác".
- **FR-009**: Hệ thống PHẢI kiểm tra và thông báo khi trình duyệt không hỗ trợ Web Bluetooth API.
- **FR-010**: Hệ thống PHẢI hiển thị trạng thái kết nối thời gian thực (đang kết nối, đã kết nối, ngắt kết nối) cho thiết bị Bluetooth đã chọn.
- **FR-011**: Hóa đơn in ra PHẢI bao gồm: tên cửa hàng, ngày giờ, danh sách sản phẩm (tên + số lượng + đơn giá + thành tiền), tổng tiền, phương thức thanh toán, mã đơn hàng, và mã QR thanh toán (nếu phương thức thanh toán là chuyển khoản).

### Key Entities

- **BluetoothDevice (Saved)**: Đại diện cho một máy in Bluetooth đã được thu ngân lưu lại. Bao gồm: tên gốc thiết bị, ID thiết bị Bluetooth, tên gợi nhớ tùy chỉnh, trạng thái mặc định (có/không), ID tài khoản thu ngân sở hữu, thời điểm kết nối lần cuối.
- **PrintJob**: Đại diện cho một lệnh in hóa đơn. Bao gồm: mã đơn hàng liên kết, thiết bị đích, trạng thái (đang gửi, thành công, lỗi), thời điểm tạo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Thu ngân hoàn thành quét và kết nối máy in Bluetooth lần đầu trong dưới 1 phút.
- **SC-002**: 95% lệnh in hóa đơn qua Bluetooth thành công ngay lần đầu khi máy in trong phạm vi kết nối.
- **SC-003**: Thu ngân có thể đổi máy in mặc định trong dưới 15 giây (3 thao tác bấm).
- **SC-004**: 100% trường hợp trình duyệt không hỗ trợ được phát hiện và thông báo rõ ràng trước khi user cố kết nối.
- **SC-005**: Khi máy in không khả dụng, thu ngân nhận thông báo lỗi trong vòng 10 giây và có phương án thay thế ngay.

## Assumptions

- Máy in nhiệt hỗ trợ giao thức ESC/POS qua Bluetooth (SPP hoặc GATT).
- Thu ngân sử dụng Chrome hoặc Edge trên desktop/Android (các trình duyệt hỗ trợ Web Bluetooth API).
- Web Bluetooth API (navigator.bluetooth) được sử dụng ở phía client — không cần backend cho việc quản lý kết nối Bluetooth.
- Danh sách thiết bị lưu trên client (localStorage hoặc IndexedDB), phân biệt theo userId — không đồng bộ lên server.
- Hóa đơn format theo chuẩn ESC/POS 58mm hoặc 80mm (tùy máy in).
