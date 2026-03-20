# Feature Specification: Professional Blog System

**Feature Branch**: `002-professional-blog`  
**Created**: 2026-03-20  
**Status**: Draft  
**Input**: Nâng cấp hệ thống Blog chuyên nghiệp: rich editor đa phương tiện, danh mục blog, thẻ tag, gắn kết sản phẩm, SEO metadata, upload ảnh lên MinIO.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Soạn thảo bài viết đa phương tiện (Priority: P1)

Quản trị viên mở trang tạo bài viết mới, sử dụng trình soạn thảo đa phương tiện (rich editor) để viết nội dung. Có thể định dạng text (bold, italic, heading, list, quote, code block), chèn ảnh từ máy tính (upload lên MinIO), tạo bảng biểu, chèn link, và xem trước nội dung trước xuất bản.

**Why this priority**: Trình soạn thảo là lõi của hệ thống blog — nếu không viết bài được thì không có blog.

**Independent Test**: Tạo một bài viết mới với heading, ảnh, bảng biểu → Lưu nháp → Mở lại → Nội dung hiển thị đúng.

**Acceptance Scenarios**:

1. **Given** admin ở trang tạo bài viết, **When** nhập tiêu đề và sử dụng toolbar để định dạng text (bold, italic, heading H2-H4, list, blockquote), **Then** nội dung hiển thị đúng formatting trong editor.
2. **Given** admin đang soạn bài, **When** nhấn nút chèn ảnh và chọn file từ máy, **Then** ảnh được upload lên MinIO và chèn inline trong nội dung.
3. **Given** admin đang soạn bài, **When** nhấn chèn bảng, **Then** bảng xuất hiện với khả năng thêm/xóa hàng, cột.
4. **Given** admin hoàn tất soạn bài, **When** nhấn "Lưu nháp", **Then** bài viết lưu với status DRAFT, content lưu dạng HTML.
5. **Given** admin mở bài viết đã lưu, **When** editor load, **Then** nội dung hiển thị đúng bao gồm ảnh, bảng, formatting.
6. **Given** admin đang soạn bài, **When** chỉnh sửa nội dung và chờ 30 giây, **Then** hệ thống tự động lưu nháp và hiển thị "Đã lưu lúc HH:MM".

---

### User Story 2 - Quản lý danh mục blog (Priority: P1)

Quản trị viên quản lý danh mục (categories) riêng cho blog — tạo, sửa, xóa danh mục. Khi tạo bài viết, chọn danh mục từ danh sách. Trang public blog có thể lọc theo danh mục.

**Why this priority**: Danh mục là cách tổ chức nội dung cơ bản, cần thiết cho UX và SEO.

**Independent Test**: Tạo 3 danh mục → Tạo bài viết gán danh mục → Trên trang public, lọc theo danh mục → Chỉ thấy bài đúng danh mục.

**Acceptance Scenarios**:

1. **Given** admin ở trang Blog tab "Danh mục", **When** tạo danh mục mới (tên + slug + mô tả), **Then** danh mục xuất hiện trong danh sách.
2. **Given** admin tạo bài viết, **When** chọn danh mục từ dropdown, **Then** bài viết liên kết với danh mục đã chọn.
3. **Given** khách truy cập trang blog, **When** nhấn vào danh mục, **Then** chỉ hiển thị bài viết thuộc danh mục đó.

---

### User Story 3 - Quản lý thẻ tag (Priority: P2)

Quản trị viên gắn nhiều thẻ tag cho mỗi bài viết. Tag có thể tạo nhanh khi soạn bài hoặc quản lý trong cài đặt.

**Why this priority**: Tags bổ sung cho categories, giúp phân loại linh hoạt hơn và cải thiện SEO.

**Independent Test**: Gán 3 tags cho bài viết → Trên trang public, nhấn tag → Hiển thị tất cả bài cùng tag.

**Acceptance Scenarios**:

1. **Given** admin đang soạn bài, **When** nhập tag mới vào trường tag, **Then** tag tự động tạo và gắn vào bài viết.
2. **Given** admin đang soạn bài, **When** bắt đầu gõ tên tag, **Then** danh sách tag gợi ý xuất hiện (autocomplete).
3. **Given** khách trên trang blog, **When** nhấn vào tag, **Then** hiển thị tất cả bài viết có tag đó.

