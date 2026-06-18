# 🎉 Tính Năng Mới - Hướng Dẫn Sử Dụng

## 1. 💰 Tìm Kiếm Theo Lương

### Trên Trang Chủ (HomeScreen)

**Cách sử dụng:**
- Nhấn nút **"Lương"** trên thanh filter
- Chọn khoảng lương phù hợp:
  - Preset: < 10k, 10k-20k, 20k-30k, 30k-50k, 50k-100k, > 100k
  - Hoặc nhập khoảng tùy chỉnh (từ - đến) tính bằng ngàn VND
- Ứng dụng tự động lọc các công việc có mức lương nằm trong khoảng đã chọn

**Lưu ý:**
- Lương được so sánh dựa trên số tiền, bỏ qua đơn vị thời gian
- VD: "20 k/giờ", "20 k/ngày", "1 triệu/tuần" đều được parse thành cùng giá trị

---

## 2. 📝 Nhập Lương Chi Tiết (Trong Form Tạo Việc)

### Khi Tạo/Chỉnh Sửa Tin Tuyển Dụng

**Mục "Mức lương":**

```
┌─────────────────────────────────┐
│ 20  │ k ▼ / │ giờ ▼           │
└─────────────────────────────────┘
```

- **Cột 1:** Nhập số tiền (VD: 20, 5, 100)
- **Cột 2:** Chọn đơn vị lương
  - `k` = Ngàn (mặc định) → 20k
  - `triệu` = Triệu → 20 triệu
- **Cột 3:** Chọn đơn vị thời gian
  - `giờ` = Tính theo giờ (mặc định)
  - `ngày` = Tính theo ngày
  - `tuần` = Tính theo tuần

**Ví dụ:**
- 20 k/giờ (máy rửa chén)
- 5 triệu/ngày (công trường)
- 100 k/tuần (part-time)

---

## 3. ⏰ Chọn Thời Gian Làm Việc (Giống Google)

### Trên Form Tạo Việc

**Mục "Thời gian làm việc":**

**Cách 1: Chọn Preset**
- Nhấn nút "Chọn thời gian"
- Chọn một trong các preset phổ biến:
  - 6:00 - 12:00 (sáng)
  - 8:00 - 17:00 (fulltime)
  - 14:00 - 22:00 (chiều/tối)
  - v.v...

**Cách 2: Chọn Tùy Chỉnh**
- Sau khi chọn preset, sẽ hiển thị:
  ```
  📍 08:00  -  📍 17:00
  ```
- Nhấn vào "08:00" → Bật Time Picker giờ bắt đầu
- Nhấn vào "17:00" → Bật Time Picker giờ kết thúc

**Time Picker (Giống Google):**
- Scroll để chọn giờ (00-23) và phút (00-59)
- Hiển thị rõ ràng: **HH:MM**
- Nhấn OK để xác nhận

---

## 4. 📂 Thêm Lĩnh Vực Phổ Biến

### Danh Sách Lĩnh Vực (25 lĩnh vực)

Khi tạo tin mới, mục "Lĩnh vực" hiện các lĩnh vực phổ biến nhất hiện nay:

- Bán lẻ / Cửa hàng
- Quán ăn / F&B
- Khách sạn / Nhà hàng
- Giao hàng / Logistics
- Bán hàng online / E-commerce
- Kho vận / Warehouse
- Vệ sinh / Dọn dẹp
- Bảo vệ / An ninh
- Công trường / Xây dựng
- Tư vấn bán hàng
- Nhân viên văn phòng
- Lễ tân / Customer Service
- Giao dịch viên / Cashier
- Nước rửa / Rửa chén
- Gác cửa / Bảo mẫu
- Dạy kèm / Gia sư
- Lập trình / IT
- Marketing / Truyền thông
- Thiết kế / Đồ họa
- Thợ cơ khí / Kỹ thuật
- Nông nghiệp / Nông trường
- Du lịch / Tour guide
- Tạo tóc / Spa / Làm đẹp
- Chăm sóc sức khỏe
- Khác

---

## 5. 🔍 Các Lĩnh Vực Có Sẵn Preset

Ngoài danh sách trên, khi tạo tin, bạn có thể:
- **Tìm kiếm** bằng cách gõ tên lĩnh vực
- **Tự động gợi ý** khi gõ
- **Chọn từ danh sách** hoặc nhập lĩnh vực khác

---

## 📊 Ví Dụ Thực Tế

### Tạo Tin Tuyển Dụng
```
Tiêu đề: Phục vụ quán cà phê
Công ty: The Coffee House
Lĩnh vực: Quán ăn / F&B
Lương: 20 k/giờ
Thời gian: 6:00 - 12:00 (hoặc tùy chỉnh)
```

### Tìm Việc Trên Trang Chủ
```
Khu vực: TP.HCM
Lĩnh vực: F&B
Lương: 15k - 30k (filter sẽ tìm các công việc trong khoảng này)
Loại công việc: Bán thời gian
```

---

## ⚡ Lưu Ý Quan Trọng

1. **Format Lương**: Hệ thống tự động parse lương khi tìm kiếm
   - "20 k/giờ" ≈ "2 triệu/tuần" (nhất thiết phải tính toán để so sánh)

2. **Thời Gian Làm Việc**: 
   - Có 12 preset phổ biến
   - Có thể chỉnh sửa chính xác tới phút

3. **Lĩnh Vực**:
   - 25 lĩnh vực phổ biến được gợi ý
   - Vẫn có thể ghi lĩnh vực khác không có trong danh sách

4. **Active Filters**: 
   - Tất cả filter đang hoạt động được hiển thị trên thanh
   - Nhấn "Xóa lọc" để reset tất cả

---

## 🎯 Lợi Ích

✅ **Tìm kiếm chính xác** theo lương
✅ **Giao diện thân thiện** giống Google
✅ **Nhập lương linh hoạt** với nhiều đơn vị
✅ **Danh sách lĩnh vực hoàn chỉnh** nhất hiện nay
✅ **Tiết kiệm thời gian** với preset
✅ **UX/UI tối ưu** cho mobile

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
- Kiểm tra format lương (có công thức)
- Thử lại khi chọn thời gian
- Reload ứng dụng nếu cần
