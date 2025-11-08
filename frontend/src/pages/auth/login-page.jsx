import { Link } from 'react-router-dom';
import { MdOutlineReportGmailerrorred } from 'react-icons/md';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useLoginForm, useLoginHandlers } from '#component-hooks/use-login-hooks';

import { useRenderCount } from '#custom-hooks';

import './auth.scss'

const LoginPage = () => {
  useRenderCount('login-page', 'both');
  const { register, onSubmit, formState: { errors } } = useLoginForm();
  const { handleGoogleLogin, handleFacebookLogin, handleTwitterLogin } = useLoginHandlers();
  return (
    <div className="tps-login-container container">
      <Row className="justify-content-center">
        <Col md={10} lg={7}>
          <div className="login-form">
            <div className="section-title text-center">
              <h2>Đăng nhập</h2>
              <p>Chào mừng bạn trở lại! Đăng nhập vào tài khoản của bạn,<br />sử dụng tài khoản mạng xã hội hoặc địa chỉ email</p>
            </div>

            <div className="social-login">
              <Row>
                <Col lg={4} md={4} xs={12}>
                  <span onClick={handleFacebookLogin} className="btn facebook-btn"><i className="lni lni-facebook-filled"></i> Facebook login</span>
                </Col>
                <Col lg={4} md={4} xs={12}>
                  <span onClick={handleTwitterLogin} className="btn twitter-btn"><i className="lni lni-twitter-original"></i> Twitter login</span>
                </Col>
                <Col lg={4} md={4} xs={12}>
                  <span onClick={handleGoogleLogin} className="btn google-btn"><i className="lni lni-google"></i> Google login</span>
                </Col>
              </Row>
            </div>

            <div className="alt-option"><span>Hoặc</span></div>

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

          </div>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;