---

### User Story 4 - Gắn kết sản phẩm vào bài viết (Priority: P2)

Quản trị viên liên kết bài viết với các sản phẩm trong hệ thống. Khi đọc bài, khách hàng thấy danh sách sản phẩm liên quan kèm giá và link.

**Why this priority**: Kết nối blog với sản phẩm tạo kênh marketing hiệu quả, drive traffic sang danh mục sản phẩm.

**Independent Test**: Tạo bài viết → Gắn 2 sản phẩm → Trang public hiển thị card sản phẩm cuối bài.

**Acceptance Scenarios**:

1. **Given** admin đang soạn bài, **When** nhấn "Gắn sản phẩm" và tìm kiếm sản phẩm, **Then** sản phẩm được thêm vào danh sách liên kết.
2. **Given** bài viết đã gắn sản phẩm, **When** khách đọc bài trên trang public, **Then** cuối bài hiển thị card sản phẩm (ảnh, tên, giá).
3. **Given** admin muốn bỏ liên kết, **When** nhấn xóa sản phẩm khỏi danh sách, **Then** sản phẩm không còn hiển thị ở bài viết.

---

### User Story 5 - Quản lý SEO & Metadata (Priority: P2)

Quản trị viên thiết lập meta title, meta description, OG image cho mỗi bài viết để tối ưu SEO và chia sẻ mạng xã hội.

**Why this priority**: SEO là yếu tố quan trọng cho organic traffic. Metadata giúp bài viết hiển thị tốt khi chia sẻ.

**Independent Test**: Tạo bài viết với meta title riêng → Xem page source trang public → Thấy `<title>` và OG tags đúng.

**Acceptance Scenarios**:

1. **Given** admin soạn bài, **When** mở phần SEO settings, **Then** thấy các trường: Meta Title, Meta Description, OG Image.
2. **Given** admin để trống meta title, **When** xuất bản bài, **Then** hệ thống tự dùng title bài viết làm meta title.
3. **Given** bài đã xuất bản, **When** khách truy cập URL bài, **Then** HTML chứa đúng meta tags (title, description, og:image).

---

### User Story 6 - Trang soạn bài full-page (Priority: P1)

Thay vì dialog nhỏ, admin mở trang soạn bài full-page với layout chuyên nghiệp: bên trái là editor, bên phải là panel cài đặt (danh mục, tag, SEO, sản phẩm liên kết, ảnh bìa, trạng thái).

**Why this priority**: Trải nghiệm soạn bài trong dialog nhỏ rất hạn chế — cần full-page editor cho nội dung dài.

**Independent Test**: Nhấn "Tạo bài viết" → Mở trang mới → Viết nội dung + cấu hình sidebar → Lưu → Quay lại danh sách.

**Acceptance Scenarios**:

1. **Given** admin ở danh sách blog, **When** nhấn "Tạo bài viết", **Then** chuyển sang trang `/admin/blog/new` full-page.
2. **Given** admin ở trang soạn, **When** nhìn layout, **Then** bên trái 70% là editor, bên phải 30% là sidebar cài đặt.
3. **Given** admin đang soạn, **When** nhấn "Xuất bản", **Then** bài chuyển status PUBLISHED, `publishedAt` ghi timestamp, redirect về danh sách.

---

### Edge Cases

