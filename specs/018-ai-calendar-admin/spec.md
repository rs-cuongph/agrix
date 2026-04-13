# Feature Specification: Quản lý Mùa vụ & AI Sinh Lịch Canh tác

**Feature Branch**: `018-ai-calendar-admin`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: User description: "Trang quản lý mùa vụ + giai đoạn sinh trưởng cho admin, với chức năng gọi AI tự động sinh dữ liệu lịch mùa vụ (seasons, stages, careActivities, pestWarnings) khi admin không có đủ kiến thức nông nghiệp."  
**Prerequisite**: Module 015-agricultural-season-calendar và 017-calendar-ux-enhance đã implement đầy đủ.

## Clarifications

### Session 2026-04-13

- Q: Giao diện quản lý mùa vụ nằm ở đâu — tích hợp vào trang lịch, trang riêng, hay sidebar? → A: Trang riêng `/admin/season-calendar/manage` — tách biệt giữa "xem lịch" và "quản lý dữ liệu".
- Q: AI generate batch save — 1 transaction, tuần tự, hay cho admin chọn? → A: Batch 1 transaction — tất cả mùa vụ + stages lưu cùng lúc, rollback nếu lỗi.
- Q: Rate limiting cho AI generate? → A: Không giới hạn — admin gọi thoải mái.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Quản lý Mùa vụ CRUD (Priority: P1)

Là quản trị viên, tôi muốn có trang quản lý trực quan để xem danh sách tất cả mùa vụ đã tạo, thêm mùa vụ mới (chọn vùng + cây trồng + tên mùa), sửa thông tin, hoặc xóa mùa vụ không còn dùng — để tôi có thể duy trì dữ liệu lịch canh tác mà không cần can thiệp database.

**Why this priority**: Đây là trang quản lý nền tảng — backend API đã có sẵn nhưng chưa có UI. Admin hiện không có cách nào tạo mùa vụ cho cây trồng mới hoặc xóa mùa vụ sai ngoài seed SQL.

**Independent Test**: Admin truy cập trang `/admin/season-calendar/manage` → thấy bảng danh sách mùa vụ (tên, vùng, cây trồng, số giai đoạn) → nhấn "Thêm mùa vụ" → chọn ĐBSCL + Ngô + "Vụ Đông Xuân" → lưu → mùa vụ mới xuất hiện trong danh sách.

**Acceptance Scenarios**:

1. **Given** admin mở trang `/admin/season-calendar/manage`, **When** trang tải, **Then** hiển thị bảng (Table) tất cả season_calendars: tên vụ, vùng, cây trồng, số giai đoạn, trạng thái (active/inactive), ngày tạo. Hỗ trợ filter theo vùng và cây trồng.
2. **Given** admin nhấn "Thêm mùa vụ", **When** dialog mở ra, **Then** hiển thị form: dropdown chọn vùng, dropdown chọn cây trồng, text input tên mùa vụ (VD: "Vụ Đông Xuân"), textarea ghi chú. Nút "Lưu" gọi API tạo mới.
3. **Given** admin nhấn nút Edit trên 1 dòng, **When** dialog mở, **Then** form chứa dữ liệu hiện tại cho phép sửa tên, ghi chú, trạng thái active/inactive. Nút "Cập nhật" gọi API.
4. **Given** admin nhấn nút Xóa, **When** xác nhận, **Then** mùa vụ bị xóa cùng tất cả giai đoạn liên quan (cascade). Toast thông báo thành công.
5. **Given** admin tạo mùa vụ trùng (cùng vùng + cây trồng + tên), **When** submit, **Then** hệ thống thông báo lỗi trùng lặp — không tạo bản ghi mới.

---

### User Story 2 — Quản lý Giai đoạn Sinh trưởng (Priority: P1)

Là quản trị viên, khi tôi đã tạo mùa vụ, tôi muốn quản lý danh sách các giai đoạn sinh trưởng bên trong mùa vụ đó — thêm giai đoạn mới (tên, loại, tháng bắt đầu–kết thúc, mô tả), sửa thông tin, xóa giai đoạn sai, sắp xếp thứ tự — để lịch mùa vụ hiển thị đúng trên view lịch.

**Why this priority**: Giai đoạn sinh trưởng là dữ liệu cốt lõi của toàn bộ calendar view. Không có giai đoạn → calendar trống.

