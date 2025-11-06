import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

import { registerSchema } from '#schemas';
import { useGetDistrictsQuery, useGetProvincesQuery, useGetWardsQuery } from '#services/addresses-api.js';
import { useRegisterUserMutation } from '#services/auth-api';
import { axiosBaseQueryUtil } from '#services/axios-config';
import { useNavigate } from 'react-router-dom';
import { overlayPreloader } from '#utils/overlay-manager';

/**
 * Custom hook để quản lý logic form đăng ký
 * @returns {Object} Form methods và state từ react-hook-form
 */
export const useRegisterForm = () => {
  const navigate = useNavigate();
  const [registerUser] = useRegisterUserMutation();
  const formMethods = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'all',
    defaultValues: {
      Addresses: {
        province: '',
        district: '',
        ward: '',
      }
    }
  });

  // const { formState: { errors } } = formMethods;
  // Debug: Log errors khi có thay đổi
  // useEffect(() => {
  //   if (Object.keys(errors).length > 0) {
  //     console.log('Form validation errors:', errors);
  //   }
  // }, [errors]);

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
      };
      axiosBaseQueryUtil.flowMessages = [
        { delay: 0, message: 'Đang xử lý...' },
        { delay: 2000, message: 'Vui lòng chờ...' }
      ];
      registerUser(data); // dùng unwrap để ném lỗi nếu có có throw error
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return {
    ...formMethods,
    onSubmit: formMethods.handleSubmit(onSubmit),
  };
};

export const useProvincesOptions = () => {
  const { data, error, isLoading } = useGetProvincesQuery();

  const provincesOptions = [{ value: '', label: 'Chọn tỉnh/thành phố' }, ...data?.dt?.map((p) => ({
    label: `${p.type} ${p.name}`,
    value: `${p.type} ${p.name}`,
    provinceCode: p.code,
  })) || []];

  useEffect(() => {
    if (error) {
      toast.error('Lỗi khi tải danh sách tỉnh/thành phố');
    }
  }, [error]);

  return { provincesOptions, isLoading };
};

export const useDistrictsOptions = (provinceCode) => {
  const { data, isLoading } = useGetDistrictsQuery(provinceCode, { skip: !provinceCode });

  const districtsOptions = [{ value: '', label: 'Chọn quận/huyện' }, ...data?.dt?.map((d) => ({
    label: `${d.type} ${d.name}`,
    value: `${d.type} ${d.name}`,
    districtCode: d.code,
  })) || []];

  return { districtsOptions, isLoading };
}

export const useWardsOptions = (districtCode) => {
  const { data, isLoading } = useGetWardsQuery(districtCode, { skip: !districtCode });

  const wardsOptions = [{ value: '', label: 'Chọn phường/xã' }, ...data?.dt?.map((w) => ({
    label: `${w.type} ${w.name}`,
    value: `${w.type} ${w.name}`,
    wardCode: w.code,
  })) || []];

  return { wardsOptions, isLoading };
}