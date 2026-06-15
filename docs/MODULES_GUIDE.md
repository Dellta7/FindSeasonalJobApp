# Hướng dẫn chi tiết 2 Module mới: Favorites & Categories

Tài liệu này hướng dẫn chi tiết cách thiết lập, cấu trúc dữ liệu và cách test cho 2 module vừa bổ sung để phục vụ cho 5 người test.

---

## 1. Module Danh mục (Categories) - Dành cho Tester 5

Module này dùng để quản lý các loại ngành nghề trong hệ thống (ví dụ: F&B, Giao hàng, Bán lẻ).

### A. Cấu trúc bảng Database (`categories`)
| Cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | INT (PK) | Tự động tăng |
| `name` | VARCHAR(100) | Tên danh mục (Duy nhất) |
| `description` | TEXT | Mô tả chi tiết |
| `status` | VARCHAR(20) | Trạng thái (`active` hoặc `inactive`) |

### B. Danh sách API Test
1. **Lấy tất cả danh mục**
   - **URL:** `GET /categories`
   - **Kết quả:** Trả về mảng các danh mục hiện có.

2. **Tạo danh mục mới**
   - **URL:** `POST /categories`
   - **Body (JSON):**
     ```json
     {
       "name": "Lao động phổ thông",
       "description": "Các công việc không yêu cầu bằng cấp",
       "status": "active"
     }
     ```

3. **Cập nhật danh mục**
   - **URL:** `PUT /categories/:id`
   - **Body (JSON):** Truyền các trường cần sửa (ví dụ đổi tên hoặc status).

4. **Xóa danh mục**
   - **URL:** `DELETE /categories/:id`

---

## 2. Module Yêu thích (Favorites) - Dành cho Tester 4

Module này cho phép người dùng lưu lại các công việc họ quan tâm.

### A. Cấu trúc bảng Database (`favorites`)
| Cột | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | INT (PK) | Tự động tăng |
| `userId` | INT (FK) | ID của người dùng (từ bảng `users`) |
| `jobId` | INT (FK) | ID của công việc (từ bảng `jobs`) |
| `note` | TEXT | Ghi chú cá nhân của người dùng |

### B. Danh sách API Test
**Lưu ý:** Vì module này liên quan đến người dùng cụ thể, bạn **PHẢI** gửi kèm Header `x-user-id`.

1. **Xem danh sách yêu thích của tôi**
   - **URL:** `GET /favorites`
   - **Header:** `x-user-id: 1` (Thay số 1 bằng ID người dùng thực tế)

2. **Thêm vào yêu thích (Lưu việc)**
   - **URL:** `POST /favorites`
   - **Header:** `x-user-id: 1`
   - **Body (JSON):**
     ```json
     {
       "jobId": 2,
       "note": "Việc này lương cao, cần ứng tuyển ngay"
     }
     ```

3. **Sửa ghi chú cho việc đã lưu**
   - **URL:** `PUT /favorites/:id`
   - **Body (JSON):**
     ```json
     {
       "note": "Đã gọi điện hỏi thông tin"
     }
     ```

4. **Xóa khỏi danh sách yêu thích**
   - **URL:** `DELETE /favorites/:id`

---

## 3. Các bước triển khai để chạy được

### Bước 1: Cập nhật Database
Bạn cần chạy file SQL sau vào MySQL (qua Workbench hoặc CMD):
👉 **File:** `backend/sql/extra_modules.sql`

### Bước 2: Kiểm tra cấu trúc thư mục
Đảm bảo bạn đã thấy các file sau:
- `backend/src/categoriesRepo.js` (Mới tạo)
- `backend/src/favoritesRepo.js` (Mới tạo)
- `backend/src/server.js` (Đã được cập nhật code Route)

### Bước 3: Test trên Postman
1. Mở Postman.
2. Tắt SSL Verification: **Settings** -> **General** -> Tắt **SSL certificate verification**.
3. Import file: `docs/FindSeasonalJobApp.postman_collection.json`.
4. Chọn đúng thư mục Tester tương ứng và chạy các Request.

---
*Nếu có lỗi 404 hoặc 500, hãy kiểm tra xem bạn đã khởi động lại Backend (`npm run dev`) chưa.*
