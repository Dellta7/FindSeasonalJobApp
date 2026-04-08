# FindSeasonalJobApp — App tìm việc thời vụ (Project)

## Update code
Nếu muốn chỉnh sửa code hãy fork trước

## Clone Project
- git clone `https://github.com/Dellta7/FindSeasonalJobApp.git`
- cd `FindSeasonalJobApp`
- code .

## Chạy project
Yêu cầu: Node.js + npm, Expo CLI (dùng qua `npx expo` cũng được).

- Cài lại thư viện node: `npm install`
- Chạy expo: `npm expo start`

## Tài liệu phân tích
- SRS: docs/SRS.md
- Use cases: docs/UseCases.md
- User stories: docs/UserStories.md

## Cấu trúc thư mục
- `App.js`: entry của Expo app (gọi `src/AppRoot.js`)
- `src/AppRoot.js`: điều phối luồng demo (list ↔ detail), state yêu thích
- `src/screens/`: màn hình
- `src/components/`: UI component tái sử dụng
- `src/data/`: dữ liệu mock (phục vụ demo trước khi có backend)

## Luồng demo hiện có (MVP)
- Danh sách việc + tìm kiếm theo từ khoá
- Xem chi tiết việc
- Lưu/huỷ lưu yêu thích
- Form “Đăng ký quan tâm” (demo bằng Alert)
