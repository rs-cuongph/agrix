# Feature Specification: Landing Page Redesign

**Feature Branch**: `004-landing-page-redesign`  
**Created**: 2026-03-21  
**Status**: Draft  
**Input**: User description: "Trang Landing Page ko phải là giới thiệu web. Tôi muốn là web bán hàng các sản phẩm của hệ thống, rồi các blog tôi quản lý ở admin phải đc show ra, ngoiaf ra cũng phải có tab phần liên hệ để user có thể contact (cần hiển thị thông tin cửa hàng bao gồm sdt, địa chỉ, tên cửa hàng,..., ngoài ra có form để user contact). ngoài ra có gì cần thêm thì gợi ý với tôi"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Khám phá và mua Sản phẩm (Priority: P1)

Người dùng truy cập Landing Page có thể xem ngay các sản phẩm bán chạy/mới nhất của hệ thống Agrix để tìm hiểu và ra quyết định mua hàng.

**Why this priority**: Focus chính của trang là "web bán hàng", trực tiếp mang lại doanh thu.

**Independent Test**: Có thể test độc lập bằng cách hiển thị mockup danh sách sản phẩm, click vào sản phẩm xem chi tiết.

**Acceptance Scenarios**:

1. **Given** người dùng ở trang chủ, **When** cuộn đến phần Sản phẩm, **Then** thấy danh sách các sản phẩm đang active.
2. **Given** người dùng thấy sản phẩm quan tâm, **When** click vào sản phẩm, **Then** hệ thống sẽ chuyển hướng đến trang Chi tiết Sản phẩm (Product Detail Page) để xem thông tin chi tiết (không có chức năng giỏ hàng hay checkout).

---

### User Story 2 - Đọc nội dung Blog / Kiến thức nông nghiệp (Priority: P2)

Người dùng có thể đọc các bài viết blog mới nhất được quản trị viên đăng tải từ hệ thống Admin để cập nhật kiến thức nông nghiệp.

**Why this priority**: Cung cấp giá trị cho user, tăng time-on-page và SEO cho website.

**Independent Test**: Tích hợp API lấy danh sách bài viết từ database và hiển thị ở dạng grid/list trên Homepage.

**Acceptance Scenarios**:

1. **Given** quản trị viên đã đăng bài blog mới, **When** người dùng vào trang chủ, **Then** phần Blog hiển thị các bài viết mới nhất (thumbnail, tiêu đề, mô tả ngắn).

---

### User Story 3 - Liên hệ Cửa hàng (Priority: P1)

Người dùng có thể xem thông tin liên hệ của cửa hàng (tên, SĐT, địa chỉ) và gửi form liên hệ trực tiếp cho cửa hàng.

**Why this priority**: Cầu nối quan trọng để khách hàng kết nối, đặt câu hỏi hoặc hợp tác.

**Independent Test**: Form liên hệ có thể submit data, thông tin cửa hàng hiển thị rõ ràng.

**Acceptance Scenarios**:

1. **Given** người dùng kéo xuống phần Liên hệ, **When** xem thông tin, **Then** thấy đúng Tên, Số điện thoại, Địa chỉ, Email của cửa hàng.
2. **Given** người dùng điền Form liên hệ (Tên, SĐT, Lời nhắn), **When** bấm "Gửi", **Then** hệ thống báo thành công, lưu thông tin vào Database và gửi một Notification (thông báo hệ thống) đến cho Admin. Admin có thể xem danh sách các liên hệ này trên trang Quản lý Liên hệ ở Dashboard.

---

### Mở rộng (Các phần đề xuất thêm cho Landing Page)

Ngoài các phần chính, Landing Page sẽ bao gồm các phần sau để tăng tính chuyên nghiệp:
1. **Hero Banner**: Banner to ở đầu trang kèm Slogan và nút "Mua ngay" hoặc "Nhận tư vấn" (Call To Action).
2. **Phần Giới thiệu (Về Chúng Tôi)**: Giới thiệu ngắn 1 đoạn về uy tín của Agrix.
3. **Đánh giá khách hàng (Testimonials)**: Xem feedback của bà con nông dân (dữ liệu quản lý ở Admin).
4. **FAQ (Câu hỏi thường gặp)**: Chứa các hỏi đáp phổ biến, tự động mở ra câu trả lời khi click (dữ liệu quản lý ở Admin).

---

### Edge Cases

- What happens when không có sản phẩm nào được thiết lập hiển thị ra trang chủ? -> Ẩn block Sản phẩm hoặc hiển thị "Sản phẩm sắp ra mắt".
- What happens when admin nhập lỗi thông tin liên hệ ở backend? -> Cần có validate ở backend và fallback thông tin mặc định ở frontend.
- How does system handle form spam? -> Cần áp dụng Rate Limiting cho API submit contact form.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Landing Page MUST hiển thị danh sách các sản phẩm nổi bật (lấy từ dữ liệu quản lý trong Admin).
- **FR-002**: Landing Page MUST hiển thị danh sách các bài viết Blog mới nhất (lấy dữ liệu từ Admin).
- **FR-003**: Landing Page MUST hiển thị phần Thông tin Liên hệ (Tên, Đường, SĐT, Email).
- **FR-004**: Landing Page MUST có một Contact Form (Tên, Số điện thoại, Nội dung tin nhắn).
- **FR-005**: Landing Page MUST tích hợp nút Chatbot AI (đã có) ở góc dưới màn hình một cách liền mạch với các block khác.
- **FR-006**: (Đề xuất) Cần có Hero Banner ở trên cùng để thu hút ánh nhìn đầu tiên.

### Key Entities *(include if feature involves data)*

- **Product**: ID, Name, Price, ImageURL, Description, Status.
- **Blog Post**: ID, Title, ThumbnailURL, Excerpt, PublishedDate, Author.
- **Contact Info Config**: StoreName, Address, PhoneNumber, Email (Lưu cấu hình hệ thống).
- **Contact Submission**: ID, CustomerName, PhoneNumber, Message, CreatedAt, Status (New/Read).
- **Testimonial**: ID, AvatarURL, CustomerName, Content, Rating.
- **FAQ**: ID, Question, Answer, Order.

## Assumptions *(optional)*

- Giả định rằng Cấu hình thông tin liên hệ (SĐT, Địa chỉ) sẽ được thiết lập tự động đọc từ bảng Settings/Configuration của dự án.
- Giả định giao diện Landing Page cần thiết kế Responsive, hoạt động mượt mà trên cả Mobile và Desktop.

## Out of Scope *(optional)*

- (Có thể) Tính năng thanh toán trực tiếp (giỏ hàng phức tạp) trên landing page nếu chưa có yêu cầu; landing page chỉ show sản phẩm và click vào để xem chi tiết hoặc liên hệ tư vấn.

## Success Criteria *(mandatory)*

- Landing Page load các section Sản phẩm, Blog, Liên hệ dưới 2 giây.
- 100% data hiển thị khớp với dữ liệu được quản lý ở Admin Dashboard.
- Users có thể điền gửi Form Liên Hệ thành công trên mọi thiết bị (Mobile/Tablet/PC).
