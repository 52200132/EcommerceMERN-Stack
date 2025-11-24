# EcommerceMERN-Stack

Xây dựng website thương mại điện tử bán các sản phẩm như: laptop, chuột, bàn phím, tai nghe,.. .Dự án được sử dụng framework MERN stack để build backend và frontend.

## 🚀 Công nghệ sử dụng

### Backend

- **Node.js** & **Express.js** - Web framework
- **MongoDB** & **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload

### Frontend

- **React.js** - UI Library
- **Redux** - State management
- **React Router** - Navigation
- **React Bootstrap** - UI Components
- **Axios** - HTTP client

## 📦 Cài đặt

### Yêu cầu hệ thống

- Node.js (v14 hoặc cao hơn)
- MongoDB
- npm hoặc yarn

### 1. Clone repository

```bash
git clone https://github.com/52200132/EcommerceMERN-Stack.git
cd EcommerceMERN-Stack
```

### 2. Cài đặt backend

```bash
cd backend
npm install
```

### 3. Cài đặt frontend

```bash
cd frontend
npm install
```

### 4. Cấu hình môi trường

Tạo file `.env` trong thư mục `backend` từ file `.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
APP_URL=http://localhost:5000
```

### 5. Chạy ứng dụng

#### Chạy backend (Port 5000)

```bash
cd backend
npm run dev
```

#### Chạy frontend (Port 3000)

```bash
cd frontend
npm start
```

### 6. Import dữ liệu mẫu

```bash
cd backend
node seeder.js
```

## 🔐 Tài khoản mặc định

Sau khi import dữ liệu mẫu:

**Admin:**

- Email: admin@example.com
- Password: 123456

**Người dùng thường:**

- Email: john@example.com / jane@example.com
- Password: 123456

## 📱 Tính năng

### Người dùng

- [x] Đăng ký/Đăng nhập
- [x] Xem sản phẩm
- [x] Tìm kiếm sản phẩm
- [x] Giỏ hàng
- [x] Đặt hàng
- [x] Lịch sử đơn hàng
- [x] Đánh giá sản phẩm
- [x] Cập nhật hồ sơ

### Admin

- [x] Quản lý sản phẩm
- [x] Quản lý đơn hàng
- [x] Quản lý người dùng
- [x] Thống kê

### Sản phẩm

- [x] Laptop (MacBook Pro, Dell XPS, ...)
- [x] Chuột (Logitech, Razer, ...)
- [x] Bàn phím (Corsair, ASUS, ...)
- [x] Tai nghe (Sony, HyperX, ...)

## 🛠️ Scripts

### Backend

```bash
npm start          # Chạy production
npm run dev        # Chạy development với nodemon
node seeder.js     # Import dữ liệu mẫu
node seeder.js -d  # Xóa dữ liệu
```

### Frontend

```bash
npm start          # Chạy development server
npm run build      # Build production
npm test           # Chạy tests
```

## 📁 Cấu trúc thư mục

```
EcommerceMERN-Stack/
├── backend/
│   ├── data/              # Dữ liệu mẫu
│   ├── middleware/        # Middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── .env.example      # Environment variables template
│   ├── server.js         # Express server
│   └── seeder.js         # Database seeder
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── redux/        # Redux store, actions, reducers
│   │   ├── App.js        # Main App component
│   │   └── index.js      # Entry point
│   └── package.json
└── README.md
```

## 🔄 API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy thông tin user
- `PUT /api/auth/profile` - Cập nhật thông tin user

### Products

- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin)
- `PUT /api/products/:id` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### Orders

- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `GET /api/orders/myorders` - Lấy đơn hàng của user
- `PUT /api/orders/:id/pay` - Cập nhật thanh toán

### Uploads

- `POST /api/upload/image` - Upload 1 ảnh (field `image`, tối đa 5MB, cho phép JPEG/PNG/WebP). Trả về URL tuyệt đối sau khi resize <= 1280px và nén bằng Sharp.
- `POST /api/upload/images` - Upload nhiều ảnh (field `image`, tối đa 10 ảnh/lần). API trả về mảng metadata gồm `url`, `path`, `size`, `mimeType`, `width`, `height` cho từng ảnh.

### Users (Admin)

- `GET /api/users` - Lấy danh sách users
- `GET /api/users/:id` - Lấy chi tiết user
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

## 🚀 Deployment

### Environment Variables cho Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_jwt_key
APP_URL=https://api.example.com
```

### Build Frontend

```bash
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

- Email: info@techstore.com
- GitHub: [52200132](https://github.com/52200132)
