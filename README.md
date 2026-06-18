# FindSeasonalJobApp — App tìm việc thời vụ (Project)

## Update code
Nếu muốn chỉnh sửa code hãy fork trước.

## Clone Project
Mở terminal.
- git clone `https://github.com/FedoraTran/FindSeasonalJobApp.git`
- cd `FindSeasonalJobApp`
- code .

## Chạy project
Yêu cầu: Node.js + npm, Expo CLI (dùng qua `npx expo` cũng được).

### Frontend (Expo)
- `cd frontend`
- Cài thư viện: `npm install`
- Chạy app: `npm start`

## Backend (Node.js + MySQL)
App đã được nâng cấp để lấy dữ liệu thật từ backend MySQL qua API `/jobs`.

### 1) Chuẩn bị MySQL
- Đảm bảo MySQL đang chạy.
- Có thể chạy script tạo DB + table tại `FindSeasonalJobApp.sql`.

### 2) Chạy backend
Mở terminal:

- `cd backend`
- Copy `backend/.env.example` → `backend/.env` và chỉnh lại thông tin MySQL (`DB_USER`, `DB_PASSWORD`, ...)
- `npm install`
- `npm run dev`

Backend sẽ chạy:
- HTTPS: `https://localhost:4953/jobs`
- (Tuỳ chọn) HTTP fallback: `http://localhost:4952/jobs`

Lưu ý:
- HTTPS dùng cert self-signed (dev). Postman cần tắt `SSL certificate verification` nếu bị lỗi.
- HTTPS self-signed cũng hay bị chặn bởi browser/Expo Go, nên frontend mặc định dùng HTTP fallback (có thể đổi qua env `EXPO_PUBLIC_API_BASE_URL`).
- Nếu database đang rỗng, backend sẽ tự seed 3 job mẫu (giống dữ liệu mock cũ) để frontend có dữ liệu ngay.

## Tài liệu phân tích
- Báo cáo (CSDL + API + module + navigation): docs/BAOCAO.md

## Cấu trúc thư mục
- `frontend/`: Expo app
- `frontend/App.js`: entry của Expo app (gọi `frontend/src/AppRoot.js`)
- `frontend/src/AppRoot.js`: điều phối luồng demo (list ↔ detail), state yêu thích
- `frontend/src/screens/`: màn hình
- `frontend/src/components/`: UI component tái sử dụng
- `backend/`: Node.js API + MySQL

## API cần cho Postman
- GET all: `https://localhost:4953/jobs`
- GET one: `https://localhost:4953/jobs/1`
- POST: `https://localhost:4953/jobs`
- PUT: `https://localhost:4953/jobs/1`
- DELETE: `https://localhost:4953/jobs/1`

## API đăng ký quan tâm
- POST: `https://localhost:4953/jobs/1/inquiries`
- GET (theo job): `https://localhost:4953/jobs/1/inquiries`
- (Admin) GET all: `https://localhost:4953/inquiries`

## Luồng demo hiện có (MVP)
- Danh sách việc + tìm kiếm theo từ khoá
- Chip lọc cơ bản theo địa điểm và lĩnh vực
- Xem chi tiết việc
- Lưu/huỷ lưu yêu thích
- Form “Đăng ký quan tâm” (demo bằng Alert)
