# Feature Specification: POS Cashier Tablet App

**Feature Branch**: `006-pos-cashier-tablet`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Ứng dụng bán hàng cho thu ngân trên tablet, giao diện to rõ ràng cho người già"

## Clarifications

### Session 2026-04-04

- Q: Cơ chế xác thực (Authentication) cho POS? → A: Login bằng mã PIN (4-6 số) — nhanh hơn cho thu ngân, cần xây API mới cho PIN auth.
- Q: Vai trò nào được phép truy cập POS? → A: Chỉ ADMIN và Nhân viên bán hàng. Thủ kho không được truy cập POS.
- Q: Hiển thị sản phẩm dạng Grid hay List? → A: Grid thẻ lớn (3-4 cột) với hình ảnh, tên, giá mỗi thẻ — giúp nhận diện nhanh bằng mắt.

### Session 2026-04-05

- Q: Quy định về cài đặt tài khoản PIN (4-6 số) cho thu ngân sẽ hoạt động như thế nào? → A: Option A - Admin là người duy nhất được quyền xem, cấp hoặc đổi mã PIN cho nhân viên trên trang Quản lý User ở Admin Panel.
- Q: Format nội dung chuyển khoản (VietQR) nên thiết kế thế nào do UUID quá dài và chứa chứa dấu gạch ngang? → A: Option A - Thêm thuộc tính `orderCode` (VD: `DH123456`) vào entity Order. UUID giữ nguyên làm khóa hệ thống. `orderCode` được in lên VietQR và giao diện thay thế UUID.
- Q: Câu hình tài khoản nhận tiền (Bank ID, Tên, Số tài khoản) để sinh QRCode được lấy từ đâu? → A: Option B - Cấu hình tĩnh qua biến môi trường (`.env`). Chưa cần thiết kế UI Cài đặt phức tạp ở giai đoạn này.
- Q: Cơ chế bảo vệ và payload của Webhook xử lý Bank Transfer là gì? → A: Option A - Dùng Header `x-webhook-secret` (cấu hình trong `.env`) để bảo mật. Payload nhận JSON chứa `orderCode` và `amount` từ Google Apps Script.

## Webhook: Bank Transfer Integration (Auto-Payment)

Hệ thống sẽ cung cấp một Endpoint để External Service (Google App Script) báo cáo kết quả nhận tiền. Payload được định nghĩa khắt khe như sau để đảm bảo Google App Script có template chuẩn để forward:

**Endpoint**: `POST /api/v1/orders/webhook/bank-transfer`
**Header Auth**: `x-webhook-secret: <Giá_trị_từ_.env>` (Bắt buộc)

**Request Body (JSON)**:
```json
{
  "orderCode": "VD: DH123456",     // Mã đơn hàng bóc tách được từ nội dung chuyển khoản. (Bắt buộc)
  "amount Paid": 120000,          // Số tiền thực tế ngân hàng ghi có. (Bắt buộc)
  "transactionRef": "MB12345678", // Mã giao dịch của Ngân hàng (Dùng để log chống trùng lặp, optional nhưng rất nên có)
  "rawContent": "NGUYEN VAN A TT DH123456", // Nôi dung chuyển khoản nguyên bản (Dùng để tra soát nếu fail)
  "paymentDate": "2026-04-05T12:00:00Z"     // Giờ giao dịch
}
```
**Luồng xử lý (Backend)**:
1. Backend kiểm tra `x-webhook-secret`.
2. Truy xuất Database tìm Order có `orderCode` khớp.
3. So sánh `amount Paid` với `order.totalAmount` (hoặc nợ).
4. Nếu hợp lệ, tự động cập nhật trạng thái đơn (sang `COMPLETED` / `PAID`) và giảm trừ công nợ.
5. Sinh `BankTransferRecord` để lưu log (`transactionRef`).


## Design Pattern: Agrix POS (Tablet-First, Elderly-Accessible)

Ứng dụng POS PHẢI tuân thủ phong cách thiết kế đã được thiết lập cho hệ thống Agrix, đồng thời tối ưu cho đối tượng người dùng lớn tuổi và vận hành trên tablet:

