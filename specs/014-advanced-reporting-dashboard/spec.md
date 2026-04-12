# Feature Specification: Advanced Reporting Dashboard

**Feature Branch**: `014-advanced-reporting-dashboard`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "them tinh nang 1. 📊 Dashboard Báo cáo Nâng cao
Biểu đồ doanh thu theo ngày/tuần/tháng/năm
Sản phẩm bán chạy nhất theo khoảng thời gian
Lợi nhuận gộp (doanh thu − giá vốn) theo từng danh mục hàng
Top khách hàng mua nhiều nhất / nợ nhiều nhất
Xuất báo cáo PDF/Excel để in sổ sách"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Theo dõi hiệu quả kinh doanh theo thời gian (Priority: P1)

Chủ cửa hàng hoặc quản lý mở trang Dashboard Báo cáo Nâng cao để xem doanh thu theo ngày, tuần, tháng, hoặc năm nhằm đánh giá xu hướng bán hàng và ra quyết định nhập hàng, khuyến mãi, hoặc phân bổ nhân sự.

**Why this priority**: Đây là giá trị cốt lõi của tính năng vì giúp người quản lý nhìn thấy bức tranh kinh doanh tổng quan ngay lập tức thay vì phải tổng hợp thủ công từ nhiều đơn hàng.

**Independent Test**: Có thể kiểm thử độc lập bằng cách chọn từng chế độ thời gian và xác nhận hệ thống hiển thị đúng biểu đồ doanh thu cùng tổng số liệu cho khoảng thời gian đã chọn.

**Acceptance Scenarios**:

1. **Given** người dùng có quyền xem báo cáo và đang ở trang dashboard, **When** họ chọn chế độ xem theo ngày, tuần, tháng, hoặc năm, **Then** hệ thống hiển thị biểu đồ doanh thu tương ứng với đúng khoảng thời gian được chọn.
2. **Given** người dùng thay đổi khoảng thời gian báo cáo, **When** hệ thống tải lại dữ liệu, **Then** toàn bộ chỉ số doanh thu trên màn hình được cập nhật nhất quán theo cùng bộ lọc thời gian.

---

### User Story 2 - Phân tích sản phẩm, danh mục, và khách hàng trọng yếu (Priority: P1)

Quản lý cần xác định sản phẩm bán chạy, danh mục mang lại lợi nhuận gộp cao, khách hàng mua nhiều nhất, và khách hàng đang nợ nhiều nhất để ưu tiên chăm sóc khách hàng, lập kế hoạch tồn kho, và kiểm soát công nợ.

**Why this priority**: Tính năng phân tích chi tiết biến dữ liệu bán hàng thành hành động kinh doanh cụ thể, giúp tối ưu cả doanh thu lẫn dòng tiền.

**Independent Test**: Có thể kiểm thử độc lập bằng cách áp dụng một khoảng thời gian xác định và xác minh các bảng xếp hạng cùng chỉ số lợi nhuận gộp thay đổi đúng theo dữ liệu trong giai đoạn đó.

**Acceptance Scenarios**:

1. **Given** người dùng chọn một khoảng thời gian báo cáo, **When** phần phân tích được tải, **Then** hệ thống hiển thị danh sách sản phẩm bán chạy nhất trong khoảng thời gian đó theo thứ tự giảm dần.
2. **Given** dữ liệu bán hàng có thông tin giá vốn theo danh mục, **When** người dùng xem phần lợi nhuận gộp, **Then** hệ thống hiển thị doanh thu, giá vốn, và lợi nhuận gộp cho từng danh mục hàng.
3. **Given** dữ liệu khách hàng có lịch sử mua hàng và công nợ, **When** người dùng mở phần khách hàng trọng yếu, **Then** hệ thống hiển thị top khách hàng mua nhiều nhất và top khách hàng nợ nhiều nhất dưới dạng hai danh sách riêng biệt.

---

### User Story 3 - Xuất báo cáo để lưu trữ và in sổ sách (Priority: P2)

Kế toán hoặc quản lý muốn xuất báo cáo hiện tại thành PDF hoặc Excel để in sổ sách, chia sẻ nội bộ, hoặc lưu hồ sơ đối soát theo kỳ.

**Why this priority**: Xuất báo cáo không phải là bước phân tích đầu tiên, nhưng là nhu cầu vận hành quan trọng để hoàn tất quy trình làm việc và lưu trữ chứng từ.

**Independent Test**: Có thể kiểm thử độc lập bằng cách chọn bộ lọc thời gian rồi xuất từng định dạng, sau đó xác nhận tệp được tạo đúng và phản ánh cùng dữ liệu đang hiển thị trên dashboard.

**Acceptance Scenarios**:

1. **Given** người dùng đang xem một báo cáo với bộ lọc thời gian cụ thể, **When** họ chọn xuất PDF, **Then** hệ thống tạo tệp PDF có thể in được và phản ánh đúng dữ liệu của báo cáo hiện tại.
2. **Given** người dùng đang xem một báo cáo với bộ lọc thời gian cụ thể, **When** họ chọn xuất Excel, **Then** hệ thống tạo tệp Excel chứa dữ liệu có cấu trúc rõ ràng để tiếp tục đối soát hoặc lưu trữ.

### Edge Cases

