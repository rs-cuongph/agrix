# Tài liệu Đặc tả Yêu cầu phần mềm (Software Requirement Specification - SRS)
## Tên dự án: Agrix - Ứng dụng Quản lý Bán hàng Nông nghiệp & Điện nước

---

## 1. Tổng quan dự án (Project Overview)
- **Mục tiêu**: Xây dựng hệ thống quản lý bán hàng toàn diện, tập trung vào lĩnh vực vật tư nông nghiệp (phân bón, thuốc bảo vệ thực vật) và có thể mở rộng cho thiết bị điện nước dân dụng.
- **Nền tảng phục vụ**: 
  - **Mobile/Tablet App**: Dành cho nhân viên bán hàng tại quầy hoặc thủ kho. (Android hiện tại, iOS trong tương lai).
  - **Web Admin**: Dành cho quản lý/chủ cửa hàng để xem bao quát.
  - **Web Base (Landing Page)**: Dành cho khách hàng tra cứu thông tin sản phẩm, đọc blog, liên hệ.

---

## 2. Kiến trúc Hệ thống & Tech Stack
- **Frontend App (Android/Tablet/Desktop)**: Flutter
- **Frontend Web Admin**: Flutter Web (Tận dụng chung source base với App để xử lý nghiệp vụ mượt mà).
- **Frontend Web Base (Landing Page/Blog)**: Next.js (Khắc phục nhược điểm SEO của Flutter Web, giúp khách hàng dễ dàng tìm kiếm qua Google).
- **Backend API**: NestJS (Node.js) - Kiến trúc Monolith cho giai đoạn đầu.
- **Database**: PostgreSQL (Lưu trữ chính), SQLite (Lưu trữ Local App cho chế độ Offline).
- **Lưu trữ Object/File**: MinIO (Self-hosted S3-compatible) cho ảnh sản phẩm, avatar, banner.
- **DevOps/Deployment**: Docker & Docker Compose để đóng gói và triển khai.
- **AI Integration**: OpenAI API (GPT-4) hoặc Google Gemini API.

Tất cả source code tối muốn chung 1 repo
---

## 3. Phân tích & Chi tiết Chức năng (Functional Requirements)

### 3.1. Phân quyền Người dùng (Bổ sung mới)
Hệ thống cần phân quyền (RBAC) tối thiểu để bảo mật:
- **Admin/Chủ cửa hàng**: Toàn quyền, cấu hình hệ thống, xem mọi báo cáo.
- **Nhân viên bán hàng**: Tạo đơn xuất hàng, xem tồn kho, hỏi chatbot AI.
- **Thủ kho**: Nhập hàng, kiểm kê kho.

### 3.2. Quản lý Sản phẩm (Product Management)
- **Thông tin cơ bản**: Tên, mã SP (SKU), danh mục (Category), lô hàng, hạn sử dụng, hướng dẫn sử dụng, mô tả.
- **Quản lý Đơn vị Quy đổi linh hoạt (Dynamic Units)**:
  - *Ví dụ*: 1 Thùng = 40 Chai. Nhập kho theo "Thùng", xuất bán theo "Thùng" hoặc "Chai".
  - Thuật toán trừ kho chính xác đến đơn vị nhỏ nhất (Ví dụ tồn kho hiển thị: 0 thùng dư 39 chai, hoặc 39 chai).
- **Giá trị tài chính**: Giá vốn, Giá bán lẻ.
- **Định danh & Mã vạch**: 
  - Tự động sinh mã QR nội bộ cho các sản phẩm, lô hàng đặc biệt.
  - Hỗ trợ quét và nhận diện **Mã vạch chuẩn EAN-13 (Barcode 2D)** có sẵn trên bao bì của nhà sản xuất phân bón/thuốc BVTV.
- **Cảnh báo (Bổ sung mới)**: Hệ thống tự động cảnh báo tồn kho sắp hết, hoặc cảnh báo hàng sắp hết hạn sử dụng (rất quan trọng cho thuốc bảo vệ thực vật).

