# Feature Specification: Trợ lý ảo AI (AI Chatbot Assistant)

**Feature Branch**: `003-ai-chatbot-assistant`  
**Created**: 2026-03-20  
**Status**: Draft  
**Input**: User description: "Trợ lý AI chatbot tư vấn sản phẩm nông nghiệp với RAG, trang admin quản lý tài liệu kiến thức, nút Hỏi Ngay trên trang sản phẩm"

## Clarifications

### Session 2026-03-20

- Q: Khi AI provider chính bị lỗi (rate limit, timeout, outage), chatbot xử lý thế nào? → A: Tự động fallback — nếu provider chính lỗi, tự chuyển sang provider phụ (admin cấu hình cả 2 key).
- Q: Giới hạn chi phí AI mỗi cuộc hội thoại? → A: Giới hạn mềm tối đa 20 tin nhắn/session (gợi ý mở session mới), số lượng cấu hình được bởi admin.
- Q: Đồng bộ dữ liệu sản phẩm vào kho kiến thức RAG như thế nào? → A: Manual trigger — admin nhấn nút "Đồng bộ sản phẩm" để cập nhật hàng loạt.
- Q: Lưu trữ lịch sử hội thoại như thế nào? → A: Lưu trên server 30 ngày, admin có thể xem lại để phân tích và cải thiện chatbot.
- Q: Chat widget trên mobile hiển thị như thế nào? → A: Fullscreen trên mobile, popup nhỏ trên desktop.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Khách hàng hỏi chatbot về sản phẩm (Priority: P1)

Khách hàng truy cập trang chi tiết sản phẩm trên Landing Page (Web Base), nhìn thấy nút **"Hỏi Ngay"** nổi bật. Khi nhấn nút, một cửa sổ chat mở ra với ngữ cảnh sản phẩm đang xem đã được tải sẵn. Khách hàng gõ câu hỏi bằng tiếng Việt (ví dụ: "Thuốc này dùng cho cây gì?", "Liều lượng pha bao nhiêu?"). Chatbot trả lời dựa trên dữ liệu sản phẩm và tài liệu kỹ thuật nội bộ, cung cấp thông tin chính xác với nguồn tham chiếu.

**Why this priority**: Đây là tính năng cốt lõi tạo giá trị trực tiếp cho khách hàng — giúp tư vấn mua hàng đúng sản phẩm, tăng chuyển đổi và giảm phụ thuộc nhân viên tư vấn.

**Independent Test**: Có thể test end-to-end bằng cách truy cập trang sản phẩm → nhấn "Hỏi Ngay" → gõ câu hỏi → nhận được câu trả lời có nội dung liên quan đến sản phẩm.

**Acceptance Scenarios**:

1. **Given** khách đang xem trang chi tiết sản phẩm "Thuốc trừ sâu ABC", **When** nhấn nút "Hỏi Ngay", **Then** cửa sổ chat mở ra với tin nhắn chào mừng chứa tên sản phẩm.
2. **Given** cửa sổ chat đang mở với ngữ cảnh sản phẩm, **When** gõ "Cách sử dụng sản phẩm này?", **Then** chatbot trả lời dựa trên hướng dẫn sử dụng của sản phẩm trong hệ thống.
3. **Given** chatbot đang trả lời, **When** câu hỏi nằm ngoài phạm vi dữ liệu, **Then** chatbot thông báo không có thông tin và gợi ý liên hệ cửa hàng.

---

### User Story 2 - Hỏi đáp ngữ cảnh liên kết sản phẩm (Priority: P1)

Khách hàng hoặc nhân viên bán hàng muốn hỏi những câu hỏi liên quan đến nhiều sản phẩm cùng lúc hoặc kiến thức nông nghiệp tổng hợp. Ví dụ: "Thuốc trừ sâu X có thể pha chung phân bón Y không?", "Cây lúa đang bị vàng lá nên dùng loại nào?". Chatbot sẽ tìm kiếm trong kho tài liệu kỹ thuật (RAG) và dữ liệu sản phẩm để đưa ra câu trả lời chính xác, chuyên sâu.

