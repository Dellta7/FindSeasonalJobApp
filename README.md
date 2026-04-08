# FindSeasonalJobApp — App tìm việc thời vụ (Project mẫu)

## Chạy project
Yêu cầu: Node.js + npm, Expo CLI (dùng qua `npx expo` cũng được).

- Cài dependencies: `npm install`
- Chạy dev: `npm run start`
- Chạy Android: `npm run android`
- Chạy iOS: `npm run ios`
- Chạy Web: `npm run web`

## Tài liệu phân tích
- SRS: docs/SRS.md
- Use cases: docs/UseCases.md
- User stories: docs/UserStories.md

## Cấu trúc thư mục (mẫu)
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
