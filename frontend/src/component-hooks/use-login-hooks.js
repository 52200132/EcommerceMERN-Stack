import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

import { loginSchema } from '#schemas';
import { axiosBaseQueryUtil } from '#services/axios-config';
import { useLoginUserMutation } from '#services/auth-api';
import { overlayPreloader } from '#utils/overlay-manager';
import { setCredentials } from '#features/auth-slice';
import { useLoginGoogleUserMutation } from '#services';
import { closeOverlayPreloader } from '#utils';
import { BASE_URL } from '#services/axios-config.js';

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
      axiosBaseQueryUtil.callbackfn = (data, hasError) => {
        if (hasError) return;
        navigate('/');
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

export const useLoginHandlers = () => {
  const [loginWithGoogle] = useLoginGoogleUserMutation();
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleLogin = () => {
    axiosBaseQueryUtil.configBehaviors = {
      showErrorToast: true,
      autoCloseOverlay: false,
    };
    axiosBaseQueryUtil.message = {
      error: 'Không thể đăng nhập bằng Google. Vui lòng thử lại sau!'
    };
    axiosBaseQueryUtil.flowMessages = [
      { delay: 0, message: 'Đang chuyển hướng đến Google...' },
      { delay: 2000, message: 'Vui lòng chờ...' },
      { delay: 4000, message: 'Nếu trang không tự động mở, vui lòng thử lại.' },
      { delay: 8000, message: 'Vui lòng tải lại trang' }
    ];
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
      if (event.data?.event_type !== "GOOGLE_LOGIN") return;
      const data = event.data;

      if (data?.ec === 0) {
        if (data?.em) toast.success('Đăng nhập thành công');
        sessionStorage.setItem('user', data?.dt);
        dispatch(setCredentials(data?.dt));
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

  return { handleGoogleLogin, handleFacebookLogin, handleTwitterLogin };
}