### Bảng màu & Ngôn ngữ hình ảnh
- **Màu chủ đạo**: Emerald Green (`emerald-500` cho hành động chính, `emerald-950` cho thanh bên/thanh header).
- **Nền ứng dụng**: Trắng hoặc xám rất nhạt (`gray-50`) để tối đa contrast.
- **Hiệu ứng Alpha/Glass**: Dùng lớp phủ trắng với độ trong suốt (`white/10`, `white/60`) cho các thanh công cụ, tương tự admin sidebar.
- **Màu nguy hiểm/cảnh báo**: Đỏ (`destructive`) cho xóa, vàng cho cảnh báo, xanh dương nhạt cho thông tin bổ sung.

### Typography & Touch Target cho người lớn tuổi
- **Cỡ chữ tối thiểu**: 16px cho text thường, 20px cho tên sản phẩm, 28–36px cho tổng tiền.
- **Font weight**: Bán đậm (semibold/bold) cho thông tin quan trọng, giúp đọc dễ dàng.
- **Touch target tối thiểu**: 48x48px cho mọi nút bấm/vùng tương tác (tuân thủ WCAG AAA).
- **Khoảng cách giữa các nút**: Tối thiểu 12px để tránh tap nhầm.

### Hiệu ứng & Phản hồi
- **Micro-animations mượt mà**: Transition 200–300ms cho mọi thay đổi trạng thái.
- **Toast notifications (Sonner)**: Mọi thao tác CRUD hiển thị phản hồi ngay lập tức.
- **Bo góc mềm mại**: `rounded-lg` (8px) cho card, `rounded-xl` (12px) cho modal.
- **Drop shadow siêu mỏng**: Tạo phân lớp giữa các vùng UI mà không gây rối mắt.

### Icon & Biểu tượng
- **Cấm tuyệt đối Emoji unicode**: Tất cả biểu tượng dùng từ thư viện Lucide-react (web) hoặc Material Icons (Flutter).
- **Kích thước icon tối thiểu**: 24x24px (lớn hơn chuẩn admin 20x20px).

### Bố cục Tablet (Landscape preferred)
- **Split-view 2 cột**: Cột trái chiếm ~60% hiển thị danh sách sản phẩm/grid, cột phải chiếm ~40% hiển thị giỏ hàng & thanh toán.
- **Thanh tìm kiếm lớn cố định ở trên cùng** với hỗ trợ quét barcode.
- **Không dùng sidebar ẩn/off-canvas**: Mọi thao tác quan trọng phải hiển thị rõ ràng trong tầm mắt.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tra cứu và thêm sản phẩm vào giỏ hàng (Priority: P1)

Là thu ngân, tôi muốn tìm kiếm sản phẩm nhanh chóng (bằng tên, mã SKU, hoặc quét barcode) và thêm vào giỏ hàng để phục vụ khách hàng một cách nhanh nhất.

**Why this priority**: Tra cứu sản phẩm là thao tác cốt lõi và chiếm phần lớn thời gian tương tác của thu ngân. Nếu không nhanh và mượt, toàn bộ quy trình bán hàng sẽ bị chậm.

**Independent Test**: Có thể test hoàn chỉnh bằng cách mở app, tìm kiếm sản phẩm, và xác nhận sản phẩm được thêm vào giỏ hàng với đúng đơn giá.

**Acceptance Scenarios**:

1. **Given** tablet đang ở màn hình POS chính, **When** thu ngân nhập tên/mã sản phẩm vào ô tìm kiếm, **Then** kết quả phải hiện ra trong vòng 0.5 giây với hình ảnh, tên, giá, và tồn kho.
2. **Given** thu ngân đang xem danh sách sản phẩm, **When** tap vào một sản phẩm, **Then** sản phẩm được thêm 1 đơn vị vào giỏ hàng ở cột bên phải, kèm hiệu ứng phản hồi thị giác (animation).
3. **Given** sản phẩm có nhiều đơn vị quy đổi (VD: Thùng/Chai), **When** thu ngân tap vào sản phẩm, **Then** hệ thống hiển thị popup chọn đơn vị bán (lớn, rõ ràng) trước khi thêm vào giỏ.
4. **Given** tablet đang ở màn hình POS chính, **When** thu ngân sử dụng thiết bị quét barcode ngoài (kết nối USB/Bluetooth), **Then** sản phẩm tương ứng được tự động tìm và thêm vào giỏ hàng.