**Why this priority**: Đây là nhu cầu thực tế cao nhất trong ngành nông nghiệp — người dùng cần tư vấn kết hợp, không chỉ thông tin đơn lẻ. Tính năng này tạo sự khác biệt so với tra cứu thông thường.

**Independent Test**: Mở chat widget (floating hoặc trang riêng), gõ câu hỏi liên quan đến nhiều sản phẩm → chatbot trả lời có đề cập sản phẩm cụ thể trong hệ thống.

**Acceptance Scenarios**:

1. **Given** hệ thống đã có dữ liệu sản phẩm thuốc trừ sâu X và phân bón Y, **When** người dùng hỏi "Có pha chung 2 loại được không?", **Then** chatbot trả lời dựa trên tài liệu kỹ thuật với thông tin tương thích/không tương thích.
2. **Given** chatbot nhận câu hỏi về bệnh cây trồng, **When** kho tài liệu có bài viết liên quan, **Then** chatbot tham chiếu thông tin từ tài liệu và gợi ý sản phẩm phù hợp trong cửa hàng.

---

### User Story 3 - Admin quản lý kho tài liệu kiến thức (Priority: P2)

Admin truy cập trang **"Trợ lý AI"** trong Admin Panel. Tại đây, admin có thể: upload tài liệu kỹ thuật nông nghiệp (PDF, DOCX, TXT), quản lý danh sách tài liệu đã nạp, xóa tài liệu cũ, và xem trạng thái xử lý (đang indexing / đã sẵn sàng). Dữ liệu sản phẩm trong hệ thống (tên, mô tả, HDSD) cũng tự động được đưa vào kho kiến thức.

**Why this priority**: Nền tảng cho chất lượng trả lời — không có tài liệu thì chatbot chỉ là shell rỗng. Admin cần kiểm soát nội dung mà AI học.

**Independent Test**: Truy cập Admin → Trợ lý AI → Upload tài liệu PDF → Thấy trạng thái chuyển từ "Đang xử lý" sang "Sẵn sàng" → Hỏi chatbot câu hỏi liên quan đến nội dung tài liệu vừa upload → Nhận được câu trả lời chính xác.

**Acceptance Scenarios**:

1. **Given** admin ở trang Trợ lý AI, **When** upload 1 file PDF tài liệu kỹ thuật, **Then** file xuất hiện trong danh sách với trạng thái "Đang xử lý", sau đó chuyển "Sẵn sàng".
2. **Given** có tài liệu đã được index, **When** admin nhấn xóa tài liệu, **Then** tài liệu bị xóa khỏi danh sách và nội dung không còn được tham chiếu trong câu trả lời chatbot.
3. **Given** admin đã nạp tài liệu mới, **When** chatbot nhận câu hỏi liên quan, **Then** câu trả lời phản ánh nội dung tài liệu mới (có RAG citation).

---

### User Story 4 - Admin cấu hình chatbot (Priority: P3)

Admin có thể tùy chỉnh hành vi chatbot: đặt System Prompt (giai điệu, giới hạn phạm vi trả lời), chọn model AI (GPT-4 / Gemini), cấu hình API keys, và bật/tắt chatbot trên Landing Page.

**Why this priority**: Cho phép admin kiểm soát hoàn toàn trải nghiệm chatbot mà không cần developer.

**Independent Test**: Admin vào cấu hình → sửa system prompt → save → hỏi chatbot → câu trả lời phản ánh prompt mới.

**Acceptance Scenarios**:

1. **Given** admin ở trang cấu hình, **When** thay đổi system prompt và lưu, **Then** chatbot sử dụng prompt mới cho các cuộc hội thoại tiếp theo.
2. **Given** admin tắt chatbot, **When** khách truy cập Landing Page, **Then** nút "Hỏi Ngay" và chat widget không hiển thị.
3. **Given** admin nhập API key không hợp lệ, **When** lưu cấu hình, **Then** hệ thống hiển thị cảnh báo lỗi kết nối.

---

### User Story 5 - Chat widget floating trên Landing Page (Priority: P2)

