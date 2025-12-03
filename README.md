# Thông tin sinh viên

- 52200107 - Phùng Tấn Phước
- 52200132 - Võ Văn Sáng
- 52200173 - Nguyễn Bảo Phúc

# Tài khoản mặc định

**Admin:**

- Email:
- Mật khẩu: 123

**Người dùng thường:**

- Email: sangvo2004app@gmail.com
- Mật khẩu: 1234 Coi lại
- Email:
- Mật khẩu:

# Link dự án:

- Link github: https://github.com/52200132/EcommerceMERN-Stack/graphs/contributors?selectedMetric=additions
- Link mongoDb atlas truy cập bằng Compass - database Ecommerce : mongodb+srv://webnodejs:phuocphung@mydatabase.4frxdao.mongodb.net/
- Link video:

# Hướng dẫn triển khai trên Docker Swarm

- Yều cầu cài đặt Docker và Docker Compose trên máy chủ của bạn.
- Đầu tiên mở terminal và khởi tạo Docker Swarm:

```bash
docker swarm init
```

- Chạy dự án bằng lệnh:

```bash
docker stack deploy -c docker-compose.yaml app
```

- Truy cập ứng dụng qua trình duyệt tại địa chỉ: `http://localhost:3000`
- Trang quản trị: `http://localhost:3000/admin`

- Để dừng và xóa stack, sử dụng lệnh:

```bash
docker stack rm app
```

- Để xóa các image đã tải về, sử dụng lệnh:

```bash
docker rmi phuocphung/frontend_app@sha256:402884a169b1fb28d79c5b8c92585f11dce9c8c42fc1ba81c2dfa900b11174a3
docker rmi phuocphung/backend_api@sha256:90c8edcd1921c32f89d2e7af1bc25cd376012ece342674855c829975dab392d8
```

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

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

- GitHub: [52200132](https://github.com/52200132)
