# Feature Specification: Barcode/QR Scanner trên Web POS

**Feature Branch**: `016-pos-barcode-qr-scanner`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "Barcode/QR Scanner trên Web POS - Sử dụng camera trình duyệt để quét mã vạch (không cần thiết bị rời), hỗ trợ EAN-13, QR Code nội bộ"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quét Mã Vạch EAN-13 Qua Camera (Priority: P1)

Là thu ngân tại quầy POS, tôi muốn sử dụng camera của máy tính hoặc máy tính bảng để quét mã vạch EAN-13 trên sản phẩm nông nghiệp, thay vì phải dùng máy quét rời, để thêm sản phẩm vào hóa đơn nhanh chóng và không bị phụ thuộc vào thiết bị ngoại vi.

**Why this priority**: Đây là chức năng cốt lõi, loại bỏ nhu cầu đầu tư và bảo trì thiết bị quét mã vạch rời, giảm chi phí vận hành cho đại lý Agrix.

**Independent Test**: Có thể kiểm tra bằng cách mở giao diện POS, kích hoạt camera quét, hướng camera vào mã vạch EAN-13 trên bao bì sản phẩm và xác nhận sản phẩm được thêm vào hóa đơn trong vòng 2 giây.

**Acceptance Scenarios**:

1. **Given** thu ngân đang ở màn hình tạo đơn hàng POS, **When** họ nhấn nút "Quét mã vạch" và hướng camera vào mã EAN-13 hợp lệ, **Then** hệ thống nhận diện mã trong vòng 2 giây, tự động tìm kiếm sản phẩm và thêm vào hóa đơn với số lượng 1.
2. **Given** camera đang hoạt động, **When** mã vạch bị mờ, che khuất một phần hoặc ánh sáng yếu, **Then** hệ thống hiển thị hướng dẫn trực quan (khung căn chỉnh, đèn flash) để giúp người dùng quét thành công.
3. **Given** camera quét được mã EAN-13, **When** mã không tìm thấy trong danh mục sản phẩm, **Then** hệ thống thông báo lỗi rõ ràng "Sản phẩm không tìm thấy" và cho phép nhập mã thủ công.
4. **Given** thu ngân cần quét nhiều mặt hàng liên tiếp, **When** camera đã quét xong một sản phẩm, **Then** camera ở chế độ chờ sẵn sàng quét mã tiếp theo mà không cần tắt/mở lại.

---

### User Story 2 - Quét QR Code Nội bộ Agrix (Priority: P1)

Là thu ngân hoặc nhân viên kho, tôi muốn quét QR Code nội bộ do hệ thống Agrix tạo ra (dùng cho sản phẩm không có mã vạch thương mại) để thêm sản phẩm vào đơn hàng hoặc tra cứu thông tin cây trồng địa phương.

**Why this priority**: Nhiều sản phẩm nông nghiệp địa phương và sản phẩm tự đóng gói không có mã EAN-13; QR Code nội bộ là giải pháp thay thế thiết yếu.

**Independent Test**: Tạo một QR Code nội bộ cho sản phẩm "Phân bón hữu cơ A", in ra, sau đó quét bằng camera POS và xác nhận sản phẩm được nhận diện và thêm vào hóa đơn đúng.

**Acceptance Scenarios**:

1. **Given** sản phẩm đã được gán QR Code nội bộ trong hệ thống, **When** thu ngân quét QR Code đó qua camera POS, **Then** hệ thống nhận diện sản phẩm và thêm vào hóa đơn với đầy đủ thông tin (tên, đơn giá, đơn vị tính).
2. **Given** camera quét được QR Code, **When** QR Code là liên kết hoặc dữ liệu không thuộc định dạng nội bộ Agrix, **Then** hệ thống thông báo "QR Code không hợp lệ với hệ thống Agrix" và không thực hiện hành động nào.
3. **Given** thu ngân cần tạo QR Code cho sản phẩm mới, **When** quản trị viên tạo sản phẩm trong hệ thống, **Then** QR Code nội bộ được tạo tự động và có thể in ra ngay lập tức.

---

### User Story 3 - Quét Mã Trên Thiết bị Di Động (Priority: P2)

Là nhân viên bán hàng đang phục vụ khách hàng tại khu vực trưng bày, tôi muốn dùng điện thoại thông minh để quét mã sản phẩm và tạo đơn hàng nhanh mà không cần quay lại quầy thu ngân, giúp phục vụ khách hàng linh hoạt hơn.