---

### User Story 2 - Quản lý giỏ hàng và điều chỉnh số lượng (Priority: P1)

Là thu ngân, tôi muốn dễ dàng thay đổi số lượng, xóa sản phẩm trong giỏ hàng và xem tổng tiền cập nhật theo thời gian thực.

**Why this priority**: Giỏ hàng là trung tâm tương tác của POS, phải cực kỳ trực quan vì người lớn tuổi cần thao tác nhanh mà không nhầm lẫn.

**Independent Test**: Có thể test bằng cách thêm nhiều sản phẩm, thay đổi số lượng, xóa bớt, và xác nhận tổng tiền luôn chính xác.

**Acceptance Scenarios**:

1. **Given** giỏ hàng có sản phẩm, **When** thu ngân tap nút "+" hoặc "-" (kích thước lớn, tối thiểu 48x48px), **Then** số lượng thay đổi tương ứng và tổng tiền cập nhật ngay lập tức.
2. **Given** giỏ hàng có sản phẩm, **When** thu ngân vuốt ngang (swipe) một dòng sản phẩm hoặc bấm icon xóa, **Then** sản phẩm bị xóa khỏi giỏ kèm hiệu ứng mượt mà.
3. **Given** giỏ hàng có nhiều sản phẩm, **When** thu ngân xem cột giỏ hàng, **Then** tổng tiền hiển thị ở dưới cùng với cỡ chữ lớn (28–36px), luôn trong tầm nhìn mà không cần cuộn.
4. **Given** giỏ hàng đang trống, **When** thu ngân xem cột giỏ hàng, **Then** hiển thị thông điệp hướng dẫn ("Chạm hoặc quét sản phẩm để bắt đầu") thay vì để trống.

---

### User Story 3 - Thanh toán đơn hàng (Priority: P1)

Là thu ngân, tôi muốn hoàn tất thanh toán bằng tiền mặt hoặc chuyển khoản một cách nhanh chóng và nhận phản hồi rõ ràng rằng giao dịch thành công.

**Why this priority**: Thanh toán là bước kết thúc của mọi giao dịch. Nếu thiếu, toàn bộ app không có giá trị.

**Independent Test**: Có thể test bằng cách thêm sản phẩm vào giỏ, chọn phương thức thanh toán, xác nhận, và xác nhận đơn hàng được lưu thành công.

**Acceptance Scenarios**:

1. **Given** giỏ hàng có sản phẩm, **When** thu ngân bấm nút "Thanh toán" (nút lớn, nổi bật, đáy cột giỏ hàng), **Then** hiển thị màn hình thanh toán toàn màn hình với tổng tiền rõ ràng.
2. **Given** thu ngân ở màn hình thanh toán, **When** chọn "Tiền mặt", **Then** hiển thị ô nhập số tiền khách đưa (bàn phím số lớn) và tự động tính tiền thừa.
3. **Given** thu ngân ở màn hình thanh toán, **When** chọn "Chuyển khoản", **Then** hiển thị mã QR (VietQR) với số tiền chính xác để khách quét thanh toán.
4. **Given** thu ngân xác nhận thanh toán, **When** giao dịch hoàn tất, **Then** hiển thị màn hình xác nhận thành công (animation lớn, rõ ràng: dấu tick xanh), giỏ hàng tự động reset, và toast notification "Đơn hàng thành công!".
5. **Given** thiết bị đang offline, **When** thu ngân thanh toán, **Then** đơn hàng được lưu cục bộ với dấu hiệu "Chưa đồng bộ" và tự động sync khi có mạng trở lại.

---

### User Story 4 - Gắn khách hàng vào đơn hàng (Priority: P2)

Là thu ngân, tôi muốn có thể gắn thông tin khách hàng vào đơn hàng (tùy chọn, không bắt buộc) để theo dõi lịch sử mua hàng và quản lý công nợ.