- Điều gì xảy ra khi khoảng thời gian được chọn không có giao dịch bán hàng nào?
- Hệ thống xử lý thế nào khi một danh mục có doanh thu nhưng chưa đủ dữ liệu giá vốn để tính lợi nhuận gộp?
- Điều gì xảy ra khi nhiều khách hàng có cùng tổng giá trị mua hàng hoặc cùng số dư nợ?
- Hệ thống cần phản hồi thế nào khi người dùng xuất báo cáo cho một khoảng thời gian rất lớn khiến dữ liệu dài nhiều trang?
- Điều gì xảy ra khi dữ liệu công nợ hoặc thông tin khách hàng bị thiếu hoặc đã bị vô hiệu hóa?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cung cấp một dashboard báo cáo nâng cao dành cho người dùng có quyền xem số liệu kinh doanh.
- **FR-002**: Hệ thống PHẢI cho phép người dùng xem doanh thu theo các chế độ thời gian ngày, tuần, tháng, và năm.
- **FR-003**: Hệ thống PHẢI cho phép người dùng chọn khoảng thời gian báo cáo và áp dụng bộ lọc đó nhất quán cho tất cả thành phần dữ liệu trên dashboard.
- **FR-004**: Hệ thống PHẢI hiển thị danh sách sản phẩm bán chạy nhất dựa trên khoảng thời gian đang được chọn.
- **FR-005**: Hệ thống PHẢI hiển thị lợi nhuận gộp theo từng danh mục hàng, trong đó lợi nhuận gộp được xác định bằng doanh thu trừ giá vốn.
- **FR-006**: Hệ thống PHẢI hiển thị riêng danh sách khách hàng mua nhiều nhất và danh sách khách hàng nợ nhiều nhất cho cùng khoảng thời gian báo cáo, ngoại trừ công nợ được tính theo số dư hiện hành.
- **FR-007**: Hệ thống PHẢI cho phép người dùng xuất báo cáo hiện tại sang định dạng PDF để in sổ sách.
- **FR-008**: Hệ thống PHẢI cho phép người dùng xuất báo cáo hiện tại sang định dạng Excel để lưu trữ, đối soát, và xử lý tiếp.
- **FR-009**: Hệ thống PHẢI thể hiện rõ thời gian báo cáo, thời điểm xuất, và các bộ lọc đang áp dụng trong tệp xuất ra.
- **FR-010**: Hệ thống PHẢI thông báo rõ ràng khi không có dữ liệu cho khoảng thời gian đã chọn và vẫn cho phép người dùng điều chỉnh bộ lọc hoặc xuất báo cáo rỗng nếu cần lưu hồ sơ.
- **FR-011**: Hệ thống PHẢI sử dụng cùng một nguồn số liệu giữa dashboard và tệp xuất để tránh chênh lệch giữa dữ liệu xem trên màn hình và dữ liệu in sổ sách.
- **FR-012**: Hệ thống PHẢI sắp xếp các bảng xếp hạng theo thứ tự giảm dần theo giá trị liên quan và áp dụng quy tắc ổn định khi có trường hợp đồng hạng.

### Key Entities *(include if feature involves data)*

- **Revenue Summary**: Tập số liệu tổng hợp doanh thu theo một đơn vị thời gian cụ thể, gồm mốc thời gian, doanh thu, và các chỉ số tổng liên quan.
- **Top Selling Product Record**: Bản ghi xếp hạng sản phẩm bán chạy gồm sản phẩm, số lượng bán, doanh thu đóng góp, và khoảng thời gian áp dụng.
- **Category Gross Profit Record**: Bản ghi lợi nhuận gộp theo danh mục gồm danh mục hàng, doanh thu, giá vốn, và lợi nhuận gộp.
- **Customer Purchase Ranking Record**: Bản ghi xếp hạng khách hàng mua nhiều gồm khách hàng, tổng giá trị mua, số đơn hàng, và kỳ báo cáo.
- **Customer Debt Ranking Record**: Bản ghi xếp hạng khách hàng nợ nhiều gồm khách hàng, số dư nợ hiện hành, và trạng thái công nợ.
- **Exported Report**: Bản sao báo cáo tại thời điểm xuất gồm bộ lọc thời gian, thời điểm tạo báo cáo, các bảng số liệu, và định dạng đầu ra.

### Assumptions

- Dashboard này phục vụ chủ cửa hàng, quản lý, và các vai trò được cấp quyền xem báo cáo tài chính.
- Khoảng thời gian báo cáo mặc định là kỳ gần nhất phù hợp với chế độ xem mà người dùng đang chọn.
- Danh sách khách hàng nợ nhiều nhất dựa trên số dư công nợ hiện tại, không giới hạn bởi số đơn phát sinh trong kỳ báo cáo.
- Trường hợp đồng hạng trong các bảng xếp hạng sẽ được giữ thứ tự ổn định theo tên hoặc mã nhận diện để người dùng dễ đối chiếu.
- Khi thiếu dữ liệu giá vốn cho một phần danh mục, hệ thống sẽ hiển thị trạng thái chưa đủ dữ liệu thay vì suy diễn lợi nhuận.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 90% người dùng mục tiêu có thể xác định doanh thu của một kỳ bất kỳ trong không quá 30 giây kể từ khi mở dashboard.
- **SC-002**: 95% thao tác chuyển đổi giữa các chế độ ngày, tuần, tháng, và năm hiển thị đầy đủ số liệu báo cáo trong không quá 3 giây với dữ liệu của một cửa hàng đang hoạt động bình thường.
- **SC-003**: 100% tệp PDF và Excel được xuất ra phản ánh cùng bộ lọc thời gian và cùng tập số liệu đang hiển thị trên dashboard tại thời điểm xuất.
- **SC-004**: Người dùng có thể hoàn tất tác vụ tìm top sản phẩm, top khách hàng, hoặc danh mục có lợi nhuận gộp cao nhất trong không quá 2 bước thao tác sau khi đã mở dashboard.
- **SC-005**: 100% báo cáo được xuất có thể sử dụng trực tiếp cho nhu cầu in sổ sách hoặc lưu hồ sơ mà không cần nhập lại thủ công các chỉ số chính.
