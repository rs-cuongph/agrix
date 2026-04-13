# Feature Specification: Nâng cấp UX Lịch Mùa vụ Nông nghiệp

**Feature Branch**: `017-calendar-ux-enhance`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: User description: "Nâng cấp UX giao diện Lịch Mùa vụ — Timeline Gantt view, highlight tháng hiện tại, enriched stage detail, multi-season overlay, year timeline, quick stats, search cây trồng, weather overlay, mini dashboard, activity log. Loại bỏ: export lịch, comparison mode, notification/reminder, calendar sync."  
**Prerequisite**: Module 015-agricultural-season-calendar đã implement đầy đủ (entities, API, admin CRUD, chatbot integration).

## Clarifications

### Session 2026-04-13

- Q: Gantt Timeline nên thay thế hay cùng tồn tại với Grid/Table views hiện có? → A: Coexist — Gantt là view mode thứ 3 trong toggle Grid / Table / Timeline.
- Q: pestWarnings data structure: text[], structured JSONB, hay separate table? → A: Separate `pest_warnings` table với FK đến growth_stages và products — cho phép link sản phẩm phòng trị.
- Q: Activity log retention policy? → A: 6 tháng — tự động purge entries cũ hơn 6 tháng.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Year Timeline / Gantt View (Priority: P1)

Là nhân viên kinh doanh hoặc nông dân, tôi muốn xem toàn bộ lịch mùa vụ của một vùng dưới dạng biểu đồ thanh ngang (Gantt-style) trải dài 12 tháng, trong đó mỗi cây trồng là một hàng và mỗi giai đoạn sinh trưởng là một thanh ngang có màu, để tôi nắm được tổng quan thời vụ cả năm trong một lần nhìn.

**Why this priority**: Đây là cải thiện trực quan lớn nhất. Grid 12 ô vuông nhỏ hiện tại rất khó đọc — người dùng không thể nhìn nhanh "giai đoạn kéo dài bao lâu" hay "tháng này đang bận gì". Gantt view là chuẩn công nghiệp cho lịch biểu thời gian.

**Independent Test**: Truy cập trang Lịch Mùa vụ, chọn vùng ĐBSCL → thấy biểu đồ Gantt với cây lúa hiển thị 3 vụ (Đông Xuân, Hè Thu, Thu Đông), mỗi vụ có thanh bar gieo trồng / chăm sóc / thu hoạch trải theo chiều ngang 12 tháng. Đường đỏ dọc đánh dấu tháng hiện tại.

**Acceptance Scenarios**:

1. **Given** người dùng đã chọn vùng và đang xem calendar, **When** họ chuyển sang view "Timeline" trong toggle 3 chế độ (Grid / Table / Timeline), **Then** hệ thống hiển thị biểu đồ Gantt ngang: trục X = 12 tháng (T1–T12), trục Y = danh sách cây trồng, mỗi giai đoạn sinh trưởng là 1 bar có màu (gieo trồng = emerald, chăm sóc = blue, thu hoạch = amber). Hai chế độ Grid và Table hiện có vẫn hoạt động bình thường.
2. **Given** biểu đồ Gantt đang hiển thị, **When** giai đoạn cross-year (VD: startMonth=11, endMonth=2), **Then** thanh bar hiển thị đúng: một đoạn từ T11–T12 và một đoạn wrap từ T1–T2, với visual indicator rõ ràng rằng đây là cùng giai đoạn.
3. **Given** biểu đồ Gantt đang hiển thị, **When** tháng hiện tại là T4, **Then** có đường indicator dọc (hoặc dải nền highlight) ở cột T4 để người dùng biết "mình đang ở đâu". Label "Hôm nay" hiển thị phía trên đường đó.
4. **Given** biểu đồ Gantt đang hiển thị, **When** người dùng hover lên một thanh bar, **Then** hiện tooltip chứa: tên giai đoạn, loại (gieo trồng/chăm sóc/thu hoạch), thời gian (T? – T?), mô tả ngắn của giai đoạn.
5. **Given** biểu đồ Gantt đang hiển thị, **When** người dùng click vào một thanh bar, **Then** mở Sheet chi tiết giai đoạn (tái sử dụng Sheet hiện có từ SeasonCalendarGrid) bao gồm mô tả, keywords, và gợi ý sản phẩm.

