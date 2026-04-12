# Feature Specification: Lịch Mùa vụ Nông nghiệp

**Feature Branch**: `015-agricultural-season-calendar`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "Module Lịch Mùa vụ Nông nghiệp - Lịch gieo trồng / thu hoạch theo vùng của Việt Nam, AI gợi ý sản phẩm nông nghiệp phù hợp theo mùa, tích hợp vào chatbot: 'Cây lúa đang ở giai đoạn đẻ nhánh, nên dùng phân gì?'"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem Lịch Mùa vụ Theo Vùng (Priority: P1)

Là một người nông dân hoặc nhân viên kinh doanh nông sản, tôi muốn xem lịch gieo trồng và thu hoạch cho từng vùng địa lý của Việt Nam để biết thời điểm thích hợp bán hoặc mua các loại cây trồng.

**Why this priority**: Đây là chức năng cốt lõi của module, cung cấp giá trị tức thì và là nền tảng để tích hợp AI gợi ý sản phẩm.

**Independent Test**: Có thể kiểm tra bằng cách chọn một vùng (ví dụ: đồng bằng sông Cửu Long) và xem danh sách cây trồng với thời điểm gieo trồng và thu hoạch tương ứng cho 12 tháng trong năm.

**Acceptance Scenarios**:

1. **Given** người dùng đang ở màn hình Lịch Mùa vụ, **When** họ chọn vùng "Đồng bằng sông Cửu Long" và tháng "Tháng 4", **Then** hệ thống hiển thị danh sách cây trồng đang trong giai đoạn gieo trồng hoặc thu hoạch tại vùng đó trong tháng đó.
2. **Given** người dùng đã chọn vùng và tháng, **When** họ nhấp vào một loại cây trồng cụ thể, **Then** hệ thống hiển thị chi tiết lịch mùa vụ đầy đủ (giai đoạn sinh trưởng, thời điểm bón phân, tưới nước, thu hoạch).
3. **Given** người dùng chưa chọn vùng, **When** hệ thống phát hiện vị trí địa lý của họ, **Then** hệ thống tự động gợi ý vùng phù hợp.

---

### User Story 2 - AI Gợi ý Sản phẩm Theo Mùa vụ (Priority: P2)

Là nhân viên kinh doanh tại cửa hàng Agrix, tôi muốn hệ thống AI tự động gợi ý các sản phẩm nông nghiệp (phân bón, thuốc bảo vệ thực vật, giống cây) phù hợp với mùa vụ hiện tại của vùng đó, để tôi có thể chủ động chuẩn bị hàng tồn kho và tư vấn khách hàng.

**Why this priority**: Tính năng gợi ý AI tạo ra giá trị thương mại trực tiếp cho nền tảng Agrix bằng cách kết nối dữ liệu mùa vụ với danh mục sản phẩm thực tế.

**Independent Test**: Có thể kiểm tra bằng cách yêu cầu hệ thống gợi ý sản phẩm cho vùng ĐBSCL vào tháng 3 (mùa lúa đông xuân) và xác nhận danh sách gợi ý bao gồm phân bón thích hợp cho giai đoạn đẻ nhánh.

**Acceptance Scenarios**:

1. **Given** người dùng đang xem lịch mùa vụ của một vùng và tháng cụ thể, **When** họ nhấn "Gợi ý sản phẩm", **Then** hệ thống hiển thị danh sách sản phẩm trong kho Agrix phù hợp với giai đoạn mùa vụ hiện tại, có sẵn tồn kho và giá bán.
2. **Given** hệ thống đang gợi ý sản phẩm, **When** sản phẩm được gợi ý hết hàng, **Then** hệ thống vẫn hiển thị sản phẩm đó nhưng đánh dấu "Hết hàng" và gợi ý sản phẩm thay thế tương đương.
3. **Given** người dùng xem danh sách gợi ý, **When** họ nhấp vào một sản phẩm, **Then** hệ thống chuyển hướng trực tiếp đến trang sản phẩm trong hệ thống bán hàng.

---

### User Story 3 - Chatbot Tư vấn Mùa vụ Thông minh (Priority: P2)

Là người nông dân sử dụng chatbot Agrix, tôi muốn hỏi chatbot về kỹ thuật canh tác theo giai đoạn sinh trưởng của cây trồng (ví dụ: "Cây lúa đang ở giai đoạn đẻ nhánh, nên dùng phân gì?") và nhận được câu trả lời kèm sản phẩm gợi ý cụ thể có sẵn tại cửa hàng.

**Why this priority**: Tích hợp chatbot tạo ra kênh tư vấn tự động 24/7, giảm tải cho nhân viên tư vấn và tăng trải nghiệm cho nông dân.

