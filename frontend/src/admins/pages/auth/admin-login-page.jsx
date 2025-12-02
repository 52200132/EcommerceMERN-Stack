import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Form, Spinner } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { loginSchema } from "#schemas";
import { useLoginUserMutation } from "#services/auth-api";
import { updateCredentials } from "#features/auth-slice";

import "./admin-auth.scss";

const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || "/admin/dashboard";
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "all",
  });

  const onSubmit = async (values) => {
    try {
      const response = await loginUser(values).unwrap();
      const user = response?.dt;
      if (!user?.isManager) {
        toast.error("Tài khoản của bạn không có quyền truy cập trang quản trị.");
        return;
      }
      dispatch(updateCredentials(user));
      toast.success("Đăng nhập quản trị thành công");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(error?.em || "Không thể đăng nhập, vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <div className="admin-auth-page">
      <div className="admin-auth-bg"></div>
      <div className="admin-auth-content container">
        <div className="row align-items-center min-vh-100">
          <div className="col-lg-6 d-none d-lg-block">
            <div className="admin-auth-hero">
              <div className="admin-auth-badge">2TPS Admin</div>
              <h2>Chào mừng quay lại bảng điều khiển</h2>
              <p>
                Đăng nhập bằng tài khoản quản trị để theo dõi đơn hàng, người dùng,
                sản phẩm và các chương trình khuyến mãi.
              </p>
              <ul>
                <li>Giám sát hoạt động bán hàng theo thời gian thực</li>
                <li>Quản lý kho và cập nhật tồn kho tức thì</li>
                <li>Phân quyền nhân sự và kiểm soát bảo mật</li>
              </ul>
            </div>
          </div>

          <div className="col-lg-6 col-md-10 ms-auto">
            <Card className="admin-auth-card shadow-lg">
              <Card.Body>
                <div className="admin-auth-header">
                  <div className="admin-auth-logo">2TPS</div>
                  <div>
                    <p className="mb-0 text-muted">Khu vực quản trị</p>
                    <h3 className="fw-bold">Đăng nhập</h3>
                  </div>
                </div>

                <Form onSubmit={handleSubmit(onSubmit)} noValidate className="admin-auth-form">
                  <Form.Group className="mb-3" controlId="adminEmail">
                    <Form.Label>Địa chỉ email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="nhap-email@congty.com"
                      isInvalid={!!errors.email}
                      {...register("email")}
                      autoComplete="email"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="adminPassword">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Nhập mật khẩu quản trị"
                      isInvalid={!!errors.password}
                      {...register("password")}
                      autoComplete="current-password"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password?.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check
                      type="checkbox"
                      id="rememberAdmin"
                      label="Ghi nhớ đăng nhập"
                      className="text-muted"
                    />
                    <Link to="/forgot-password" className="admin-auth-link">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-100 admin-auth-submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Đang xác thực...
                      </>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                </Form>

                <p className="admin-auth-helper text-center mb-0 mt-3">
                  Trở về trang mua sắm?{" "}
                  <Link to="/" className="admin-auth-link">
                    Về trang chủ
                  </Link>
                </p>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
