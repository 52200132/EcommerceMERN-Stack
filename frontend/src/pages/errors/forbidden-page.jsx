import { Link, useNavigate } from "react-router-dom";
import "./error-pages.scss";

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <section className="error-page section">
      <div className="container">
        <div className="error-card">
          <span className="error-code">403</span>
          <h2>Không có quyền truy cập</h2>
          <p>Bạn không có quyền xem trang này. Hãy đăng nhập bằng tài khoản phù hợp hoặc liên hệ quản trị viên để được cấp quyền.</p>
          <div className="error-actions">
            <button type="button" className="btn btn-outline-primary" onClick={() => navigate(-1)}>Quay lại</button>
            <Link to="/login" className="btn btn-primary">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForbiddenPage;
