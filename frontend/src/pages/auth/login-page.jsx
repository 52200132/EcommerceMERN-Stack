import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineReportGmailerrorred } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { useRenderCount } from '#custom-hooks';
import { useLoginForm } from '#component-hooks/use-login-hooks';
import { axiosBaseQueryUtil, BASE_URL } from '#services/axios-config';
import { closeOverlayPreloader, overlayPreloader } from '#utils';
import { useLoginGoogleUserMutation } from '#services';
import { setCredentials } from '#features/auth-slice';

import './auth.scss'

const openWindowPopup = (url) => {
  const width = 500;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  const popup = window.open(
    url,
    'googleAuth',
    `width=${width},height=${height},top=${top},left=${left}`
  );
  const timer = setInterval(() => {
    if (popup?.closed) {
      clearInterval(timer);
      closeOverlayPreloader();
    }
  }, 1500)
  console.log('Opened popup window for Google linking:', popup);
  popup.focus();
  return popup;
}

const LoginPage = () => {
  useRenderCount('login-page', 'both');
  const popupRef = useRef(null);
  const { register, onSubmit, formState: { errors } } = useLoginForm();
  const [loginWithGoogle] = useLoginGoogleUserMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleLogin = () => {
    axiosBaseQueryUtil.configBehaviors = {
      showErrorToast: true,
    };
    axiosBaseQueryUtil.message = {
      error: 'Không thể đăng nhập bằng Google. Vui lòng thử lại sau!'
    };
    axiosBaseQueryUtil.callbackfn = (data) => {
      // Chuyển hướng người dùng đến URL liên kết Google
      overlayPreloader()
      if (data?.dt?.urlRedirect) {
        popupRef.current = openWindowPopup(data.dt.urlRedirect);
      }
    }
    loginWithGoogle();
  }

  const handleFacebookLogin = () => {
    toast.info("Comming soon...");
  }

  const handleTwitterLogin = () => {
    toast.info("Comming soon...");
  }

  useEffect(() => {

    const handleMessage = (event) => {
      // Kiểm tra origin backend
      if (event.origin !== BASE_URL.replace('/api', '')) return;
      const data = event.data;

      if (data?.ec === 0) {
        if (data?.em) toast.success('Đăng nhập thành công');
        sessionStorage.setItem('user', data?.dt);
        dispatch(setCredentials(data?.dt ));
        navigate('/');
      } else {
        console.error('Lỗi', data?.em);
        if (data?.ec === 404) {
          toast.warn(data?.em);
        } else {
          toast.warn('Không thể đăng nhập bằng Google');
        }
      }
      if (typeof popupRef?.current?.close === 'function') popupRef.current.close();
      closeOverlayPreloader();
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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