---

### User Story 2 — Enriched Stage Detail Panel (Priority: P1)

Là người dùng (nông dân hoặc nhân viên kinh doanh), khi tôi click vào giai đoạn sinh trưởng trên lịch, tôi muốn thấy thông tin chi tiết phong phú hơn — không chỉ tên và mô tả mà còn có hướng dẫn kỹ thuật canh tác, cảnh báo sâu bệnh phổ biến, và checklist hoạt động cần làm — để tôi có thể tư vấn hoặc tự áp dụng ngay tại ruộng.

**Why this priority**: Sheet chi tiết hiện tại chỉ có description 1 dòng + sản phẩm gợi ý. Đây là nơi tạo giá trị lớn nhất cho nông dân — biến module này từ "lịch tham khảo" thành "cẩm nang canh tác".

**Independent Test**: Click vào giai đoạn "Đẻ nhánh" của cây lúa → Sheet mở ra hiển thị đầy đủ: mô tả kỹ thuật, danh sách hoạt động chăm sóc (checklist), cảnh báo sâu bệnh, water management notes, và gợi ý sản phẩm.

**Acceptance Scenarios**:

1. **Given** người dùng click vào giai đoạn trên calendar (Grid/Table/Timeline), **When** Sheet detail mở ra, **Then** hiển thị các section: (a) Thông tin giai đoạn (tên, loại, thời gian), (b) Mô tả kỹ thuật — textarea dài hơn với bullet points, (c) Hoạt động chăm sóc — checklist tham khảo (tưới nước, bón phân, phun thuốc...), (d) Cảnh báo sâu bệnh — nếu có, (e) Gợi ý sản phẩm (đã có).
2. **Given** giai đoạn có trường `careActivities` (danh sách hoạt động), **When** Sheet hiển thị, **Then** render dạng checklist (checkbox + text) để nông dân có thể đánh dấu "đã làm" (chỉ UI, không lưu backend).
3. **Given** giai đoạn có bản ghi pest_warnings liên kết (từ bảng riêng), **When** Sheet hiển thị, **Then** render với icon warning, tên sâu bệnh, mô tả triệu chứng, và sản phẩm phòng trị (link trực tiếp đến product từ FK).

---

### User Story 3 — Quick Stats & Mini Dashboard (Priority: P2)

Là nhân viên quản lý kho hoặc sales manager, tôi muốn thấy tổng quan nhanh về tháng hiện tại khi mở trang Lịch Mùa vụ — bao nhiêu cây đang gieo trồng, chăm sóc, thu hoạch — để tôi biết ngay đâu là ưu tiên bán hàng tháng này, không cần cuộn xuống từng card.

**Why this priority**: Trang hiện tại có 3 card stats nhưng thông tin rất chung (vùng đang xem, số cây trồng, số entries). Cần stats theo giai đoạn để tạo actionable insight ngay lần đầu nhìn.

**Independent Test**: Mở trang Lịch Mùa vụ → phần stats phía trên hiển thị: "Tháng 4 — 🌱 3 cây gieo trồng • 💧 5 cây chăm sóc • 🌾 2 cây thu hoạch" với chip/pill cho mỗi loại. Trạng thái cập nhật ngay khi đổi tháng hoặc vùng.

**Acceptance Scenarios**:

1. **Given** người dùng đã chọn vùng và tháng, **When** dữ liệu calendar tải xong, **Then** phần stats hiển thị: (a) Số cây đang gieo trồng tháng này, (b) Số cây đang chăm sóc, (c) Số cây đang thu hoạch, (d) Tổng số giai đoạn active. Mỗi metric là card nhỏ với icon và màu tương ứng (emerald/blue/amber).
2. **Given** stats hiển thị, **When** người dùng click vào card "Chăm sóc (5 cây)", **Then** tự động filter calendar grid bên dưới chỉ hiện cây trong giai đoạn chăm sóc.
3. **Given** người dùng đổi tháng từ T4 sang T8, **When** dữ liệu tải lại, **Then** stats cập nhật theo data mới — số lượng thay đổi, không hiện số cũ.

---

### User Story 4 — Search / Filter Cây Trồng Nhanh (Priority: P2)

Là người dùng quản lý nhiều cây trồng (10+ loại), tôi muốn tìm nhanh cây trồng trên lịch bằng cách gõ tên tiếng Việt (kể cả tên gọi địa phương) — "lúa", "bắp", "cà phê" — thay vì phải cuộn qua toàn bộ danh sách để tìm.

**Why this priority**: Khi số cây trồng lớn (20+), việc cuộn tìm trong dropdown hoặc grid trở nên chậm. Cần search inline nhanh.

**Independent Test**: Trên trang calendar, gõ "bắp" vào ô search → calendar chỉ hiện cây Ngô (vì "bắp" là tên gọi khác của ngô, thuộc trường localNames).

**Acceptance Scenarios**:

1. **Given** trang calendar đang hiện tất cả cây trồng, **When** người dùng gõ "lúa" vào ô tìm kiếm, **Then** calendar filter chỉ hiện các entry có crop.name hoặc crop.localNames chứa "lúa".
2. **Given** người dùng gõ vào ô tìm kiếm, **When** keyword khớp với localNames (VD: "bắp" khớp ngô), **Then** kết quả hiển thị entry của cây Ngô, kèm badge/tag nhỏ "bắp" để user biết tại sao nó match.
3. **Given** người dùng gõ keyword không khớp bất kỳ cây nào, **When** filter applied, **Then** hiển thị empty state "Không tìm thấy cây trồng nào phù hợp" kèm gợi ý xóa filter.
4. **Given** search đang active, **When** người dùng clear input (nhấn X hoặc xóa toàn bộ text), **Then** calendar trở lại hiển thị tất cả cây trồng.

---

### User Story 5 — Multi-Season Overlay View (Priority: P3)

Là nhân viên quản lý kho, tôi muốn chọn nhiều cây trồng và xem tất cả lịch mùa vụ overlay trên cùng một timeline, để biết "tháng 3 bận gì?" — liệu có 5 loại cây cùng cần bón phân hay không, để tôi có thể dự trữ hàng phù hợp.

**Why this priority**: Hiện mỗi calendar card hiển thị riêng. Overlay giúp nhìn cross-crop workload — quan trọng cho supply planning nhưng không phải MVP.

**Independent Test**: Bật overlay mode → chọn 3 cây (Lúa, Ngô, Cà phê) → timeline hiển thị tất cả giai đoạn trên cùng 1 trục 12 tháng, mỗi cây 1 row nhưng gộp chung trong 1 view compact.

**Acceptance Scenarios**:

1. **Given** người dùng ở trang calendar, **When** họ bật "Overlay mode" và chọn nhiều cây trồng (multiselect), **Then** timeline Gantt hiển thị tất cả cây đã chọn trên cùng biểu đồ, giữ color coding riêng biệt cho từng stageType.
2. **Given** overlay đang hiện 3 cây, **When** tháng hiện tại có cả 3 cây cùng ở giai đoạn "chăm sóc", **Then** hiển thị highlight tháng đó với badge "3 cây — Chăm sóc" để cảnh báo workload cao.
3. **Given** overlay đang active, **When** người dùng bỏ chọn 1 cây, **Then** timeline cập nhật ngay lập tức, chỉ còn 2 cây.

---

### User Story 6 — Weather Overlay (Priority: P3)

