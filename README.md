# MonPlayer KKPhim API Proxy

Một ứng dụng Node.js (Express) đóng vai trò làm Proxy kết nối giữa MonPlayer và API của KKPhim (`phimapi.com`). Ứng dụng này chuyển đổi dữ liệu từ KKPhim sang cấu trúc JSON mà MonPlayer có thể hiểu được, hỗ trợ đầy đủ các tính năng như Trang chủ, Tìm kiếm, Lọc phim, và Xem chi tiết.

## Tính năng chính

- **Trang chủ đa dạng**: Hiển thị nhiều nhóm phim (Phim mới, Phim bộ, Phim lẻ, Hoạt hình, TV Shows).
- **Tìm kiếm thông minh**: Hỗ trợ tìm kiếm theo từ khóa và cung cấp gợi ý (suggestions).
- **Bộ lọc mạnh mẽ**: Hỗ trợ lọc theo Thể loại, Quốc gia và Năm phát hành thông qua menu dropdown trên MonPlayer.
- **Phân trang (Pagination)**: Hỗ trợ tính năng `load_more` để tải thêm dữ liệu khi cuộn trang.
- **Tối ưu hóa hình ảnh**: Chuyển đổi link ảnh thông qua proxy của KKPhim để đảm bảo hiển thị tốt.
- **Link trực tiếp**: Trích xuất trực tiếp link M3U8 từ các server phát.

## Cài đặt và Sử dụng

### 1. Cài đặt môi trường
Đảm bảo bạn đã cài đặt [Node.js](https://nodejs.org/).

### 2. Cài đặt dependencies
Di chuyển vào thư mục `api` và chạy lệnh:
```bash
npm install
```

### 3. Chạy Server
Khởi động server ở cổng 3000 (mặc định):
```bash
node index.js
```

## Danh sách API Endpoints

### 1. Trang chủ
- **URL**: `GET /`
- **Mô tả**: Trả về cấu trúc chính bao gồm thông tin metadata, menu lọc (`sorts`), cấu hình tìm kiếm (`search`) và các nhóm phim trên trang chủ.

### 2. Chi tiết phim
- **URL**: `GET /detail?slug={movie_slug}`
- **Tham số**:
    - `slug`: Slug của phim (ví dụ: `ngoi-truong-xac-song`).
- **Mô tả**: Trả về thông tin chi tiết phim và danh sách các tập phim kèm link stream.

### 3. Tìm kiếm
- **URL**: `GET /search?keyword={keyword}&page={page}&limit={limit}`
- **Tham số**:
    - `keyword`: Từ khóa tìm kiếm.
    - `page`: Trang cần lấy (mặc định: 1).
    - `limit`: Số lượng kết quả mỗi trang (mặc định: 24).
- **Mô tả**: Trả về kết quả tìm kiếm kèm thông tin phân trang.

### 4. Gợi ý tìm kiếm
- **URL**: `GET /suggest?keyword={keyword}`
- **Mô tả**: Trả về danh sách tên các bộ phim khớp với từ khóa để hiển thị gợi ý khi người dùng gõ.

### 5. Danh sách phim (Lọc)
- **URL**: `GET /list?type={type}&category={category}&country={country}&year={year}&page={page}&limit={limit}`
- **Tham số**:
    - `type`: Loại phim (`phim-bo`, `phim-le`, `hoat-hinh`...).
    - `category`: Slug thể loại.
    - `country`: Slug quốc gia.
    - `year`: Năm phát hành.
- **Mô tả**: Trả về danh sách phim dựa trên các điều kiện lọc. Hỗ trợ `load_more`.

## Cấu trúc Project

- `index.js`: File server chính chứa toàn bộ logic xử lý và mapping dữ liệu.
- `package.json`: Chứa thông tin project và các dependencies (`express`, `axios`, `cors`).

## Tích hợp với MonPlayer

Bạn chỉ cần thêm URL server của mình (ví dụ: `http://your-ip:3000/`) vào phần cấu hình playlist hoặc nhà cung cấp dữ liệu trong ứng dụng MonPlayer.

---
*Dữ liệu được cung cấp bởi KKPhim (phimapi.com).*
