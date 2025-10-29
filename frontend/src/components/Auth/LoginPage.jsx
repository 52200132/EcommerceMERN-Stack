import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import loginSchema from '../../validators/loginValidator';
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import './auth.scss'

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } =
    useForm({ resolver: zodResolver(loginSchema), mode: 'all' });

  const onSubmit = async (data) => {
    // call API
    // alert(JSON.stringify(data, null, 2));
  };

  return (
    <div className="tps-login-container container">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-12">
          <div className="login-form">
            <div className="section-title text-center">
              <h2>Đăng nhập</h2>
              <p>Chào mừng bạn trở lại! Vui lòng đăng nhập vào tài khoản của bạn</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label htmlFor="email">Địa chỉ Email</label>
                <input className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register("email")} id="email" type="email" placeholder="Nhập địa chỉ email của bạn" />
                <div className='invalid-feedback'>
                  <span className='tps-error-icon'><MdOutlineReportGmailerrorred /></span>
                  {errors.email && errors.email.message}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  {...register("password")}
                  id="password" type="password" placeholder="Nhập mật khẩu của bạn" autoComplete="true"
                />
                <div className='invalid-feedback'>
                  <span className='tps-error-icon'><MdOutlineReportGmailerrorred /></span>
                  {errors.password && errors.password.message}
                </div>
              </div>

              <div className="form-group">
                <div className="row">
                  <div className="col-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="remember"
                        name="remember"
                      />
                      <label className="form-check-label" htmlFor="remember">
                        Ghi nhớ tôi
                      </label>
                    </div>
                  </div>
                  <div className="col-6 text-end">
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <button type="submit" className="btn btn-primary w-100">
                  Đăng nhập
                </button>
              </div>

              <div className="form-group text-center">
                <p>
                  Don't have an account?
                  <Link to="/register" className="ms-2">Tạo tài khoản</Link>
                </p>
              </div>
            </form>

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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;