**Independent Test**: Gửi câu hỏi "Cây lúa đang ở giai đoạn đẻ nhánh, nên dùng phân gì?" qua chatbot và xác nhận chatbot trả lời với loại phân bón cụ thể kèm sản phẩm có sẵn trong hệ thống.

**Acceptance Scenarios**:

1. **Given** người dùng nhập câu hỏi về cây trồng trong chatbot, **When** câu hỏi có đề cập đến giai đoạn sinh trưởng hoặc thời điểm mùa vụ, **Then** chatbot nhận diện ngữ cảnh và trả lời kèm theo gợi ý sản phẩm Agrix phù hợp.
2. **Given** người dùng hỏi về một loại cây trồng không có trong cơ sở dữ liệu mùa vụ, **When** chatbot nhận câu hỏi, **Then** chatbot trả lời dựa trên kiến thức nông nghiệp chung và gợi ý người dùng liên hệ nhân viên tư vấn.
3. **Given** chatbot gợi ý sản phẩm, **When** người dùng muốn mua, **Then** chatbot cung cấp liên kết trực tiếp đến sản phẩm hoặc hỗ trợ thêm vào giỏ hàng.

---

### User Story 4 - Quản lý Dữ liệu Mùa vụ (Priority: P3)

Là quản trị viên hệ thống Agrix, tôi muốn thêm, chỉnh sửa và xóa dữ liệu lịch mùa vụ cho từng vùng và loại cây trồng, để đảm bảo thông tin luôn chính xác và cập nhật theo thực tế từng năm.

**Why this priority**: Cần thiết để duy trì chất lượng dữ liệu nhưng không ảnh hưởng đến trải nghiệm người dùng cuối trong MVP.

**Independent Test**: Quản trị viên thêm mới lịch mùa vụ cho cây "Cà phê" tại vùng "Tây Nguyên" và xác nhận dữ liệu xuất hiện trong giao diện người dùng sau khi lưu.

**Acceptance Scenarios**:

1. **Given** quản trị viên đã đăng nhập, **When** họ thêm lịch gieo trồng mới cho một cây trồng tại một vùng, **Then** dữ liệu được lưu và hiển thị ngay trong giao diện Lịch Mùa vụ cho người dùng cuối.
2. **Given** quản trị viên chỉnh sửa thông tin giai đoạn sinh trưởng, **When** họ lưu thay đổi, **Then** chatbot và tính năng gợi ý AI sử dụng dữ liệu mới nhất ngay lập tức.

---

### Edge Cases

- Điều gì xảy ra khi người dùng chọn một vùng không có dữ liệu mùa vụ cho tháng đó? → Hiển thị thông báo "Chưa có dữ liệu mùa vụ cho vùng này" và gợi ý vùng lân cận.
- Điều gì xảy ra khi AI không tìm được sản phẩm phù hợp trong danh mục hiện tại? → Hiển thị thông báo và đề xuất liên hệ nhân viên kinh doanh.
- Điều gì xảy ra khi chatbot nhận câu hỏi mơ hồ về cây trồng (không rõ giai đoạn, vùng)? → Chatbot hỏi lại để làm rõ thông tin trước khi trả lời.
- Điều gì xảy ra khi có nhiều loại cây trồng cùng mùa vụ tại một vùng? → Hiển thị tất cả với khả năng lọc theo loại cây và nhóm sản phẩm.
- Điều gì xảy ra khi dữ liệu mùa vụ bị thay đổi trong khi chatbot đang xử lý câu hỏi? → Chatbot sử dụng dữ liệu cũ cho câu trả lời hiện tại, cập nhật được áp dụng từ lần hỏi tiếp theo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI hiển thị lịch mùa vụ (gieo trồng, chăm sóc, thu hoạch) theo từng vùng địa lý của Việt Nam và theo từng tháng trong năm.
- **FR-002**: Hệ thống PHẢI hỗ trợ ít nhất 7 vùng nông nghiệp chính của Việt Nam: Tây Bắc, Đông Bắc, Đồng bằng Sông Hồng, Bắc Trung Bộ, Nam Trung Bộ, Tây Nguyên, Đông Nam Bộ, Đồng bằng Sông Cửu Long.
- **FR-003**: Hệ thống PHẢI hiển thị tối thiểu 10 loại cây trồng phổ biến bao gồm lúa, ngô, rau màu, cây ăn quả và cây công nghiệp cho giai đoạn MVP.
- **FR-004**: Tính năng AI gợi ý PHẢI ánh xạ giai đoạn mùa vụ hiện tại với danh mục sản phẩm Agrix để tạo danh sách gợi ý có liên quan.
- **FR-005**: Tính năng gợi ý sản phẩm PHẢI chỉ hiển thị sản phẩm có trong danh mục hàng hóa của hệ thống Agrix, có gắn thông tin tồn kho và giá bán.
- **FR-006**: Chatbot PHẢI nhận diện các câu hỏi liên quan đến mùa vụ và giai đoạn sinh trưởng cây trồng và phản hồi kèm sản phẩm gợi ý từ Agrix.
- **FR-007**: Chatbot PHẢI xử lý được câu hỏi bằng tiếng Việt tự nhiên, bao gồm các thuật ngữ nông nghiệp địa phương.
- **FR-008**: Quản trị viên PHẢI có khả năng thêm, chỉnh sửa và xóa dữ liệu lịch mùa vụ qua giao diện quản trị.
- **FR-009**: Hệ thống PHẢI cung cấp chế độ xem theo dạng lịch (calendar view) hoặc dạng bảng (table view) cho lịch mùa vụ.
- **FR-010**: Người dùng PHẢI có thể lọc lịch mùa vụ theo loại cây trồng, vùng địa lý và tháng.