**Independent Test**: Admin mở mùa vụ "Vụ Đông Xuân — Ngô — ĐBSCL" → tab/section "Giai đoạn" hiện danh sách (rỗng) → nhấn "Thêm giai đoạn" → điền "Gieo hạt / planting / T3–T4 / Chuẩn bị đất, bón lót..." → lưu → giai đoạn xuất hiện. Quay lại trang lịch mùa vụ → timeline hiện thanh bar mới cho giai đoạn "Gieo hạt".

**Acceptance Scenarios**:

1. **Given** admin mở chi tiết 1 mùa vụ, **When** section Giai đoạn tải, **Then** hiển thị danh sách giai đoạn: tên, loại (gieo trồng/chăm sóc/thu hoạch) với color badge, tháng bắt đầu–kết thúc, mô tả ngắn. Sorted theo sortOrder.
2. **Given** admin nhấn "Thêm giai đoạn", **When** form mở, **Then** hiển thị: text input tên, select loại (planting/care/harvest), select tháng bắt đầu (1–12), select tháng kết thúc (1–12), textarea mô tả, textarea keywords (comma-separated), danh sách careActivities (text[] — thêm dòng, xóa dòng), input sortOrder.
3. **Given** admin nhấn Edit trên giai đoạn, **When** form mở, **Then** chứa dữ liệu hiện có cho phép chỉnh sửa tất cả trường. Nút "Cập nhật" gọi API.
4. **Given** admin nhấn Xóa giai đoạn, **When** xác nhận, **Then** giai đoạn bị xóa cùng recommendations + pest warnings liên quan. Toast thông báo.
5. **Given** admin thêm/sửa giai đoạn thành công, **When** quay lại trang lịch mùa vụ, **Then** timeline/grid cập nhật hiện đúng giai đoạn vừa thay đổi.

---

### User Story 3 — AI Sinh Lịch Mùa vụ Tự động (Priority: P1)

Là quản trị viên không có chuyên môn nông nghiệp sâu, tôi muốn nhấn một nút "AI tạo lịch" sau khi chọn vùng + cây trồng, để hệ thống tự động sinh ra toàn bộ mùa vụ + giai đoạn sinh trưởng + hoạt động chăm sóc + cảnh báo sâu bệnh phù hợp — tôi chỉ cần review và xác nhận lưu.

**Why this priority**: Đây là tính năng differentiator chính — giải quyết bài toán admin thiếu kiến thức nông nghiệp. Biến quy trình nhập liệu hàng giờ thành 1 click.

**Independent Test**: Admin mở trang Quản lý Mùa vụ → nhấn "AI tạo lịch" → chọn vùng "Tây Nguyên" + cây "Cà phê" → chờ 5-10 giây → preview hiện 2 mùa vụ (Mùa thu hoạch, Mùa chăm sóc) với 6 giai đoạn đầy đủ (thu hái, phơi, tỉa cành, bón phân, tưới...), mỗi giai đoạn có careActivities + pestWarnings dự kiến → admin review, bỏ 1 pestWarning không phù hợp → confirm "Lưu tất cả" → data lưu vào DB → timeline hiện đầy đủ.

**Acceptance Scenarios**:

