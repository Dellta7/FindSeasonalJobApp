# 🚀 Hướng dẫn Kiểm thử API bằng Postman (Dành cho 5 Tester)

Tài liệu này giúp các Tester nắm bắt nhanh cách kiểm thử các module, đặc biệt là các phần khó liên quan đến **Xác thực (Auth)** và **Header**.

---

## 🛠 Chuẩn bị trước khi Test (BẮT BUỘC)
1. **Tắt xác thực SSL:** Postman -> Settings (bánh răng) -> General -> Tắt **SSL certificate verification**. (Vì backend dùng HTTPS tự ký).
2. **Khởi động Backend:** Mở terminal tại thư mục `backend`, chạy `npm run dev`.
3. **Import Collection:** Import file `docs/FindSeasonalJobApp.postman_collection.json` vào Postman.

---

## 🔑 PHẦN QUAN TRỌNG: Cách dùng Header (Dành cho các Module khó)
Nhiều API yêu cầu hệ thống biết **ai đang thực hiện**. Chúng ta dùng Header để giả lập đăng nhập:
- **`x-user-id`**: ID của người dùng (ví dụ: `1`).
- **`x-user-role`**: Quyền hạn (`user` hoặc `admin`).

---

## 📋 Hướng dẫn chi tiết cho từng Tester

### 🧑‍💻 Tester 1: Module Việc làm (Jobs)
- **Độ khó:** Trung bình.
- **Lưu ý:** 
  - Khi **Tạo việc làm (Create)**: Nên thêm header `x-user-id` để hệ thống biết ai là chủ bài đăng.
  - Khi **Xóa/Sửa**: Nếu bài đăng có `userId`, bạn phải gửi đúng `x-user-id` của chủ bài đó hoặc dùng `x-user-role: admin`.

### 📩 Tester 2: Module Đăng ký quan tâm (Inquiries)
- **Độ khó:** Dễ.
- **Lưu ý:** Khi `POST /inquiries`, hãy đảm bảo `jobId` trong Body là một ID đang tồn tại trong database (kiểm tra bằng `GET /jobs`).

### 👤 Tester 3: Module Người dùng (Auth/Users) - ⚠️ KHÓ NHẤT
Module này là "gốc" của các module khác.
1. **Đăng ký (Register):** Tạo tài khoản mới.
2. **Đăng nhập (Login):** Sau khi Login thành công, hãy **nhìn vào kết quả trả về** để lấy `id`.
3. **Cập nhật/Xóa:** 
   - Bạn **PHẢI** thêm Header `x-user-id` bằng chính ID của mình vừa lấy được.
   - Nếu muốn xóa người khác, bạn phải dùng Header `x-user-role: admin`.

### ⭐️ Tester 4: Module Yêu thích (Favorites) - ⚠️ CẦN LƯU Ý
- **Độ khó:** Trung bình (liên quan đến Header).
- **Quy trình Test:**
  1. Gửi Header `x-user-id: 1`.
  2. `POST /favorites`: Lưu việc làm ID số 1.
  3. `GET /favorites`: Kiểm tra xem danh sách đã có việc vừa lưu chưa.
  4. **Lỗi thường gặp:** Quên gửi Header `x-user-id` sẽ bị báo lỗi 401.

### 🗂 Tester 5: Module Danh mục (Categories)
- **Độ khó:** Dễ.
- **Lưu ý:** Tên danh mục (`name`) là duy nhất, nếu bạn tạo 2 cái trùng tên sẽ bị lỗi 409 (Conflict).

---

## 💡 Mẹo Test nhanh
- **Lỗi 404:** Check lại ID trong URL (ví dụ `/jobs/999` thường không tồn tại).
- **Lỗi 403:** Bạn đang cố sửa/xóa dữ liệu của người khác mà không có quyền Admin.
- **Lỗi 400/HttpError:** Kiểm tra lại Body JSON xem có thiếu trường bắt buộc nào không (ví dụ: `title` trong Job).

---
*Chúc các Tester hoàn thành tốt nhiệm vụ! Nếu cần hỗ trợ về code, hãy báo lại ngay.*