### Key Entities

- **Vùng Nông nghiệp (AgriculturalZone)**: Vùng địa lý với đặc điểm khí hậu, đất đai riêng; liên kết với nhiều lịch mùa vụ.
- **Cây Trồng (Crop)**: Loại cây trồng với tên gọi, đặc điểm sinh trưởng, nhu cầu dinh dưỡng; có thể có nhiều lịch mùa vụ theo vùng khác nhau.
- **Lịch Mùa vụ (SeasonCalendar)**: Bản ghi mùa vụ cho một cây trồng tại một vùng trong một năm, bao gồm các giai đoạn: gieo trồng, chăm sóc, bón phân, thu hoạch với thời điểm tháng tương ứng.
- **Giai đoạn Sinh trưởng (GrowthStage)**: Giai đoạn cụ thể trong chu kỳ sinh trưởng (ví dụ: đẻ nhánh, trổ bông, chín) kèm hoạt động chăm sóc khuyến nghị.
- **Gợi ý Sản phẩm (ProductRecommendation)**: Liên kết giữa giai đoạn sinh trưởng và các sản phẩm Agrix phù hợp, kèm lý do gợi ý.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Người dùng có thể tra cứu lịch mùa vụ cho bất kỳ vùng nào trong 8 vùng nông nghiệp chính của Việt Nam trong vòng dưới 5 giây.
- **SC-002**: Tính năng gợi ý sản phẩm AI trả về kết quả liên quan trong vòng dưới 3 giây sau khi người dùng chọn vùng và giai đoạn mùa vụ.
- **SC-003**: Chatbot nhận diện và trả lời đúng ít nhất 80% các câu hỏi liên quan đến mùa vụ và giai đoạn sinh trưởng trong bài kiểm tra tập mẫu 50 câu hỏi thực tế.
- **SC-004**: Ít nhất 90% sản phẩm được gợi ý có liên quan trực tiếp đến giai đoạn mùa vụ được chọn (theo đánh giá của chuyên gia nông nghiệp).
- **SC-005**: Nhân viên bán hàng tiết kiệm được ít nhất 30% thời gian tư vấn khách hàng nhờ gợi ý sản phẩm theo mùa vụ so với tra cứu thủ công.
- **SC-006**: Quản trị viên có thể thêm hoặc cập nhật dữ liệu lịch mùa vụ cho một vùng và cây trồng mới trong vòng dưới 10 phút.

## Assumptions

- Dữ liệu lịch mùa vụ ban đầu sẽ được nhập thủ công bởi đội ngũ chuyên gia nông nghiệp của Agrix hoặc nhập từ nguồn dữ liệu đáng tin cậy (Bộ Nông nghiệp).
- Sản phẩm trong danh mục Agrix đã được phân loại đúng theo công dụng (phân bón, thuốc BVTV, giống cây) để hỗ trợ tính năng gợi ý.
- Chatbot hiện tại đã hoạt động và có khả năng mở rộng để tích hợp thêm ngữ cảnh mùa vụ.
- Người dùng cuối (nông dân, nhân viên kinh doanh) có kết nối internet ổn định khi sử dụng tính năng.
- Phạm vi MVP tập trung vào cây lúa, ngô và rau màu phổ biến; các cây trồng khác sẽ được bổ sung trong các phiên bản tiếp theo.

## Dependencies

- Danh mục sản phẩm hàng hóa của hệ thống Agrix phải có sẵn và có đủ thông tin phân loại.
- Hệ thống chatbot hiện tại phải có API hoặc cơ chế tích hợp.
- Dữ liệu lịch mùa vụ gốc từ chuyên gia nông nghiệp cần được cung cấp trước khi ra mắt.