**Why this priority**: Quản lý khách hàng là yêu cầu đặc thù ngành nông nghiệp (mua khất nợ), nhưng không phải giao dịch nào cũng cần gắn khách hàng.

**Independent Test**: Có thể test bằng cách tạo đơn hàng, tìm kiếm khách hàng, gắn vào đơn, và xác nhận đơn hàng lưu đúng thông tin khách.

**Acceptance Scenarios**:

1. **Given** thu ngân đang ở cột giỏ hàng, **When** tap vào vùng "Khách hàng" (phía trên giỏ), **Then** hiển thị popup tìm kiếm khách hàng theo tên/SĐT với kết quả tức thì.
2. **Given** thu ngân chọn một khách hàng, **When** khách hàng được gắn, **Then** tên khách và số dư nợ hiện tại hiển thị trên giỏ hàng.
3. **Given** khách hàng chưa tồn tại trong hệ thống, **When** thu ngân bấm "Thêm khách mới", **Then** hiển thị form nhanh (tên + SĐT) ngay trong popup, không phải chuyển trang.
4. **Given** đơn hàng có gắn khách hàng, **When** thanh toán với số tiền trả ít hơn tổng, **Then** phần thiếu được tự động ghi nhận vào công nợ của khách (nợ gối đầu).

---

### User Story 5 - Lọc sản phẩm theo danh mục (Priority: P2)

Là thu ngân, tôi muốn lọc nhanh sản phẩm theo danh mục để tìm sản phẩm nhanh hơn khi không nhớ chính xác tên hoặc mã.

**Why this priority**: Bổ trợ cho tìm kiếm, giúp thu ngân lớn tuổi duyệt sản phẩm bằng mắt trong một phạm vi nhỏ.

**Independent Test**: Có thể test bằng cách tap vào các tab danh mục và xác nhận danh sách sản phẩm cập nhật đúng.

**Acceptance Scenarios**:

1. **Given** thu ngân ở màn hình POS chính, **When** xem phía trên vùng danh sách sản phẩm, **Then** thấy dải tab danh mục ngang (cuộn ngang nếu nhiều) với tab "Tất cả" được chọn mặc định.
2. **Given** thu ngân tap vào tab "Phân bón", **When** danh sách cập nhật, **Then** chỉ hiển thị sản phẩm thuộc danh mục "Phân bón" (bao gồm cả danh mục con).
3. **Given** thu ngân đang lọc theo danh mục, **When** nhập thêm từ khóa vào ô tìm kiếm, **Then** kết quả được lọc kết hợp (danh mục + từ khóa).

---

### User Story 6 - In hóa đơn (Priority: P3)

Là thu ngân, tôi muốn in hóa đơn ra máy in nhiệt ngay sau khi thanh toán xong hoặc in lại đơn hàng cũ khi khách yêu cầu.

**Why this priority**: In hóa đơn quan trọng nhưng không chặn quy trình bán hàng chính (thanh toán vẫn hoàn tất dù không in).

**Independent Test**: Có thể test bằng cách thanh toán đơn hàng và xác nhận lệnh in được gửi tới máy in Bluetooth/LAN.

**Acceptance Scenarios**:

1. **Given** giao dịch vừa hoàn tất, **When** màn hình xác nhận hiển thị, **Then** nút "In hóa đơn" hiện lớn và rõ ràng, in tự động nếu đã cấu hình (hoặc hỏi lần đầu).
2. **Given** máy in Bluetooth đã kết nối, **When** thu ngân bấm "In hóa đơn", **Then** hóa đơn được in trong vòng 3 giây.
3. **Given** máy in chưa kết nối hoặc lỗi, **When** thu ngân bấm "In hóa đơn", **Then** hiển thị thông báo lỗi rõ ràng (không phải lỗi kỹ thuật khó hiểu) kèm nút "Thử lại".

---

### User Story 7 - Xem lịch sử đơn hàng trong ca (Priority: P3)

Là thu ngân, tôi muốn xem lại các đơn hàng đã bán trong ca làm việc hiện tại để kiểm tra lại khi cần.