1. **Given** admin nhấn nút "AI tạo lịch", **When** dialog mở, **Then** hiển thị: dropdown chọn vùng, dropdown chọn cây trồng, textarea "Ghi chú thêm" (tùy chọn — cho admin bổ sung context VD: "giống cà phê robusta ở Đắk Lắk, có tưới nhỏ giọt"). Nút "Tạo lịch".
2. **Given** admin chọn vùng + crop và nhấn "Tạo lịch", **When** hệ thống đang xử lý, **Then** hiển thị trạng thái loading với thông báo "AI đang phân tích dữ liệu nông nghiệp..." (quay 5-15 giây).
3. **Given** AI trả về kết quả, **When** preview hiển thị, **Then** hiện danh sách mùa vụ dự kiến, mỗi mùa vụ chứa: tên vụ, giai đoạn sinh trưởng (tên, loại, tháng, mô tả, careActivities[], pestWarnings[]), tổ chức dạng Accordion collapsible.
4. **Given** preview hiển thị, **When** admin muốn chỉnh sửa, **Then** có thể: (a) Sửa tên mùa vụ (inline edit), (b) Xóa mùa vụ không muốn (nút X), (c) Sửa tên/tháng/mô tả giai đoạn (inline edit), (d) Xóa giai đoạn không phù hợp, (e) Thêm/xóa items trong careActivities, (f) Thêm/xóa pestWarnings.
5. **Given** admin đã review xong preview, **When** nhấn "Lưu tất cả", **Then** hệ thống tạo tất cả mùa vụ + giai đoạn + careActivities + pestWarnings vào database trong 1 batch transaction (atomic — hoặc tất cả thành công, hoặc rollback toàn bộ). Toast "Đã tạo X mùa vụ, Y giai đoạn thành công".
6. **Given** AI generate thất bại (timeout, lỗi API), **When** kết quả lỗi, **Then** hiện thông báo lỗi thân thiện "Không thể tạo lịch tự động. Vui lòng thử lại hoặc nhập thủ công." Nút "Thử lại" và nút "Nhập thủ công" (fallback về CRUD).
7. **Given** vùng + cây trồng đã có mùa vụ trong hệ thống, **When** admin chạy AI generate, **Then** hiện cảnh báo "Vùng này đã có X mùa vụ cho cây Y. Bạn muốn: (a) Tạo thêm mùa vụ mới, (b) Thay thế toàn bộ, (c) Hủy."
8. **Given** batch save thất bại giữa chừng (VD: lỗi DB), **When** transaction rollback, **Then** không có data nào được tạo. Hiện thông báo lỗi "Lưu thất bại, không có thay đổi nào được áp dụng. Vui lòng thử lại."

---

### User Story 4 — Quản lý Gợi ý Sản phẩm trong Giai đoạn (Priority: P2)

Là quản trị viên, khi xem chi tiết giai đoạn sinh trưởng, tôi muốn quản lý danh sách sản phẩm gợi ý (product recommendations) — thêm sản phẩm phù hợp từ kho hàng, ghi chú liều lượng, set mức ưu tiên — để nông dân thấy gợi ý sản phẩm chính xác khi xem calendar.

**Why this priority**: Product recommendations liên kết module mùa vụ với hệ thống bán hàng — tối ưu cho sales. Nhưng cần US1+US2 làm nền tảng trước.

**Independent Test**: Admin mở giai đoạn "Đẻ nhánh" → section Sản phẩm gợi ý → nhấn "Thêm" → search chọn "Phân bón NPK 20-20-15" → ghi liều lượng "25kg/ha" → ưu tiên 1 → lưu → sản phẩm xuất hiện trong danh sách.

**Acceptance Scenarios**:

1. **Given** admin mở chi tiết giai đoạn, **When** section Sản phẩm gợi ý tải, **Then** hiển thị danh sách recommendations: tên sản phẩm, SKU, lý do gợi ý, liều lượng, mức ưu tiên. Có nút thêm/xóa.
2. **Given** admin nhấn "Thêm sản phẩm", **When** dialog mở, **Then** hiển thị: combobox search sản phẩm từ kho (search theo tên hoặc SKU), textarea lý do gợi ý, text input liều lượng, number input ưu tiên (1-5). Nút "Thêm".
3. **Given** admin nhấn Xóa, **When** xác nhận, **Then** recommendation bị xóa. Toast thông báo.

---

### User Story 5 — Quản lý Cảnh báo Sâu bệnh trong Giai đoạn (Priority: P2)

Là quản trị viên, khi xem chi tiết giai đoạn, tôi muốn quản lý danh sách cảnh báo sâu bệnh — thêm loại sâu bệnh phổ biến, mô tả triệu chứng, mức nghiêm trọng, ghi chú phòng ngừa, và link sản phẩm phòng trị — để nông dân được cảnh báo khi xem Stage Detail Sheet.

**Why this priority**: Pest warnings là data bổ sung cho stage detail (feature 017). Admin cần UI để nhập mà không phải chạy SQL.

**Independent Test**: Admin mở giai đoạn "Đẻ nhánh" → section Sâu bệnh → nhấn "Thêm" → điền "Rầy nâu / severity high / triệu chứng / phòng ngừa / chọn sản phẩm trị" → lưu → cảnh báo hiện trong Stage Detail Sheet với severity badge đỏ.

**Acceptance Scenarios**:

1. **Given** admin mở chi tiết giai đoạn, **When** section Sâu bệnh tải, **Then** hiển thị danh sách pest warnings: tên, severity badge (low=blue, medium=amber, high=red), triệu chứng (truncated), số sản phẩm phòng trị. Có nút thêm/sửa/xóa.
2. **Given** admin nhấn "Thêm sâu bệnh", **When** form mở, **Then** hiển thị: text input tên, select severity (low/medium/high), textarea triệu chứng, textarea phòng ngừa, multi-select sản phẩm phòng trị (combobox search từ kho), text input ghi chú liều cho mỗi sản phẩm chọn. Nút "Lưu".
3. **Given** admin sửa pest warning, **When** cập nhật xong, **Then** Stage Detail Sheet trên calendar hiện thông tin mới ngay lập tức.

---

### Edge Cases

- AI generate cho cây trồng ít phổ biến (VD: "Cây thanh long" ở Tây Bắc) — AI có thể trả về kết quả ít chính xác. Cần cảnh báo "Kết quả AI mang tính tham khảo, vui lòng kiểm tra lại."
- AI generate timeout (> 30 giây) — hệ thống cắt request, hiện nút "Thử lại".
- Admin tạo giai đoạn với tháng bắt đầu > tháng kết thúc (cross-year, VD: T11–T2) — hệ thống cho phép, đây là trường hợp hợp lệ.
- Admin xóa mùa vụ có nhiều giai đoạn + recommendations — cascade delete tất cả. Dialog xác nhận nêu rõ số lượng bị xóa.
- AI trả về JSON format sai — hệ thống retry 1 lần, nếu vẫn lỗi thì fallback thông báo lỗi.
- Duplicate mùa vụ (cùng vùng + crop + tên) — API từ chối, UI hiện thông báo.
- Admin nhập careActivities rỗng (array trống) — cho phép, không bắt buộc.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cung cấp trang quản lý mùa vụ (season calendars) cho admin, hiển thị danh sách dạng bảng với filter theo vùng và cây trồng.
- **FR-002**: Admin PHẢI có thể thêm, sửa, xóa mùa vụ qua giao diện. Xóa cascade tất cả giai đoạn + recommendations + pest warnings liên quan.
- **FR-003**: Hệ thống PHẢI cung cấp giao diện quản lý giai đoạn sinh trưởng bên trong mỗi mùa vụ, bao gồm thêm/sửa/xóa giai đoạn với các trường: tên, loại (planting/care/harvest), tháng bắt đầu–kết thúc, mô tả, keywords, careActivities, sortOrder.
- **FR-004**: Hệ thống PHẢI cung cấp nút "AI tạo lịch" cho phép admin chọn vùng + cây trồng, sau đó hệ thống gọi AI để sinh tự động toàn bộ cấu trúc mùa vụ + giai đoạn + careActivities + pestWarnings.
- **FR-005**: Kết quả AI PHẢI được hiển thị dưới dạng preview có thể chỉnh sửa (editable preview) trước khi admin xác nhận lưu.
- **FR-006**: Admin PHẢI có thể chỉnh sửa mọi trường trong preview AI: thêm/xóa mùa vụ, sửa giai đoạn, thêm/xóa careActivities, thêm/xóa pestWarnings.
- **FR-007**: Khi nhấn "Lưu tất cả" từ preview, hệ thống PHẢI tạo tất cả data trong 1 batch operation.
- **FR-008**: Hệ thống PHẢI xử lý lỗi AI gracefully: hiện thông báo lỗi thân thiện + nút "Thử lại" + fallback "Nhập thủ công".
- **FR-009**: Khi vùng + cây trồng đã có mùa vụ, hệ thống PHẢI cảnh báo và cho admin chọn: tạo thêm / thay thế toàn bộ / hủy.
- **FR-010**: Admin PHẢI có thể quản lý product recommendations cho mỗi giai đoạn: thêm sản phẩm (search từ kho), ghi lý do, liều lượng, mức ưu tiên.
- **FR-011**: Admin PHẢI có thể quản lý pest warnings cho mỗi giai đoạn: thêm sâu bệnh, severity, triệu chứng, phòng ngừa, link sản phẩm phòng trị.
- **FR-012**: Mọi thao tác CRUD PHẢI hiển thị toast notification (success/error) và ghi activity log.
- **FR-013**: Preview AI NÊN hiển thị disclaimer "Kết quả AI mang tính tham khảo, vui lòng kiểm tra lại với chuyên gia nông nghiệp."
- **FR-014**: Trang quản lý mùa vụ PHẢI nằm ở đường dẫn riêng `/admin/season-calendar/manage`, tách biệt với trang xem lịch chính. Có link navigation từ trang lịch chính sang.
- **FR-015**: Khi "Lưu tất cả" từ AI preview, hệ thống PHẢI thực hiện trong 1 database transaction — hoặc tất cả thành công, hoặc rollback toàn bộ.
- **FR-016**: Hệ thống KHÔNG giới hạn số lần gọi AI generate — admin có thể sử dụng không hạn chế.