### 3.3. Nhập/Xuất & Bán Hàng (Inventory & Point of Sale)
- **Nhập hàng**: Cập nhật tồn kho theo lô.
- **Xuất hàng (POS trên Tablet)**:
  - Tìm kiếm siêu tốc qua: Camera Scan QR, thiết bị quét Barcode chuyên dụng, Tên, Mã SP.
  - **Thanh toán**: Hỗ trợ tiền mặt và chuyển khoản (Tự động hiển thị mã QR VietQR theo tổng tiền).
  - **In Bill**: Kết nối Bluetooth/LAN với máy in nhiệt ngay lập tức.
- **Lịch sử**: Xem, lọc, tìm kiếm thời gian thực.
- **Quản lý Khách hàng & Sổ Công nợ**: Đặc thù ngành nông nghiệp thường xuyên cho nông dân mua khất nợ tới mùa màng. Hệ thống cung cấp sổ nợ chi tiết, lưu lịch sử mua hàng, lịch sử trả nợ theo từng đợt thanh toán của khách.

### 3.4. Trợ lý ảo AI (AI Chatbot)
- **Mục đích**: Trợ lý tư vấn chuyên sâu tại chỗ.
- **Tính năng**:
  - Tại trang Chi tiết SP: Nút **"Hỏi Ngay"** truy xuất nhanh HDSD.
  - Hỏi đáp ngữ cảnh liên kết SP: *"Thuốc trừ sâu X có thể pha chung phân bón Y không?"*
- **Tính tự học (Context & RAG)**: Cho phép admin lưu lại và nạp thêm các tài liệu, ngữ cảnh kĩ thuật nông nghiệp mới để AI càng dùng càng giỏi hơn và trả lời chuẩn xác theo hệ cơ sở dữ liệu nội bộ.

### 3.5. Web Client (Web Portal)
- **Route Admin (Private)**:
  - Dashboard thống kê nâng cao.
  - Quản lý toàn bộ tính năng như App + Quản lý nội dung (Blog content).
- **Route Base (Public)**:
  - Module Content: Hiển thị Blog nông nghiệp, cách phòng trị bệnh.
  - Module Market: Bảng giá đại trà, sự thay đổi giá hàng hoá, xu hướng sản phẩm.
  - Liên hệ.

### 3.6. Xử lý Trạng thái Kháng mạng (Offline Mechanism)
- **Quy trình hoạt động**:
  - 🟢 **Online (Wifi/4G)**: Đơn hàng lập tức gọi API lưu lên server NestJS, đối trừ database PostgreSQL.
  - 🔴 **Offline (Mất kết nối)**: Lưu tạm toàn bộ giao dịch vào SQLite nội bộ trên Tablet. Giao diện báo icon ☁️ mờ (chưa đồng bộ). Ứng dụng vẫn cho phép khách mua hàng bình thường.
  - 🔄 **Background Sync**: Tự động đồng bộ ngầm khi phát hiện có mạng trở lại. Đảm bảo toàn vẹn dữ liệu (không trùng đơn hàng lưới).

---

## 4. Giao diện & Trải nghiệm Người dùng (UI/UX)
- **Design System**: Material Design 3 kết hợp phong cách Clean & Minimalist.
- **Bảng màu (Palette)**:
  - **Primary**: Xanh lá cây tự nhiên (Emerald Green) - Đại diện nông nghiệp, gọi hành động chính (Mua/Lưu).
  - **Secondary**: Xanh dương nhạt (Light Sky Blue) - Nhấn nhá thông tin phụ, Tag.
  - **Nền (Background)**: Trắng/Xám nhạt (F8F9FA) - Gọn gàng chuyên nghiệp.
  - **Văn bản (Text)**: Đen đậm (333333) cho text chính, Xám (666666) cho text phụ.
- **Hiệu ứng & Cấu trúc**:
  - **Bo góc (Rounded corners)**: Mềm mại, dễ tiếp cận.
  - **Drop Shadow**: Đổ bóng siêu mỏng, tạo phân lớp.
  - **Negative Space**: Khoảng trắng thở rộng, giúp nhân viên không bị rối mắt, tap nhầm khi cửa hàng đông khách.