- Upload ảnh lớn hơn 5MB → Hiển thị lỗi "Ảnh vượt quá 5MB"
- Upload file không phải ảnh → Từ chối với thông báo rõ ràng
- Slug trùng → Tự động thêm suffix `-1`, `-2`
- Xóa danh mục đã gắn bài viết → Bài viết chuyển về "Chưa phân loại"
- Xóa bài viết → Xóa mềm (soft delete) để có thể khôi phục
- MinIO không khả dụng → Hiển thị lỗi upload, vẫn cho lưu bài viết không ảnh

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống phải cung cấp trình soạn thảo đa phương tiện (rich text editor) hỗ trợ: heading (H2-H4), bold, italic, underline, strikethrough, bullet list, numbered list, blockquote, code block, link, horizontal rule.
- **FR-002**: Hệ thống phải cho phép upload ảnh từ máy tính lên MinIO storage và chèn inline vào bài viết.
- **FR-003**: Hệ thống phải hỗ trợ tạo và chỉnh sửa bảng biểu (table) trong editor: thêm/xóa hàng, thêm/xóa cột.
- **FR-004**: Hệ thống phải lưu nội dung bài viết dạng HTML.
- **FR-005**: Hệ thống phải hỗ trợ quản lý danh mục blog (CRUD) với các trường: tên, slug, mô tả.
- **FR-006**: Hệ thống phải hỗ trợ quản lý thẻ tag (CRUD) và gắn nhiều tag cho mỗi bài viết (quan hệ many-to-many).
- **FR-007**: Hệ thống phải cho phép gắn kết sản phẩm vào bài viết (many-to-many) với khả năng tìm kiếm sản phẩm.
- **FR-008**: Hệ thống phải cung cấp các trường SEO metadata: meta title, meta description, OG image URL cho mỗi bài viết.
- **FR-009**: Hệ thống phải tự sinh slug từ title nếu người dùng không nhập (tự động romanize tiếng Việt).
- **FR-010**: Hệ thống phải hỗ trợ ảnh bìa (cover image) riêng biệt cho bài viết, upload lên MinIO.
- **FR-011**: Hệ thống phải có trang soạn bài full-page với editor bên trái và sidebar cài đặt bên phải.
- **FR-012**: Hệ thống phải hỗ trợ xem trước bài viết (preview) trước khi xuất bản.
- **FR-013**: Hệ thống phải hỗ trợ soft delete cho bài viết.
- **FR-014**: Trang blog public phải hỗ trợ lọc theo danh mục và tag.
- **FR-015**: Trang blog public phải hiển thị sản phẩm liên kết dưới dạng card ở cuối bài viết.
- **FR-016**: Hệ thống phải tự động lưu nháp bài viết mỗi 30 giây khi có thay đổi (auto-save lên server), hiển thị trạng thái "Đã lưu lúc HH:MM".
- **FR-017**: Trang blog public phải phân trang (pagination) 10 bài/trang với điều hướng page 1, 2, 3... (SEO-friendly URLs).

### Key Entities

- **BlogCategory**: Danh mục blog — id, name, slug, description. Quan hệ 1-N với BlogPost.
- **BlogTag**: Thẻ tag — id, name, slug. Quan hệ N-N với BlogPost.
- **BlogPost** (nâng cấp): Thêm quan hệ với BlogCategory (ManyToOne), BlogTag (ManyToMany), Product (ManyToMany). Thêm trường: metaTitle, metaDescription, ogImageUrl, deletedAt (soft delete).
- **BlogPostProduct**: Bảng trung gian — blogPostId, productId, displayOrder.

### Assumptions

- MinIO đã cài đặt và cấu hình sẵn (endpoint, access key, secret key từ env vars).
- Rich editor sử dụng **TipTap** (free, đầy đủ tính năng: tables, image upload, formatting, extensible).
- Giới hạn upload ảnh: tối đa 5MB, chấp nhận JPEG/PNG/WebP/GIF.
- Slug tự sinh từ title bằng Vietnamese romanization (remove diacritics + kebab-case).
- Content lưu dạng HTML (TipTap output), không lưu JSON.
- Tất cả CRUD phải kèm toast notification (theo constitution project).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Quản trị viên có thể tạo bài viết với ảnh, bảng, formatting đa dạng trong dưới 10 phút.
- **SC-002**: 100% ảnh upload hiển thị đúng trong cả editor và trang public.
- **SC-003**: Trang blog public load danh sách bài viết trong dưới 2 giây.
- **SC-004**: Bài viết chia sẻ lên mạng xã hội hiển thị đúng title, description, OG image.
- **SC-005**: Danh sách sản phẩm liên kết hiển thị chính xác ở cuối bài viết trên trang public.

## Clarifications

### Session 2026-03-20

- Q: Auto-save khi soạn bài? → A: Auto-save draft mỗi 30 giây lên server, hiển thị "Đã lưu lúc HH:MM".
- Q: Vị trí quản lý Danh mục Blog & Tag? → A: Trong trang Blog với sub-tabs: Bài viết / Danh mục / Tags.
- Q: Public blog: phân trang hay infinite scroll? → A: Phân trang 10 bài/trang, SEO-friendly URLs.