**Why this priority**: Tính năng hỗ trợ, không chặn việc bán hàng, nhưng cần thiết để giải quyết khiếu nại hoặc kiểm tra cuối ca.

**Independent Test**: Có thể test bằng cách bán vài đơn rồi mở lịch sử, xác nhận danh sách hiển thị đúng.

**Acceptance Scenarios**:

1. **Given** thu ngân ở màn hình POS chính, **When** tap vào nút "Lịch sử" (icon rõ ràng ở header), **Then** hiển thị danh sách đơn hàng hôm nay, mới nhất ở trên đầu.
2. **Given** thu ngân xem danh sách lịch sử, **When** tap vào một đơn hàng, **Then** hiển thị chi tiết đơn (sản phẩm, số lượng, phương thức thanh toán) trong một bottom sheet hoặc modal lớn.
3. **Given** thu ngân xem chi tiết một đơn hàng cũ, **When** tap "In lại", **Then** hóa đơn được in lại.

---

### Edge Cases

- Sản phẩm hết hàng (tồn kho = 0): Hiển thị badge "Hết hàng" rõ ràng, disable thao tác thêm vào giỏ, hiện cảnh báo nếu cố thêm.
- Mất kết nối mạng giữa phiên bán: Indicator "Offline" hiển thị rõ ở header, giao dịch lưu cục bộ, tự đồng bộ lại.
- Khách trả nhiều hơn tổng bill: Hiển thị số tiền thừa rõ ràng.
- Khách trả ít hơn + không có khách hàng gắn: Yêu cầu bắt buộc gắn khách hàng trước khi cho phép thanh toán thiếu (ghi nợ).
- Tablet bị xoay ngang ↔ dọc: Bố cục POS chỉ hỗ trợ landscape (khóa xoay), hoặc có layout đơn cột fallback cho portrait.
- Sản phẩm bị vô hiệu hóa (isActive = false) từ admin: Không hiển thị trên màn hình POS.
- Nhập sai mã PIN: Sau 5 lần liên tiếp, khóa tạm thời 5 phút và hiển thị thông báo rõ ràng.
- Phiên đăng nhập hết hạn: Tự động chuyển về màn hình PIN login, giỏ hàng hiện tại bị xóa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ứng dụng PHẢI hiển thị bố cục POS dạng 2 cột (sản phẩm dạng grid thẻ lớn 3-4 cột có hình ảnh, tên, giá | giỏ hàng + thanh toán) khi chạy trên tablet ở chế độ landscape.
- **FR-002**: Ứng dụng PHẢI cho phép tìm kiếm sản phẩm theo tên, mã SKU, và quét barcode EAN-13 với kết quả trả về nhanh (dưới 0.5 giây).
- **FR-003**: Ứng dụng PHẢI hiển thị popup chọn đơn vị bán khi sản phẩm có nhiều đơn vị quy đổi (VD: Thùng/Chai).
- **FR-004**: Ứng dụng PHẢI cho phép thay đổi số lượng, xóa sản phẩm trong giỏ hàng với cập nhật tổng tiền tức thì.
- **FR-005**: Ứng dụng PHẢI hỗ trợ thanh toán bằng tiền mặt (tính tiền thừa) và chuyển khoản (hiển thị mã QR VietQR).
- **FR-006**: Ứng dụng PHẢI hoạt động offline, lưu giao dịch cục bộ và tự đồng bộ khi có mạng (Offline-first).
- **FR-007**: Ứng dụng PHẢI cho phép gắn khách hàng vào đơn hàng (tùy chọn) và ghi nhận công nợ.
- **FR-008**: Ứng dụng PHẢI in hóa đơn qua máy in nhiệt Bluetooth/LAN.
- **FR-009**: Mọi nút bấm PHẢI có kích thước tối thiểu 48x48px, mọi text thông tin PHẢI có cỡ chữ tối thiểu 16px.
- **FR-010**: Ứng dụng PHẢI hiển thị thông báo Toast (sonner) cho mọi thao tác (thêm SP, thanh toán, lỗi).
- **FR-011**: Ứng dụng PHẢI sử dụng icon từ thư viện (Lucide-react hoặc Material Icons), KHÔNG sử dụng emoji unicode.
- **FR-012**: Ứng dụng PHẢI lọc sản phẩm theo danh mục bằng tab ngang phía trên danh sách.
- **FR-013**: Ứng dụng PHẢI hiển thị lịch sử đơn hàng trong ca làm việc hiện tại.
- **FR-014**: Ứng dụng PHẢI yêu cầu xác thực bằng mã PIN (4-6 số) trước khi truy cập màn hình POS. Mã PIN được quản trị viên cấp cho mỗi tài khoản nhân viên từ trang Admin. Chỉ tài khoản có vai trò ADMIN hoặc Nhân viên bán hàng mới được đăng nhập POS. Sau 5 lần nhập sai liên tiếp, hệ thống khóa tạm 5 phút.