**Why this priority**: Mở rộng điểm bán hàng ra ngoài quầy cố định, phù hợp với mô hình bán hàng linh động tại hội chợ, kho hay điểm trưng bày ngoài trời.

**Independent Test**: Dùng điện thoại truy cập giao diện POS web, kích hoạt camera quét EAN-13 và xác nhận hệ thống hoạt động tương tự như trên máy tính bàn.

**Acceptance Scenarios**:

1. **Given** nhân viên truy cập giao diện POS trên điện thoại di động, **When** họ kích hoạt tính năng quét, **Then** camera sau của điện thoại được sử dụng và giao diện quét tối ưu cho màn hình nhỏ.
2. **Given** điện thoại đang quét và phát hiện nhiều mã vạch trong khung hình, **When** hệ thống phát hiện xung đột, **Then** hệ thống chọn mã rõ nét nhất và xác nhận lại với người dùng trước khi thêm vào đơn.

---

### User Story 4 - Tìm Kiếm Nhanh Bằng Mã Thủ Công (Priority: P3)

Là thu ngân khi camera bị lỗi hoặc mã vạch bị hỏng, tôi muốn nhập thủ công mã sản phẩm vào ô tìm kiếm nhanh và hệ thống nhận diện ngay, để quá trình tính tiền không bị gián đoạn.

**Why this priority**: Fallback quan trọng đảm bảo không có điểm dừng trong quy trình bán hàng, dù đây là tính năng phụ trợ.

**Independent Test**: Phần cứng camera bị tắt, nhập mã EAN-13 thủ công vào ô tìm kiếm, xác nhận sản phẩm được tìm thấy và thêm vào hóa đơn.

**Acceptance Scenarios**:

1. **Given** camera không khả dụng, **When** thu ngân nhập mã vạch EAN-13 hoặc mã nội bộ thủ công vào ô tìm kiếm, **Then** hệ thống tìm kiếm và hiển thị sản phẩm tương ứng ngay khi nhập đủ ký tự.
2. **Given** thu ngân nhập mã không đầy đủ, **When** họ nhấn Enter, **Then** hệ thống hiển thị danh sách gợi ý các sản phẩm có mã tương tự để thu ngân chọn.

---

### Edge Cases

- Điều gì xảy ra khi trình duyệt không hỗ trợ hoặc người dùng từ chối cấp phép camera? → Hiển thị thông báo hướng dẫn cấp phép và cung cấp chế độ nhập thủ công làm fallback.
- Điều gì xảy ra khi camera quét được cùng một mã nhiều lần liên tiếp trong 1 giây? → Hệ thống chỉ xử lý một lần và bỏ qua các lần quét trùng trong vòng 1.5 giây (debounce).
- Điều gì xảy ra khi sản phẩm có mã vạch hợp lệ nhưng đã ngừng kinh doanh? → Hệ thống thông báo sản phẩm không còn bán và không thêm vào hóa đơn, ghi log sự kiện.
- Điều gì xảy ra khi ánh sáng môi trường quá tối để quét? → Hệ thống bật đèn flash (torch) của thiết bị nếu có và hiển thị cảnh báo ánh sáng yếu.
- Điều gì xảy ra khi kết nối mạng bị mất ngay sau khi quét? → Hệ thống lưu mã vừa quét tạm thời và đồng bộ khi có kết nối lại, thông báo cho thu ngân.
- Điều gì xảy ra khi cùng lúc nhiều thu ngân quét cùng một sản phẩm và tồn kho không đủ? → Hệ thống xử lý theo thứ tự, người cuối nhận thông báo không đủ tồn kho.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cho phép kích hoạt camera trình duyệt trực tiếp từ giao diện POS để quét mã vạch mà không cần cài đặt phần mềm hay thiết bị ngoại vi.
- **FR-002**: Hệ thống PHẢI nhận diện và giải mã định dạng mã vạch EAN-13 tiêu chuẩn quốc tế.
- **FR-003**: Hệ thống PHẢI nhận diện và giải mã định dạng QR Code nội bộ do hệ thống Agrix tạo ra.
- **FR-004**: Hệ thống PHẢI tìm kiếm sản phẩm tương ứng trong danh mục và thêm vào hóa đơn hiện tại trong vòng 2 giây sau khi quét thành công.
- **FR-005**: Hệ thống PHẢI hiển thị giao diện hỗ trợ căn chỉnh mã vạch (khung ngắm, đường kẻ hỗ trợ) trong quá trình quét.
- **FR-006**: Hệ thống PHẢI cung cấp phản hồi nghe nhìn (âm thanh beep và thông báo trực quan) khi quét thành công hoặc thất bại.
- **FR-007**: Hệ thống PHẢI hỗ trợ chế độ quét liên tục (continuous scan mode) để thu ngân có thể quét nhiều sản phẩm liên tiếp.
- **FR-008**: Hệ thống PHẢI cung cấp tính năng nhập mã thủ công làm phương án dự phòng khi camera không khả dụng.
- **FR-009**: Hệ thống PHẢI hoạt động trên các trình duyệt hiện đại (Chrome, Firefox, Safari, Edge) đã hỗ trợ WebRTC.
- **FR-010**: Hệ thống PHẢI hoạt động trên cả thiết bị máy tính bàn và thiết bị di động, tự động điều chỉnh giao diện phù hợp.
- **FR-011**: Hệ thống PHẢI xử lý trùng lặp quét (cùng mã quét nhiều lần trong 1.5 giây) bằng cơ chế debounce, chỉ thêm sản phẩm một lần.
- **FR-012**: Quản trị viên PHẢI có khả năng tạo và in QR Code nội bộ cho bất kỳ sản phẩm nào trong danh mục.

