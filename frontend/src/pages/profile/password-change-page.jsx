import { useForm } from "react-hook-form";
import { Button, Form, InputGroup } from "react-bootstrap";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";

import { useUpdatePasswordMutation } from "#services/user-services";
import { toast } from "react-toastify";
import { axiosBaseQueryUtil } from "#services/axios-config";
import { passwordChangeSchema } from "#schemas";

const PasswordChangePage = () => {
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'all',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const passwordFields = [
    { name: 'currentPassword', label: 'Mật khẩu hiện tại' },
    { name: 'newPassword', label: 'Mật khẩu mới' },
    { name: 'confirmNewPassword', label: 'Xác nhận mật khẩu mới' },
  ];

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const onSubmit = handleSubmit(async (formValues) => {
    axiosBaseQueryUtil.callbackfn = (data, hasError) => {
      console.log('Password change response data:', data);
      if (hasError && data?.ec === 400) {
        toast.error('Mật khẩu cũ không đúng');
      } else if (data?.ec === 0) {
        toast.info('Mật khẩu của bạn đã được cập nhật');
      } else {
        console.log('Unexpected response data:', data);
      }
    };
    updatePassword({
      password: formValues.currentPassword,
      new_password: formValues.newPassword,
    });
  });

  return (
    <div className="profile-panel">
      <div className="profile-panel__heading">
        <div>
          <h2>Đổi mật khẩu</h2>
          <p>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
        </div>
      </div>
      <div className="password-helper">
        <Form onSubmit={onSubmit}>
          {passwordFields.map(({ name, label }) => {
            const fieldError = errors?.[name];
            const isVisible = !!showPasswords[name];

            return (
              <Form.Group className='mb-3' controlId={name} key={name}>
                <Form.Label>{label}</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={isVisible ? 'text' : 'password'}
                    isInvalid={!!fieldError}
                    {...register(name)}
                  />
                  <Button
                    variant="outline-secondary"
                    type="button"
                    className="d-flex align-items-center"
                    onClick={() => togglePasswordVisibility(name)}
                    aria-label={`${isVisible ? 'Ẩn' : 'Hiện'} ${label.toLowerCase()}`}
                    title={`${isVisible ? 'Ẩn' : 'Hiện'} mật khẩu`}
                  >
                    {isVisible ? <BsEyeSlash /> : <BsEye />}
                  </Button>
                </InputGroup>
                <Form.Control.Feedback type='invalid' className='d-block'>
                  {fieldError?.message}
                </Form.Control.Feedback>
              </Form.Group>
            );
          })}

          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default PasswordChangePage;