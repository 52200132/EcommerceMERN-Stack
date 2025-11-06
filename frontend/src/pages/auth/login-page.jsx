import { Link } from 'react-router-dom';
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { Button, Col, Form, Row } from 'react-bootstrap';

import { useRenderCount } from '#custom-hooks';

import './auth.scss'
import { useLoginForm } from '#component-hooks/use-login-hooks';


const LoginPage = () => {
  useRenderCount('login-page', 'both');
  const { register, onSubmit, formState: { errors } } = useLoginForm();

  return (
    <div className="tps-login-container container">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="login-form">
            <div className="section-title text-center">
              <h2>Đăng nhập</h2>
              <p>Chào mừng bạn trở lại! Vui lòng đăng nhập vào tài khoản của bạn</p>
            </div>

            <Form onSubmit={onSubmit} noValidate>
              {/* Email */}
              <Form.Group className="mb-3">
                <Form.Label htmlFor="email">Địa chỉ Email</Form.Label>
                <Form.Control
                  {...register("email")}
                  isInvalid={!!errors.email}
                  id="email"
                  placeholder="Nhập địa chỉ email của bạn"
                  autoCapitalize='true'
                />
                <Form.Control.Feedback type="invalid">
                  <span className='tps-error-icon'><MdOutlineReportGmailerrorred /></span>
                  {errors.email && errors.email.message}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Password */}
              <Form.Group className="mb-3">
                <Form.Label htmlFor="password">Mật khẩu</Form.Label>
                <Form.Control
                  {...register("password")}
                  isInvalid={!!errors.password}
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu của bạn"
                  autoComplete="true"
                />
                <Form.Control.Feedback type="invalid">
                  <span className='tps-error-icon'><MdOutlineReportGmailerrorred /></span>
                  {errors.password && errors.password.message}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Row>
                  <Col>
                    <Form.Check
                      type="checkbox"
                      id="remember"
                      name="remember"
                      label="Ghi nhớ tôi"
                    />
                  </Col>
                  <Col className="text-end">
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                  </Col>
                </Row>
              </Form.Group>

              <Form.Group>
                <Button type='submit' variant='primary' className="w-100">
                  Đăng nhập
                </Button>
              </Form.Group>

              <Form.Group className="text-center">
                <p>
                  Don't have an account?
                  <Link to="/register" className="ms-2">Tạo tài khoản</Link>
                </p>
              </Form.Group>
            </Form>

            {/* <div className="social-login text-center">
              <p>Or sign in with</p>
              <div className="social-buttons">
                <button className="btn btn-outline-primary me-2">
                  <i className="lni lni-facebook-filled"></i> Facebook
                </button>
                <button className="btn btn-outline-danger">
                  <i className="lni lni-google"></i> Google
                </button>
              </div>
            </div> */}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;