### Key Entities

- **Mã Sản phẩm (ProductCode)**: Mã định danh sản phẩm trong hệ thống Agrix; có thể là EAN-13 (thương mại quốc tế) hoặc mã nội bộ (do hệ thống tạo); một sản phẩm có thể có nhiều mã.
- **Phiên Quét (ScanSession)**: Phiên hoạt động camera tại một giao dịch POS; ghi lại thời gian bắt đầu, số lần quét thành công/thất bại.
- **QR Code Nội bộ (InternalQRCode)**: Mã QR chứa thông tin định danh sản phẩm Agrix theo định dạng chuẩn nội bộ; hỗ trợ sinh tự động và in theo yêu cầu.
- **Sự kiện Quét (ScanEvent)**: Bản ghi từng lần quét bao gồm mã đọc được, kết quả tìm kiếm, thời gian xử lý và trạng thái (thành công/thất bại).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Thu ngân có thể hoàn tất việc thêm một sản phẩm vào hóa đơn thông qua quét camera trong vòng dưới 3 giây kể từ khi hướng camera vào mã vạch.
- **SC-002**: Tỉ lệ nhận diện mã vạch EAN-13 thành công đạt ít nhất 95% trong điều kiện ánh sáng bình thường ở khoảng cách 10-30cm.
- **SC-003**: Tỉ lệ nhận diện QR Code nội bộ thành công đạt ít nhất 98% cho các QR Code được in rõ nét và không bị hỏng.
- **SC-004**: Tính năng hoạt động trên ít nhất 4 trình duyệt phổ biến (Chrome, Firefox, Safari, Edge) phiên bản phát hành trong vòng 2 năm gần nhất.
- **SC-005**: Thời gian thiết lập và sẵn sàng sử dụng cho một điểm bán hàng mới bằng 0 phút đầu tư phần cứng thêm (chỉ cần thiết bị có camera sẵn).
- **SC-006**: Thu ngân giảm được ít nhất 40% thời gian nhập liệu sản phẩm so với nhập tay thủ công.

## Assumptions

- Thiết bị dùng tại POS (máy tính bảng, laptop, điện thoại) đã tích hợp camera và trình duyệt hiện đại hỗ trợ WebRTC.
- Môi trường POS có mức chiếu sáng đủ để camera nhận diện mã vạch (tương đương ánh sáng văn phòng tiêu chuẩn).
- Mã vạch trên sản phẩm có chất lượng in đạt tiêu chuẩn thương mại (không bị mờ, rách, hay biến dạng nghiêm trọng).
- QR Code nội bộ sẽ được tạo theo định dạng chuẩn do nhóm kỹ thuật Agrix định nghĩa.
- Tính năng này bổ sung (không thay thế) thiết bị quét mã vạch rời nếu cửa hàng đã có; cả hai phương thức đều hoạt động song song.

## Dependencies

- Hệ thống POS hiện tại (web-base) phải hỗ trợ tích hợp component quét mã.
- Danh mục sản phẩm trong hệ thống Agrix phải có trường mã vạch EAN-13 và mã nội bộ.
- Máy in nhãn/mã QR phải có sẵn tại điểm bán hàng để in QR Code nội bộ khi cần.
