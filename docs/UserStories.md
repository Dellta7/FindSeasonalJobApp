# User Stories — FindSeasonalJobApp

## Epic A — Tìm & xem việc (Ứng viên)

### US-A1 — Xem danh sách việc
- **Với tư cách** ứng viên
- **Tôi muốn** xem danh sách việc thời vụ
- **Để** nhanh chóng tìm cơ hội phù hợp
- **Acceptance:**
  - Hiển thị tối thiểu: tiêu đề, địa điểm, lương, thời gian
  - Có trạng thái rỗng khi không có dữ liệu

### US-A2 — Tìm kiếm theo từ khoá
- **Với tư cách** ứng viên
- **Tôi muốn** tìm kiếm theo từ khoá
- **Để** lọc nhanh các công việc liên quan
- **Acceptance:**
  - Gõ từ khoá → danh sách cập nhật
  - Không crash với ký tự đặc biệt

### US-A3 — Lọc theo địa điểm & lĩnh vực
- **Với tư cách** ứng viên
- **Tôi muốn** lọc theo địa điểm và lĩnh vực
- **Để** không phải xem việc không phù hợp
- **Acceptance:**
  - Chọn địa điểm/lĩnh vực → danh sách chỉ còn job phù hợp

### US-A4 — Xem chi tiết việc
- **Với tư cách** ứng viên
- **Tôi muốn** xem chi tiết 1 job
- **Để** quyết định có ứng tuyển không
- **Acceptance:**
  - Thấy mô tả, yêu cầu, lương, thời gian, liên hệ

## Epic B — Lưu & ứng tuyển (Ứng viên)

### US-B1 — Lưu yêu thích
- **Với tư cách** ứng viên
- **Tôi muốn** lưu job yêu thích
- **Để** xem lại sau
- **Acceptance:**
  - Có nút lưu/huỷ lưu
  - Trạng thái lưu phản ánh đúng trên UI

### US-B2 — Gửi đăng ký quan tâm
- **Với tư cách** ứng viên
- **Tôi muốn** gửi họ tên và số điện thoại để đăng ký
- **Để** nhà tuyển dụng liên hệ lại
- **Acceptance:**
  - Validate họ tên/SĐT không rỗng
  - Gửi thành công → thông báo thành công

## Epic C — Đăng tin tuyển dụng (Nhà tuyển dụng)

### US-C1 — Tạo tin tuyển dụng
- **Với tư cách** nhà tuyển dụng
- **Tôi muốn** tạo tin tuyển dụng
- **Để** tìm người làm thời vụ
- **Acceptance:**
  - Form có tối thiểu: tiêu đề, địa điểm, mô tả, lương, thời gian

### US-C2 — Quản lý tin
- **Với tư cách** nhà tuyển dụng
- **Tôi muốn** xem và sửa/đóng tin đã đăng
- **Để** cập nhật nhu cầu tuyển dụng
- **Acceptance:**
  - Có danh sách tin “của tôi”
  - Mỗi tin có hành động sửa/đóng

## Epic D — Quản trị (Admin)

### US-D1 — Kiểm duyệt tin
- **Với tư cách** quản trị
- **Tôi muốn** duyệt/ẩn tin
- **Để** đảm bảo nội dung phù hợp
- **Acceptance:**
  - Có trạng thái tin (open/closed/hidden)

### US-D2 — Xử lý báo cáo
- **Với tư cách** quản trị
- **Tôi muốn** xử lý báo cáo vi phạm
- **Để** ngăn nội dung lừa đảo
- **Acceptance:**
  - Lưu lại quyết định xử lý và lý do (định hướng)