Khách hàng truy cập bất kỳ trang nào trên Landing Page (trang chủ, blog, danh mục) đều thấy nút chat bubble ở góc phải dưới. Nhấn vào mở cửa sổ chat nhỏ gọn. Khi đang ở trang chi tiết sản phẩm, chat tự động nhận ngữ cảnh sản phẩm đó.

**Why this priority**: Điểm tiếp xúc chính giữa khách hàng và chatbot — cần có mặt khắp nơi trên Landing Page.

**Independent Test**: Truy cập trang chủ → thấy bubble chat → nhấn mở → gõ hỏi → nhận trả lời.

**Acceptance Scenarios**:

1. **Given** khách ở bất kỳ trang Landing Page nào, **When** trang load xong, **Then** hiển thị nút chat bubble ở góc phải dưới.
2. **Given** cửa sổ chat đang mở, **When** khách navigate sang trang khác, **Then** cuộc hội thoại được giữ nguyên.
3. **Given** khách mở chat trên trang sản phẩm cụ thể, **When** gửi tin nhắn, **Then** chatbot tự hiểu đang hỏi về sản phẩm đó.

---

### Edge Cases

- Khi tài liệu upload không đọc được (PDF bảo vệ mật khẩu, file lỗi) → Hệ thống báo lỗi rõ ràng, không crash.
- Khi AI API gặp lỗi (rate limit, timeout, key hết hạn) → Chatbot hiển thị thông báo lỗi friendly và gợi ý liên hệ trực tiếp.
- Khi người dùng gửi tin nhắn quá dài hoặc spam → Giới hạn độ dài tin nhắn (2000 ký tự) và rate limit (10 tin nhắn/phút).
- Khi kho tài liệu rỗng (chưa upload gì) → Chatbot vẫn trả lời dựa trên dữ liệu sản phẩm trong hệ thống, ghi chú "Chưa có tài liệu kỹ thuật bổ sung".
- Khi chatbot bị tắt bởi admin → Widget và nút "Hỏi Ngay" ẩn hoàn toàn, API trả về lỗi 503 nếu gọi trực tiếp.

## Requirements *(mandatory)*

### Functional Requirements

**Chat Interface:**

- **FR-001**: Hệ thống PHẢI hiển thị nút chat bubble floating ở góc phải dưới trên tất cả trang Landing Page.
- **FR-002**: Hệ thống PHẢI hiển thị nút "Hỏi Ngay" trên trang chi tiết sản phẩm, nút này mở cửa sổ chat với ngữ cảnh sản phẩm.
- **FR-003**: Cửa sổ chat PHẢI hỗ trợ giao diện realtime (tin nhắn hiển thị dạng streaming, không chờ toàn bộ response).
- **FR-004**: Hệ thống PHẢI giữ nguyên lịch sử hội thoại trong phiên (session) khi khách navigate giữa các trang.
- **FR-005**: Chat widget PHẢI responsive: fullscreen trên mobile (để tránh keyboard che nội dung), popup nhỏ ở góc màn hình trên desktop.

**AI & RAG Backend:**

- **FR-006**: Hệ thống PHẢI sử dụng RAG (Retrieval-Augmented Generation) để trả lời dựa trên tài liệu nội bộ.
- **FR-007**: Dữ liệu sản phẩm (tên, mô tả, hướng dẫn sử dụng, danh mục) PHẢI được đưa vào kho kiến thức RAG khi admin nhấn nút "Đồng bộ sản phẩm".
- **FR-008**: Hệ thống PHẢI hỗ trợ ngữ cảnh sản phẩm — khi chat từ trang sản phẩm, AI nhận context về sản phẩm đó.
- **FR-009**: Chatbot PHẢI trả lời bằng tiếng Việt, phù hợp ngữ cảnh nông nghiệp Việt Nam.
- **FR-010**: Khi câu hỏi nằm ngoài phạm vi kiến thức, chatbot PHẢI thông báo và gợi ý liên hệ cửa hàng.
- **FR-011**: Hệ thống PHẢI giới hạn độ dài tin nhắn (tối đa 2000 ký tự), rate limit (10 tin nhắn/phút/session), và giới hạn mềm số tin nhắn mỗi session (mặc định 20, cấu hình được). Khi đạt giới hạn, gợi ý người dùng mở session mới.

