# Cấu Trúc Frontend Project

## Tổng Quan
Frontend project được tổ chức thành 4 thành phần chính: **Navigation**, **Screens**, **Redux**, và **Components**.

```
frontend/src/
├── Navigation/
│   └── RootNavigator.js          # Quản lý tất cả các screen và navigation flow
├── Screens/
│   ├── HomeScreen.js              # Màn hình trang chủ
│   ├── JobDetailScreen.js         # Màn hình chi tiết công việc
│   ├── JobFormScreen.js           # Màn hình form tạo/sửa công việc
│   ├── LoginScreen.js             # Màn hình đăng nhập
│   ├── ProfileScreen.js           # Màn hình hồ sơ người dùng
│   └── RegisterScreen.js          # Màn hình đăng ký
├── Redux/
│   ├── store.js                   # Cấu hình Redux store
│   └── features/
│       ├── auth/
│       │   ├── authSlice.js       # Redux slice cho authentication
│       │   └── index.js           # Export auth features
│       └── home/
│           ├── homeSlice.js       # Redux slice cho home page state
│           └── index.js           # Export home features
├── Components/
│   └── JobCard.js                 # Component hiển thị thẻ công việc
├── api/
│   └── jobsApi.js                 # API calls cho jobs, users, authentication
├── AppRoot.js                     # Entry point, quản lý app state và logic
├── App.js                         # Root provider (Redux, Fonts)
└── index.js                       # Entry point cho Expo
```

## Chi Tiết Các Thành Phần

### 1. Navigation (`Navigation/`)
- **RootNavigator.js**: Chứa tất cả các component liên quan đến navigation:
  - `RootNavigator`: Component chính export, chứa Stack Navigator
  - `MainTabs`: Tab navigator với 3 tab (Home, Favorites, Profile)
  - `HomeRoute`: Wrapper cho HomeScreen với header profile
  - `JobDetailRoute`: Xử lý loading và hiển thị chi tiết công việc
  - `JobFormRoute`: Xử lý form tạo/sửa công việc
  - `HeaderWithProfile`: Header với logo và nút profile
  - `CenterMessage`: Component hiển thị thông báo giữa màn hình

**Trách nhiệm**: Quản lý tất cả cấu trúc navigation (tabs, stack, screens routing).

### 2. Screens (`Screens/`)
Các component hiển thị (presentational components):
- **HomeScreen.js**: Hiển thị danh sách công việc
- **JobDetailScreen.js**: Hiển thị chi tiết một công việc
- **JobFormScreen.js**: Form nhập liệu tạo/sửa công việc
- **LoginScreen.js**: Form đăng nhập
- **ProfileScreen.js**: Hồ sơ người dùng và công việc đã đăng
- **RegisterScreen.js**: Form đăng ký tài khoản

**Trách nhiệm**: Chỉ render UI, không xử lý business logic phức tạp.

### 3. Redux (`Redux/`)
Quản lý toàn cục state ứng dụng:

#### store.js
- Cấu hình Redux store với persist (lưu state xuống AsyncStorage)
- Persist auth data (keep user logged in)

#### features/auth/
- `authSlice.js`: Redux slice cho authentication
  - State: `user`, `isAuthenticated`
  - Actions: `loginSuccess`, `logoutSuccess`, `updateUser`

#### features/home/
- `homeSlice.js`: Redux slice cho home page
  - State: `items` (jobs), `categories`, `favorites`, `favoriteIds`, `loading`, `error`
  - Actions: `setJobs`, `upsertJob`, `removeJob`, `setCategories`, `setFavorites`, `addFavorite`, `removeFavorite`

**Trách nhiệm**: Quản lý global state, actions, reducers.

### 4. Components (`Components/`)
Reusable components:
- **JobCard.js**: Component hiển thị một thẻ công việc

**Trách nhiệm**: Các component có thể tái sử dụng được.

### 5. API (`api/`)
- **jobsApi.js**: Tất cả API calls tới backend (jobs, users, authentication, favorites, etc.)

**Trách nhiệm**: Xử lý tất cả HTTP requests.

## Flow Ứng Dụng

```
App.js (Setup Redux & Fonts)
  ↓
AppRoot.js (Manage global state, side effects)
  ├─ If not logged in: Show LoginScreen/RegisterScreen
  ├─ If logged in: Render RootNavigator
  │   └─ RootNavigator
  │       └─ MainTabs (3 tabs)
  │           ├─ HomeTab → HomeRoute → HomeScreen
  │           ├─ FavoritesTab → HomeScreen (filtered)
  │           └─ ProfileTab → ProfileScreen
  │           
  │       Stack screens (modal on top)
  │       ├─ JobDetail (from JobDetail route)
  │       └─ JobForm (create/edit job)
  │
  Redux Store
  ├─ auth (user, isAuthenticated)
  └─ home (jobs, categories, favorites)
```

## Cập Nhật từ Cấu Trúc Cũ

### Những Thay Đổi Chính:
1. **Tạo thư mục Navigation**: Tách tất cả logic navigation từ AppRoot.js sang Navigation/RootNavigator.js
2. **Tạo thư mục Redux**: Chuyển `src/store/` → `src/Redux/`
3. **Đổi tên thư mục**: `screens/` → `Screens/` (viết hoa chữ S)
4. **Cập nhật imports**: Tất cả imports cần cập nhật để trỏ đến đường dẫn mới

### File cũ (có thể xoá sau):
- `src/store/` (đã chuyển sang `src/Redux/`)

### Ưu Điểm của Cấu Trúc Mới:
- ✅ **Tách biệt rõ ràng**: Navigation, UI, State logic được tách riêng
- ✅ **Dễ bảo trì**: Mỗi thư mục có trách nhiệm riêng
- ✅ **Tái sử dụng**: Components nhỏ có thể tái sử dụng
- ✅ **Mở rộng**: Dễ thêm features mới
- ✅ **Testing**: Dễ viết unit tests cho từng phần

## Hướng Dẫn Thêm Features Mới

### 1. Thêm Screen mới:
1. Tạo file trong `Screens/`
2. Thêm route trong `Navigation/RootNavigator.js`
3. Thêm navigation call ở nơi cần navigate

### 2. Thêm Redux State:
1. Tạo slice mới trong `Redux/features/`
2. Import reducer vào `Redux/store.js`
3. Sử dụng `useSelector` để access state
4. Sử dụng `useDispatch` để dispatch actions

### 3. Thêm API Calls:
1. Thêm function vào `api/jobsApi.js`
2. Import và sử dụng ở AppRoot.js hoặc Screens

## Import Cheatsheet

```javascript
// Redux actions
import { loginSuccess, logoutSuccess, updateUser } from './Redux/features/auth/authSlice';
import { setJobs, upsertJob, removeJob, ... } from './Redux/features/home/homeSlice';

// Navigation
import { RootNavigator } from './Navigation/RootNavigator';

// Screens
import { HomeScreen } from './Screens/HomeScreen';

// Components
import { JobCard } from './Components/JobCard';

// API
import { getJobs, createJob, login, ... } from './api/jobsApi';
```