Là nông dân, tôi muốn thấy thông tin khí hậu trung bình (nhiệt độ, lượng mưa) cạnh từng tháng trên calendar để đối chiếu lịch mùa vụ với điều kiện thời tiết — từ đó quyết định có nên trồng sớm/muộn hơn.

**Why this priority**: Nice-to-have, bổ sung thêm context cho quyết định canh tác. Dùng dữ liệu khí hậu tĩnh (trung bình nhiều năm) theo vùng, không cần API realtime.

**Independent Test**: Chọn vùng ĐBSCL → phía dưới trục tháng của timeline hiện thanh bar nhỏ biểu diễn: nhiệt độ TB (°C) và lượng mưa TB (mm). Hover hiện giá trị cụ thể.

**Acceptance Scenarios**:

1. **Given** người dùng đang xem timeline, **When** toggle "Thời tiết" được bật, **Then** phía dưới trục tháng hiển thị mini chart: thanh bar lượng mưa (mm) + đường nhiệt độ (°C) cho vùng đang chọn.
2. **Given** weather overlay đang hiển thị, **When** người dùng hover lên tháng 7, **Then** tooltip hiện: "T7 — ĐBSCL: 230mm mưa, 28°C trung bình".
3. **Given** dữ liệu thời tiết không có cho vùng đang chọn, **When** toggle weather bật, **Then** hiện thông báo nhẹ "Chưa có dữ liệu khí hậu cho vùng này" và không làm crash UI.

---

### User Story 7 — Activity Log (Priority: P3)

Là quản trị viên, tôi muốn xem ai đã thêm/sửa/xóa giai đoạn gì, cây trồng nào, khi nào — để kiểm soát chất lượng dữ liệu mùa vụ và audit khi có sai sót.

**Why this priority**: Nice-to-have cho admin governance. Quan trọng khi có nhiều admin cùng quản lý dữ liệu mùa vụ.

**Independent Test**: Admin sửa giai đoạn "Đẻ nhánh" của Lúa → vào trang Activity Log → thấy dòng "Admin Cường đã cập nhật giai đoạn 'Đẻ nhánh' — Cây lúa — ĐBSCL — 13/04/2026 20:15".

**Acceptance Scenarios**:

1. **Given** admin thực hiện thao tác CRUD (thêm/sửa/xóa) trên bất kỳ entity mùa vụ nào (zone, crop, calendar, stage, recommendation), **When** thao tác hoàn tất, **Then** hệ thống ghi log: actor (tên admin), action (create/update/delete), target (entity + tên), timestamp.
2. **Given** admin mở trang Activity Log, **When** danh sách log tải, **Then** hiển thị dạng timeline (dòng thời gian), mỗi entry có: avatar/icon, tên admin, action, target, thời gian (relative: "2 giờ trước"). Filter theo entity type và khoảng thời gian.
3. **Given** danh sách log > 50 entries, **When** cuộn xuống, **Then** infinite scroll tải thêm 20 entries mỗi lần, không tải tất cả 1 lúc.

---

### Edge Cases