**Admin - Quản lý Tài liệu:**

- **FR-012**: Admin PHẢI có thể upload tài liệu kỹ thuật (PDF, DOCX, TXT, tối đa 10MB/file).
- **FR-013**: Hệ thống PHẢI hiển thị trạng thái xử lý tài liệu: Đang xử lý → Sẵn sàng / Lỗi.
- **FR-014**: Admin PHẢI có thể xem danh sách tài liệu đã upload với thông tin: tên, kích thước, ngày upload, trạng thái.
- **FR-015**: Admin PHẢI có thể xóa tài liệu — nội dung bị xóa không còn được tham chiếu trong câu trả lời.

**Admin - Cấu hình Chatbot:**

- **FR-016**: Admin PHẢI có thể cấu hình System Prompt (hướng dẫn AI về giai điệu, phạm vi trả lời).
- **FR-017**: Admin PHẢI có thể cấu hình AI provider chính và phụ (OpenAI GPT / Google Gemini), nhập API key cho cả hai. Khi provider chính gặp lỗi, hệ thống PHẢI tự động chuyển sang provider phụ (fallback).
- **FR-018**: Admin PHẢI có thể bật/tắt chatbot trên Landing Page.
- **FR-019**: Hệ thống PHẢI validate API key khi admin lưu cấu hình.
- **FR-020**: Admin PHẢI có thể cấu hình giới hạn số tin nhắn tối đa mỗi session (mặc định: 20).
- **FR-021**: Admin PHẢI có nút "Đồng bộ sản phẩm" để đưa dữ liệu sản phẩm hiện tại vào kho kiến thức RAG (hiển thị trạng thái đồng bộ).
- **FR-022**: Hệ thống PHẢI lưu lịch sử hội thoại trên server trong 30 ngày. Admin PHẢI có thể xem lại lịch sử chat để phân tích chất lượng tư vấn. Dữ liệu quá 30 ngày tự động xóa.

### Key Entities

- **ChatSession**: Đại diện một phiên hội thoại — chứa session ID, ngữ cảnh sản phẩm (nếu có), danh sách tin nhắn, thời gian bắt đầu. Lưu trữ trên server 30 ngày.
- **ChatMessage**: Một tin nhắn trong phiên — vai trò (user/assistant), nội dung, timestamp, sources tham chiếu.
- **KnowledgeDocument**: Tài liệu kiến thức đã upload — tên file, loại file, kích thước, trạng thái (PROCESSING/READY/ERROR), ngày upload, chunks đã index.
- **ChatbotConfig**: Cấu hình chatbot — system prompt, AI provider, API key (encrypted), trạng thái bật/tắt.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng nhận được câu trả lời chatbot trong vòng 5 giây kể từ khi gửi câu hỏi.
- **SC-002**: 80% câu trả lời chatbot phải chứa thông tin chính xác, tham chiếu được đến nguồn tài liệu hoặc sản phẩm cụ thể trong hệ thống.
- **SC-003**: Admin có thể upload tài liệu mới và tài liệu sẵn sàng để chatbot tham chiếu trong vòng 2 phút.
- **SC-004**: Chatbot hoạt động ổn định với 50 cuộc hội thoại đồng thời mà không suy giảm hiệu năng.
- **SC-005**: Giảm 30% số cuộc gọi/tin nhắn tư vấn sản phẩm trực tiếp đến cửa hàng sau 3 tháng triển khai.

## Assumptions

- AI provider (OpenAI hoặc Gemini) được chọn tại thời điểm cấu hình bởi admin, không cần hỗ trợ đa provider cùng lúc.
- Vector database cho RAG sẽ được tích hợp với PostgreSQL thông qua pgvector extension (đã có trong stack hiện tại).
- Dữ liệu sản phẩm tự động sync vào kho kiến thức khi sản phẩm được tạo mới hoặc cập nhật.
- Lịch sử hội thoại lưu trên server 30 ngày, tự động xóa sau đó. Admin có thể xem lại để phân tích.
- File upload tài liệu dùng chung MinIO storage đã có sẵn trong hệ thống.
