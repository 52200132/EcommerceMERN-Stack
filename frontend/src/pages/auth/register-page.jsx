import { Link, useNavigate } from 'react-router-dom';
import { Button, Col, Form, Row, Alert } from 'react-bootstrap';
import { MdOutlineReportGmailerrorred } from "react-icons/md";
import { Controller } from 'react-hook-form';

import Select from 'react-select';

import { useScrollTo } from '#custom-hooks';
import {
  useAddressesHandlers,
  useDistrictsOptions,
  useProvincesOptions,
  useRegisterForm,
  useWardsOptions
} from '#component-hooks/use-register-hooks';

import './auth.scss';
import { useEffect, useState } from 'react';

const selectControlStyles = (hasError) => ({
  control: (base) => ({
    ...base,
    fontSize: '1rem',
    fontWeight: '400',
    boxShadow: "var(--bs-box-shadow-inset)",
    borderColor: hasError ? 'var(--bs-form-invalid-border-color)' : 'var(--bs-border-color)',
    cursor: 'text',
    '&:hover': { borderColor: hasError ? 'var(--bs-danger)' : 'var(--bs-border-color)' },
    '&:focus': { borderColor: hasError ? 'var(--bs-danger)' : 'var(--bs-body-bg)' },
  })
});

const CountDown = ({ children, durationSeconds, callback }) => {
  if (!durationSeconds) durationSeconds = 7; // seconds
  const [currentSeconds, setCurrentSeconds] = useState(durationSeconds);
  useEffect(() => {
    if (currentSeconds <= 0) {
      if (callback) callback();
      return;
    }
    const timerId = setTimeout(() => {
      setCurrentSeconds(currentSeconds - 1);
    }, 1000);
    return () => clearTimeout(timerId);
  }, [currentSeconds]);
  return (
    <>
      {typeof children === 'function' ? children(currentSeconds) : children}
    </>
  )
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register, onSubmit, setValue, control, formState: { errors },
    isSuccess, isError, error
  } = useRegisterForm();
  const showRegisterForm = !isSuccess;
  const errorMessage = error?.ec === 400 ? error?.em : 'Đã có lỗi xảy ra trong quá trình đăng ký. Vui lòng thử lại.';
  const { handleProvinceChange, handleDistrictChange, provinceCode, districtCode } = useAddressesHandlers(setValue);
  const { provincesOptions, isLoading: provincesLoading } = useProvincesOptions();
  const { districtsOptions, isLoading: districtsLoading } = useDistrictsOptions(provinceCode);
  const { wardsOptions, isLoading: wardsLoading } = useWardsOptions(districtCode);
  useScrollTo(0, 'instant', [isSuccess]);

  return (
    <div className="tps-register-container container">
      <Row className="justify-content-center">
        <Col lg={8} >
          {showRegisterForm && (
            <div className="register-form">
              <div className="section-title text-center">
                <h2>Đăng ký tài khoản</h2>
                <p>Tham gia cùng chúng tôi hôm nay! Tạo tài khoản của bạn để bắt đầu</p>
              </div>

              <Form noValidate onSubmit={onSubmit}>

                <Row className='mb-3'>
                  <Col md={6}>
                    {/* Họ và tên */}
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="username">Họ và tên</Form.Label>
                      <Form.Control
                        isInvalid={!!errors.username}
                        {...register("username")}
                        id="username"
                        type="text" placeholder="Nhập họ và tên"
                      />
                      <Form.Control.Feedback type="invalid">
                        <span className='tps-error-icon'><MdOutlineReportGmailerrorred /></span>
                        {errors.username && errors.username.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    {/* Email */}
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor="email">Địa chỉ email</Form.Label>
                      <Form.Control
                        autoComplete='email'
                        isInvalid={!!errors.email}
                        {...register("email")}
                        id="email"
                        type="email"
                        placeholder="Nhập email"
                      />
                      <Form.Control.Feedback type="invalid">
                        <span className='tps-error-icon'><MdOutlineReportGmailerrorred /></span>
                        {errors.email && errors.email.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="password">Mật khẩu</Form.Label>
                    <Form.Control
                      autoComplete="new-password"
                      isInvalid={!!errors.password}
                      {...register("password")}
                      id="password"
                      type="password"
                      placeholder="Tạo mật khẩu"
                    />
                    <Form.Control.Feedback type="invalid">
                      <span className='tps-error-icon'><MdOutlineReportGmailerrorred /></span>
                      {errors.password && errors.password.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col> */}

                  {/* <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="confirmPassword">Xác nhận mật khẩu</Form.Label>
                    <Form.Control
                      autoComplete='new-password'
                      isInvalid={!!errors.confirmPassword}
                      {...register("confirmPassword")}
                      id="confirmPassword"
                      type="password"
                      placeholder="Nhập lại mật khẩu đã tạo"
                    />
                    <Form.Control.Feedback type="invalid">
                      <span className='tps-error-icon'><MdOutlineReportGmailerrorred /></span>
                      {errors.confirmPassword && errors.confirmPassword.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col> */}

                </Row>

                <Row className='mb-3'>
                  <h6 className='mb-3'>Thông tin địa chỉ giao hàng</h6>
                  <Col md={6}>
                    {/* Tên người nhận */}
                    <Form.Group className='mb-3'>
                      <Form.Label htmlFor='Addresses.receiver'>Người nhận</Form.Label>
                      <Form.Control
                        isInvalid={!!errors.Addresses?.receiver}
                        id='Addresses.receiver'
                        {...register('Addresses.receiver')}
                      />
                      <Form.Control.Feedback type='invalid'>
                        {errors.Addresses?.receiver && errors.Addresses.receiver.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    {/* Số điện thoại */}
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor='Addresses.phone'>Số điện thoại</Form.Label>
                      <Form.Control
                        isInvalid={!!errors.Addresses?.phone}
                        id='Addresses.phone'
                        {...register('Addresses.phone')}
                      />
                      <Form.Control.Feedback type='invalid'>
                        {errors.Addresses?.phone && errors.Addresses.phone.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    {/* Tỉnh/Thành phố */}
                    <Form.Group className="mb-3">
                      <Form.Label htmlFor='Addresses.province'>Tỉnh/Thành phố</Form.Label>
                      <Controller
                        control={control}
                        name='Addresses.province'
                        render={({ field: { value, onChange, ref } }) => (
                          <Select
                            classNamePrefix='tps'
                            placeholder=''
                            options={provincesOptions}
                            value={provincesOptions.find(option => option.value === value) || null}
                            isLoading={provincesLoading}
                            onChange={selectedOption => handleProvinceChange(selectedOption, onChange)}
                            defaultValue={{ value: '', label: 'Chọn tỉnh/thành phố' }}
                            inputRef={ref}
                            styles={selectControlStyles(!!errors.Addresses?.province)}
                          />
                        )}
                      />
                      <Form.Control hidden id='Addresses.province' isInvalid={!!errors.Addresses?.province} />
                      <Form.Control.Feedback type='invalid'>
                        {errors.Addresses?.province && errors.Addresses.province.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    {/* Quận/Huyện */}
                    <Form.Group className='mb-3'>
                      <Form.Label htmlFor='Addresses.district'>Quận/Huyện</Form.Label>
                      <Controller
                        control={control}
                        name='Addresses.district'
                        render={({ field: { onChange, value, ref } }) => (
                          <Select
                            classNamePrefix='tps'
                            placeholder=''
                            isLoading={districtsLoading}
                            options={districtsOptions}
                            value={districtsOptions.find(option => option.value === value) || null}
                            onChange={selectedOption => handleDistrictChange(selectedOption, onChange)}
                            defaultValue={{ value: '', label: 'Chọn quận/huyện' }}
                            inputRef={ref}
                            styles={selectControlStyles(!!errors.Addresses?.district)}
                          />
                        )}
                      />
                      <Form.Control
                        isInvalid={!!errors.Addresses?.district}
                        id='Addresses.district'
                        hidden
                      />
                      <Form.Control.Feedback type='invalid'>
                        {errors.Addresses?.district && errors.Addresses.district.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    {/* Phường/Xã */}
                    <Form.Group className='mb-3'>
                      <Form.Label htmlFor='Addresses.ward'>Phường/Xã</Form.Label>
                      <Controller
                        control={control}
                        name='Addresses.ward'
                        render={({ field: { onChange, value, ref } }) => (
                          <Select
                            classNamePrefix='tps'
                            placeholder=''
                            isLoading={wardsLoading}
                            options={wardsOptions}
                            defaultValue={{ value: '', label: 'Chọn phường/xã' }}
                            value={wardsOptions.find(option => option.value === value) || null}
                            onChange={selectedOption => { onChange(selectedOption?.value); }}
                            inputRef={ref}
                            styles={selectControlStyles(!!errors.Addresses?.ward)}
                          />
                        )}
                      />
                      <Form.Control
                        isInvalid={!!errors.Addresses?.ward}
                        id='Addresses.ward'
                        hidden
                      />
                      <Form.Control.Feedback type='invalid'>
                        {errors.Addresses?.ward && errors.Addresses.ward.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    {/* Số nhà, tên đường */}
                    <Form.Group className='mb-3'>
                      <Form.Label htmlFor='Addresses.street'>Số nhà, tên đường</Form.Label>
                      <Form.Control
                        type='text'
                        id='Addresses.street'
                        placeholder='Nhập địa chỉ cụ thể'
                        {...register('Addresses.street')}
                        isInvalid={!!errors.Addresses?.street}
                      />
                      <Form.Control.Feedback type='invalid'>
                        {errors.Addresses?.street && errors.Addresses.street.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    {/* Mã bưu chính */}
                    <Form.Group className='mb-3'>
                      <Form.Label htmlFor='Addresses.postalCode'>Mã bưu chính</Form.Label>
                      <Form.Control
                        type='text'
                        id='Addresses.postalCode'
                        placeholder='Nhập mã bưu chính'
                        {...register('Addresses.postalCode')}
                        isInvalid={!!errors.Addresses?.postalCode}
                      />
                      <Form.Control.Feedback type='invalid'>
                        {errors.Addresses?.postalCode && errors.Addresses.postalCode.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                </Row>

                <Form.Group className="mb-3">
                  <Button type="submit" className="btn btn-primary w-100">
                    Tạo tài khoản
                  </Button>
                </Form.Group>

                <Form.Group className="text-center">
                  <p>
                    Đã có tài khoản?
                    <Link to="/login" className="ms-2">Đăng nhập</Link>
                  </p>
                </Form.Group>
              </Form>

            </div>
          )}
          <Alert show={isError} variant="danger" className="mt-3 text-wrap">
            {errorMessage}
            <p>Hãy kiểm tra <Link target="_blank" to={`https://mail.google.com/mail/u/0/#search/${process.env.REACT_APP_APP_NAME}`}>email</Link></p>
          </Alert>
          <Alert show={isSuccess} variant="info" className="mt-3 text-wrap">
            <p>Đăng ký tài khoản thành công! Vui lòng kiểm tra <Link target="_blank" to={`https://mail.google.com/mail/u/0/#search/${process.env.REACT_APP_APP_NAME}`}>email</Link> để lấy mật khẩu.</p>
            <CountDown durationSeconds={7} callback={() => isSuccess && navigate("/login")}>
              {(seconds) => (
                <p>Bạn sẽ được chuyển đến trang đăng nhập sau {seconds} giây.</p>
              )}
            </CountDown>
          </Alert>
        </Col>
      </Row>
    </div>
  );
};

export default RegisterPage;