- Giai đoạn cross-year (startMonth=11, endMonth=2) trên Gantt: thanh bar phải split hoặc wrap rõ ràng, không bị cắt đứt.
- Cây trồng không có giai đoạn nào cho tháng hiện tại: vẫn hiện trên timeline nhưng không có bar active — đường "Hôm nay" đi qua vùng trống.
- Vùng không có dữ liệu thời tiết: weather toggle hiện thông báo nhẹ, không crash.
- Search keyword rỗng hoặc chỉ toàn whitespace: bỏ qua filter, hiện tất cả.
- Backend trả empty array cho suggestions: Sheet hiện "Chưa có gợi ý" gracefully.
- Nhiều cây cùng overlay trên timeline: phải phân biệt bằng tên row, không chồng bar lên nhau.
- Activity log khi chưa có admin action nào: hiện empty state "Chưa có hoạt động nào được ghi nhận."
- Activity log entries cũ hơn 6 tháng bị tự động purge: UI không hiện entries đã bị xóa, filter thời gian giới hạn tối đa 6 tháng trước.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cung cấp chế độ xem Timeline/Gantt ngang như view mode thứ 3 (cùng tồn tại với Grid và Table hiện có), hiển thị cây trồng trên trục Y và 12 tháng trên trục X, các giai đoạn sinh trưởng dưới dạng thanh bar có màu.
- **FR-002**: Thanh bar Gantt PHẢI sử dụng color coding nhất quán: gieo trồng (emerald green), chăm sóc (sky blue), thu hoạch (amber).
- **FR-003**: Hệ thống PHẢI hiển thị đường indicator dọc ("Hôm nay") đánh dấu tháng hiện tại trên timeline, với label rõ ràng phía trên.
- **FR-004**: Hệ thống PHẢI xử lý đúng giai đoạn cross-year (startMonth > endMonth) trên timeline bằng cách split bar hoặc wrap rõ ràng.
- **FR-005**: Khi hover lên thanh bar Gantt, hệ thống PHẢI hiển thị tooltip với tên giai đoạn, loại, thời gian, và mô tả.
- **FR-006**: Khi click vào thanh bar Gantt, hệ thống PHẢI mở Sheet chi tiết giai đoạn (tái sử dụng UI hiện có).
- **FR-007**: Sheet chi tiết giai đoạn PHẢI hiển thị các section mở rộng: mô tả kỹ thuật, hoạt động chăm sóc (dạng checklist), cảnh báo sâu bệnh, và gợi ý sản phẩm.
- **FR-008**: Checklist hoạt động chăm sóc trong Sheet PHẢI cho phép người dùng đánh dấu "đã làm" ở phía client (không cần persist backend).
- **FR-009**: Phần stats phía trên trang calendar PHẢI hiển thị số cây đang gieo trồng, chăm sóc, và thu hoạch cho vùng + tháng đang chọn, với icon và màu tương ứng.
- **FR-010**: Click vào card stat PHẢI tự động filter danh sách calendar bên dưới theo giai đoạn tương ứng.
- **FR-011**: Hệ thống PHẢI cung cấp ô tìm kiếm cây trồng hỗ trợ tìm theo tên chính (crop.name) và tên gọi địa phương (crop.localNames).
- **FR-012**: Khi search match qua localNames, hệ thống PHẢI hiển thị tag nhỏ cho biết keyword nào đã match.
- **FR-013**: Hệ thống PHẢI hỗ trợ chế độ overlay — cho phép chọn nhiều cây trồng và xem tất cả trên cùng 1 timeline.
- **FR-014**: Hệ thống NÊN hiển thị thông tin khí hậu trung bình (nhiệt độ, lượng mưa) theo tháng theo vùng ở dạng mini chart phía dưới trục tháng, có thể toggle on/off.
- **FR-015**: Dữ liệu khí hậu NÊN là dữ liệu tĩnh (trung bình nhiều năm) được seed vào database, không cần API realtime.
- **FR-016**: Hệ thống PHẢI ghi activity log cho tất cả thao tác CRUD trên entity mùa vụ, bao gồm: actor, action, target, timestamp.
- **FR-017**: Trang Activity Log PHẢI hỗ trợ filter theo entity type và khoảng thời gian, với infinite scroll pagination.
- **FR-018**: Hệ thống PHẢI tự động purge activity log entries cũ hơn 6 tháng (scheduled job hoặc DB trigger).
- **FR-019**: Cảnh báo sâu bệnh PHẢI được lưu trong bảng riêng (pest_warnings) với FK đến growth_stages và products, cho phép admin quản lý CRUD và link sản phẩm phòng trị.

### Key Entities

