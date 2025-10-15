import { Link } from 'react-router-dom';
import './auth.scss'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import registerSchema from '../../validators/registerValidator';
import { MdOutlineReportGmailerrorred } from "react-icons/md";

const RegisterPage = () => {
  const { register, handleSubmit, trigger, formState: { errors } } =
    useForm({ resolver: zodResolver(registerSchema), mode: 'all' });

  const onSubmit = async (data) => {
    // call API
    // alert(JSON.stringify(data, null, 2));
  };

  return (
    <div className="tps-register-container container">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-12">
          <div className="register-form">
            <div className="section-title text-center">
              <h2>Đăng ký tài khoản</h2>
              <p>Tham gia cùng chúng tôi hôm nay! Tạo tài khoản của bạn để bắt đầu</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              <div className="form-group">
                <label htmlFor="fullname">Họ và tên</label>
                <input className={`form-control ${errors.fullname ? 'is-invalid' : ''}`} {...register("fullname")} id="fullname" type="text" placeholder="Nhập họ và tên" />
                <div className='invalid-feedback'>
                  <span className='tps-error-icon'><MdOutlineReportGmailerrorred /></span>
                  {errors.fullname && errors.fullname.message}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Địa chỉ email</label>
                <input className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register("email")} id="email" type="email" placeholder="Nhập email" />
                <div className='invalid-feedback'>
                  <span className='tps-error-icon'><MdOutlineReportGmailerrorred /></span>
                  {errors.email && errors.email.message}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input className={`form-control ${errors.password ? 'is-invalid' : ''}`} {...register("password")}
                onChange={(e) => { register('password').onChange(e); trigger('confirmPassword'); }} id="password" type="password" placeholder="Tạo mật khẩu" />
                <div className='invalid-feedback'>
                  <span className='tps-error-icon'><MdOutlineReportGmailerrorred /></span>
                  {errors.password && errors.password.message}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} {...register("confirmPassword")} id="confirmPassword" type="password" placeholder="Nhập lại mật khẩu đã tạo" />
                <div className='invalid-feedback'>
                  <span className='tps-error-icon'><MdOutlineReportGmailerrorred /></span>
                  {errors.confirmPassword && errors.confirmPassword.message}
                </div>
              </div>

              {/* <div className="form-group">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="terms"
                    name="terms"
                    required
                  />
                  <label className="form-check-label" htmlFor="terms">
                    I agree to the <Link to="/terms">Terms of Service</Link> and
                    <Link to="/privacy" className="ms-1">Privacy Policy</Link>
                  </label>
                </div>
              </div> */}

              <div className="form-group">
                <button type="submit" className="btn btn-primary w-100">
                  Tạo tài khoản
                </button>
              </div>

              <div className="form-group text-center">
                <p>
                  Đã có tài khoản?
                  <Link to="/login" className="ms-2">Đăng nhập</Link>
                </p>
              </div>
            </form>

            {/* <div className="social-login text-center">
              <p>Or sign up with</p>
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

export default RegisterPage;