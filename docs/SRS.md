# SRS — Ứng dụng Tìm Việc Thời Vụ (FindSeasonalJobApp)

## 1. Mục tiêu
FindSeasonalJobApp là ứng dụng di động giúp người lao động tìm việc thời vụ và giúp nhà tuyển dụng đăng tin tuyển dụng thời vụ nhanh chóng. Ứng dụng hướng đến quy trình “tìm kiếm → xem chi tiết → ứng tuyển/đăng ký liên hệ” đơn giản, phù hợp cho nhu cầu ngắn hạn.

## 2. Phạm vi
### 2.1. Trong phạm vi (In-scope)
- Duyệt danh sách việc thời vụ
- Tìm kiếm và lọc cơ bản (theo từ khoá, địa điểm, lĩnh vực)
- Xem chi tiết việc làm
- Lưu việc yêu thích
- Ứng tuyển/đăng ký quan tâm (gửi thông tin liên hệ cơ bản)
- Nhà tuyển dụng: tạo/đăng tin tuyển dụng
- Quản lý tin đã đăng (xem, sửa, ẩn/đóng tin)

### 2.2. Ngoài phạm vi (Out-of-scope) — giai đoạn MVP
- Thanh toán/thu phí, gói premium
- Chat realtime trong app
- Xác thực eKYC/định danh nâng cao
- Chấm công, quản lý ca làm, hợp đồng điện tử

## 3. Đối tượng sử dụng & bối cảnh
### 3.1. Persona chính
- **Ứng viên (Seeker):** sinh viên, lao động tự do, người cần việc ngắn hạn.
- **Nhà tuyển dụng (Employer):** cửa hàng, quán ăn, sự kiện, kho vận… cần tuyển nhanh.
- **Quản trị (Admin):** kiểm duyệt tin, xử lý báo cáo vi phạm.

### 3.2. Môi trường vận hành
- Ứng dụng React Native (Expo)
- Thiết bị Android/iOS
- Dữ liệu lưu trữ qua API backend (chưa triển khai trong project mẫu; sẽ mô phỏng bằng dữ liệu mock ở giai đoạn khởi tạo)

## 4. Thuật ngữ
- **Tin tuyển dụng/Job Post:** bài đăng tuyển thời vụ.
- **Ứng tuyển/Application:** hành động gửi thông tin để đăng ký.
- **Yêu thích/Favorite:** danh sách việc đã lưu.

## 5. Mục tiêu chất lượng (Quality goals)
- Trải nghiệm nhanh, ít bước
- Tìm kiếm/duyệt mượt trên thiết bị tầm trung
- Dễ mở rộng tích hợp backend sau này

## 6. Yêu cầu chức năng (Functional Requirements)

Ký hiệu: `FR-x`.

### 6.1. Ứng viên (Seeker)
- **FR-1:** Xem danh sách việc làm thời vụ (cuộn vô hạn hoặc phân trang).
- **FR-2:** Tìm kiếm theo từ khoá (tiêu đề, mô tả).
- **FR-3:** Lọc theo địa điểm, lĩnh vực, mức lương (tối thiểu: địa điểm + lĩnh vực).
- **FR-4:** Xem chi tiết việc làm (mô tả, yêu cầu, địa điểm, thời gian, lương, liên hệ).
- **FR-5:** Lưu/huỷ lưu việc yêu thích.
- **FR-6:** Ứng tuyển/đăng ký quan tâm: gửi thông tin tối thiểu (họ tên, SĐT, ghi chú).
- **FR-7:** Xem danh sách việc đã lưu.

### 6.2. Nhà tuyển dụng (Employer)
- **FR-8:** Tạo tin tuyển dụng với các trường tối thiểu: tiêu đề, địa điểm, mô tả, mức lương/đơn vị, thời gian làm.
- **FR-9:** Sửa tin tuyển dụng.
- **FR-10:** Đóng/ẩn tin tuyển dụng.
- **FR-11:** Xem danh sách tin đã đăng.

### 6.3. Quản trị (Admin)
- **FR-12:** Duyệt/ẩn tin tuyển dụng theo báo cáo.
- **FR-13:** Xử lý báo cáo vi phạm.

### 6.4. Tài khoản (định hướng)
- **FR-14 (tùy chọn MVP):** Đăng nhập/đăng ký bằng email/điện thoại.

## 7. Yêu cầu phi chức năng (Non-functional Requirements)

Ký hiệu: `NFR-x`.

- **NFR-1 (Hiệu năng):** màn hình danh sách hiển thị dưới 2s với dữ liệu mock; khi tích hợp backend, tải trang đầu dưới 3s ở mạng 4G trung bình.
- **NFR-2 (Khả dụng):** ứng dụng hoạt động offline ở mức tối thiểu cho dữ liệu đã cache (định hướng).
- **NFR-3 (Bảo mật):** không log dữ liệu nhạy cảm (SĐT, token) vào console trong bản phát hành.
- **NFR-4 (Khả chuyển):** hỗ trợ Android & iOS.
- **NFR-5 (Khả mở rộng):** tách lớp `services` (API) và `screens/components`.

## 8. Dữ liệu & mô hình thông tin (Data Requirements)

### 8.1. Thực thể `JobPost`
Trường tối thiểu:
- `id`: định danh
- `title`: tiêu đề
- `companyName`: tên đơn vị
- `location`: địa điểm
- `category`: lĩnh vực
- `salaryText`: mô tả lương (vd: “25k/giờ”)
- `workTimeText`: thời gian làm
- `description`: mô tả
- `contactPhone` / `contactEmail`: thông tin liên hệ
- `status`: `open | closed`

### 8.2. Thực thể `Application`
- `id`
- `jobId`
- `fullName`
- `phone`
- `note`
- `createdAt`

## 9. Ràng buộc & giả định
- Project mẫu hiện tại là Expo app tối giản; backend chưa có.
- Giai đoạn khởi tạo dùng dữ liệu mock để demo luồng chính.

## 10. Tiêu chí nghiệm thu (Acceptance — mức MVP)
- Có màn hình danh sách việc với ô tìm kiếm.
- Xem được chi tiết 1 việc khi chọn từ danh sách.
- Lưu/huỷ lưu việc.
- Có form “Đăng ký quan tâm” tối thiểu.

## 11. Phụ lục
- Use case và user stories: xem [UseCases.md](UseCases.md) và [UserStories.md](UserStories.md).