### Key Entities

- **Season Calendar (đã có)**: Mùa vụ — liên hệ vùng + cây trồng. CRUD qua admin.
- **Growth Stage (đã có)**: Giai đoạn sinh trưởng — thuộc 1 mùa vụ. CRUD qua admin.
- **Product Recommendation (đã có)**: Gợi ý sản phẩm — thuộc 1 giai đoạn. CRUD qua admin.
- **Pest Warning (đã có)**: Cảnh báo sâu bệnh — thuộc 1 giai đoạn. CRUD qua admin.
- **AI Generate Request (transient)**: Yêu cầu AI tạo lịch — vùng, cây trồng, ghi chú thêm. Không lưu database — chỉ dùng trong session.
- **AI Generate Response (transient)**: Kết quả AI — danh sách mùa vụ dự kiến + giai đoạn + careActivities + pestWarnings. Preview hiển thị rồi lưu khi admin confirm.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin tạo được mùa vụ mới + giai đoạn sinh trưởng hoàn chỉnh trong dưới 2 phút (thủ công CRUD).
- **SC-002**: Với AI generate, admin tạo được lịch mùa vụ đầy đủ cho 1 cây trồng mới trong dưới 1 phút (bao gồm review + confirm).
- **SC-003**: AI sinh lịch với độ chính xác ≥ 80% cho các cây trồng phổ biến tại Việt Nam (lúa, ngô, cà phê, tiêu, rau màu) — nghĩa là ≥ 80% giai đoạn do AI tạo không cần sửa đổi đáng kể.
- **SC-004**: 100% thao tác CRUD trên mùa vụ + giai đoạn đều có UI quản lý — admin không cần chạy SQL cho bất kỳ data nào.
- **SC-005**: Thời gian phản hồi AI generate ≤ 15 giây cho trường hợp thông thường.
- **SC-006**: Khi AI thất bại, admin vẫn có thể nhập liệu thủ công qua CRUD — không bị block.

## Assumptions

- Backend CRUD APIs cho calendar, stage, recommendation, pest warning đã có sẵn từ feature 015 + 017 — feature này chỉ tạo UI.
- AI integration (OpenAI/Gemini) đã được cấu hình trong backend từ feature 015 — feature này thêm 1 endpoint mới sử dụng AI provider đó.
- AI prompt sẽ include context về vùng (tỉnh, khí hậu) + cây trồng (tên, loại) để sinh kết quả phù hợp.
- AI response format là structured JSON — sử dụng JSON mode hoặc function calling để đảm bảo format chính xác.
- Ghi chú thêm (user notes) trong AI request giúp cải thiện chất lượng nhưng không bắt buộc.
- Trang quản lý mùa vụ đặt tại `/admin/season-calendar/manage` — riêng biệt với trang xem lịch `/admin/season-calendar`.
- Batch save dùng transaction — đảm bảo atomic, không có partial state.
- Không áp dụng rate limiting cho AI generate — tin tưởng admin sử dụng hợp lý.
- Preview chỉ lưu trong client state — nếu user đóng dialog mà chưa confirm thì data mất.

## Dependencies

- Feature 015 (agricultural-season-calendar) phải hoàn thành — entities, APIs, seed data.
- Feature 017 (calendar-ux-enhance) nên hoàn thành — pest warnings table, careActivities column, Gantt timeline view.
- AI provider (OpenAI/Gemini) phải khả dụng và có API key cấu hình.
- Bảng products phải có dữ liệu — cần cho product search khi thêm recommendations.
