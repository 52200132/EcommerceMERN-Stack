import { Link, useNavigate } from "react-router-dom";
import "./error-pages.scss";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <section className="error-page section">
      <div className="container">
        <div className="error-card">
          <span className="error-code">404</span>
          <h2>Không tìm thấy trang</h2>
          <p>Xin lỗi, chúng tôi không thể tìm thấy trang bạn yêu cầu. Kiểm tra lại đường dẫn hoặc quay về trang chủ.</p>
          <div className="error-actions">
            <button type="button" className="btn btn-outline-primary" onClick={() => navigate(-1)}>Quay lại</button>
            <Link to="/" className="btn btn-primary">Về trang chủ</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
