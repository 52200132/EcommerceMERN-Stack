import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import { loginSchema } from '#schemas';
import { axiosBaseQueryUtil } from '#services/axios-config';
import { useLoginUserMutation } from '#services/auth-api';
import { overlayPreloader } from '#utils/overlay-manager';
import { setCredentials } from '#features/auth-slice';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const [loginUser] = useLoginUserMutation();
  const dispatch = useDispatch();
  const formMethods = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'all',
  });

  /**
   * Handler cho submit form
   * @param {Object} data - Form data đã được validate
   */
  const onSubmit = async (data) => {
    try {
      axiosBaseQueryUtil.toggleAllBehaviors(true);
      axiosBaseQueryUtil.overlay = overlayPreloader;
      axiosBaseQueryUtil.callbackfn = (data) => {
        navigate('/');
        console.log('Login successful:', data);
        dispatch(setCredentials(data?.dt));
      };
      axiosBaseQueryUtil.flowMessages = [
        { delay: 0, message: 'Đang xử lý...' },
        { delay: 1000, message: 'Vui lòng chờ...' }
      ];
      loginUser(data);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return {
    ...formMethods,
    onSubmit: formMethods.handleSubmit(onSubmit),
  };
};