- **Climate Data (WeatherBaseline)**: Dữ liệu khí hậu trung bình theo vùng theo tháng — vùng (FK → agricultural_zones), tháng (1-12), nhiệt độ trung bình (°C), lượng mưa trung bình (mm). Seed data tĩnh.
- **Season Activity Log (SeasonActivityLog)**: Bản ghi audit — actor (user ID/name), action (create/update/delete), entityType (zone/crop/calendar/stage/recommendation), entityId, entityName, metadata (JSON — chi tiết thay đổi), timestamp. Retention: 6 tháng, tự động purge entries cũ hơn.
- **Growth Stage mở rộng**: Bổ sung trường careActivities (danh sách hoạt động chăm sóc — text[]) vào entity growth_stages hiện có.
- **Pest Warning (PestWarning)**: Bảng riêng — growthStageId (FK → growth_stages), name (tên sâu bệnh), symptoms (mô tả triệu chứng), treatmentProductIds (FK[] → products, sản phẩm phòng trị), severity (low/medium/high), preventionNote (ghi chú phòng ngừa). Admin CRUD qua giao diện quản trị.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng nhìn được tổng quan lịch mùa vụ 12 tháng cho 1 vùng trong dưới 3 giây (load + render Gantt timeline).
- **SC-002**: Người dùng xác định được "tháng hiện tại đang ở giai đoạn gì" trong dưới 2 giây nhờ đường indicator "Hôm nay".
- **SC-003**: Thời gian tìm kiếm cây trồng giảm 70% so với cuộn danh sách thủ công (search nhập keyword → kết quả < 500ms).
- **SC-004**: Sheet chi tiết giai đoạn cung cấp ít nhất 3x thông tin hữu ích hơn phiên bản cũ (thêm checklist hoạt động + cảnh báo sâu bệnh + hướng dẫn kỹ thuật).
- **SC-005**: Quick stats cho tháng giảm 50% thời gian để admin xác định "tháng này bận gì" so với cuộn qua từng card.
- **SC-006**: Activity log bao phủ 100% các thao tác CRUD trên entity mùa vụ, hỗ trợ truy xuất lịch sử thay đổi.
- **SC-007**: Multi-season overlay cho phép so sánh workload cross-crop — user nhận biết tháng có workload cao (≥3 cây cùng giai đoạn) trong 1 lần nhìn.

## Assumptions

- Module 015-agricultural-season-calendar đã implement đầy đủ, bao gồm entities, API, admin CRUD, chatbot integration.
- Dữ liệu khí hậu trung bình (nhiệt độ, lượng mưa) cho 8 vùng × 12 tháng sẽ được seed từ nguồn Bộ Nông nghiệp hoặc Wikipedia VN, là dữ liệu tĩnh không cần cập nhật thường xuyên.
- Checklist hoạt động chăm sóc chỉ lưu ở client-side (localStorage hoặc session state), không cần persist lên server — nông dân dùng tham khảo, không tracking.
- Activity log dùng pattern đơn giản ghi vào database table mới, không cần message queue hay event sourcing phức tạp.
- Trường `careActivities` cho growth_stages sẽ là text[], được admin nhập qua giao diện quản trị đã có.
- Pest warnings lưu bảng riêng (`pest_warnings`) với FK đến growth_stages và products, admin quản lý qua CRUD.
- Activity log tự động purge entries cũ hơn 6 tháng, không cần admin can thiệp.
- Weather baseline data có thể cập nhật hàng năm bởi admin nếu cần, nhưng không cần cơ chế tự động.

## Dependencies

- Module 015-agricultural-season-calendar phải hoàn thành trước khi bắt đầu module này.
- Entity `growth_stages` hiện có cần migration ALTER TABLE để thêm trường careActivities (text[]). Bảng `pest_warnings` mới cần migration CREATE TABLE với FK đến growth_stages và products.
- Entity `agricultural_zones` đã có sẵn — dùng làm FK cho weather baseline data.
- Hệ thống authentication/authorization hiện có — dùng để ghi actor vào activity log.