### Key Entities

- **Sản phẩm (Product)**: Tên, SKU, giá bán, đơn vị quy đổi, tồn kho, hình ảnh, barcode EAN-13, trạng thái hoạt động.
- **Danh mục (Category)**: Tên, danh mục cha/con (cây phân cấp).
- **Giỏ hàng (Cart)**: Danh sách các dòng sản phẩm (tạm thời, chỉ tồn tại trong phiên bán).
- **Dòng giỏ hàng (CartItem)**: Sản phẩm, đơn vị bán, số lượng, đơn giá, thành tiền.
- **Đơn hàng (Order)**: Khách hàng (tùy chọn), tổng tiền, số tiền trả, phương thức thanh toán, trạng thái đồng bộ, người tạo.
- **Khách hàng (Customer)**: Tên, SĐT, địa chỉ, số dư nợ.

### Assumptions

- **Nền tảng**: Ứng dụng sẽ là **PWA (Progressive Web App)** chạy trên trình duyệt Chrome của tablet Android (≥ 10 inch). Tận dụng 100% codebase Next.js hiện có (`apps/web-base`), shadcn/ui design system, và backend API NestJS đã sẵn sàng. Route POS sẽ nằm tại `/pos/*` trong web-base.
- **Thiết bị quét mã vạch**: Các thiết bị barcode scanner Bluetooth/USB sẽ hoạt động ở chế độ keyboard emulation, dữ liệu scan được đổ vào ô input đang focus — hoạt động native trên web.
- **Máy in nhiệt**: Ưu tiên máy in mạng LAN (gửi lệnh ESC/POS qua API print server nội bộ). Máy in Bluetooth thông qua Web Bluetooth API (hỗ trợ trên Chrome Android).
- **Đồng bộ offline**: Service Worker cache + IndexedDB cho dữ liệu sản phẩm và đơn hàng tạm. Sử dụng idempotency key đã có trong entity Order để tránh trùng đơn khi sync.
- **Không cần Flutter**: Phase 1 hoàn toàn sử dụng Next.js/React. Nếu sau này cần publish lên Play Store hoặc offline nặng, sẽ xem xét chuyển sang Flutter ở phase riêng.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Thu ngân có thể hoàn tất 1 giao dịch bán hàng (tìm SP → thêm giỏ → thanh toán) trong vòng dưới 30 giây cho đơn hàng 3 sản phẩm.
- **SC-002**: 90% người dùng trên 55 tuổi có thể tự hoàn thành giao dịch bán hàng mà không cần hướng dẫn bổ sung sau 15 phút đào tạo.
- **SC-003**: Ứng dụng hiển thị đúng và đầy đủ trên tablet 10 inch trở lên ở chế độ landscape mà không cần cuộn ngang.
- **SC-004**: Tất cả text và nút bấm có thể đọc/nhấn dễ dàng từ khoảng cách 50cm (khoảng cách thường gặp giữa mắt và mặt quầy).
- **SC-005**: Giao dịch offline được đồng bộ thành công 100% khi có mạng trở lại, không mất dữ liệu.
- **SC-006**: Thời gian tìm kiếm sản phẩm (nhập text hoặc quét barcode) trả kết quả trong vòng 0.5 giây.
