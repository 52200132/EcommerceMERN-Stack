import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { useDebounceSubscribeValues, useOffCanvasStore, useTpsGetState } from '#custom-hooks';
import { clearUserProfileDraft, setUserProfile, setUserProfileDraft } from '#features/user-profile-slice';
import { useUpdateProfileMutation } from '#services/user-services';
import { axiosBaseQueryUtil } from '#services/axios-config';
import userProfileSchema from 'schemas/user-profile-schema';

const ProfileForm = () => {
  const dispatch = useDispatch();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const setShowOffCanvas = useOffCanvasStore(zs => zs.setShow);
  const userProfile = useTpsGetState(state => state.userProfile.user_profile, false);
  const { register, subscribe, handleSubmit, formState: { errors } } = useForm(
    {
      resolver: zodResolver(userProfileSchema),
      mode: 'all',
      defaultValues: userProfile
    }
  );

  const onSubmit = handleSubmit(async (formValues) => {
    axiosBaseQueryUtil.configBehaviors = { showErrorToast: true, showSuccessToast: true };
    axiosBaseQueryUtil.message = { success: 'Cập nhật hồ sơ thành công', error: 'Cập nhật hồ sơ thất bại' };
    axiosBaseQueryUtil.callbackfn = (data) => {
      if (data && data.ec === 0) {
        dispatch(clearUserProfileDraft());
        dispatch(setUserProfile(formValues));
        setShowOffCanvas(false);
      }
    }
    updateProfile(formValues);
  });
  useDebounceSubscribeValues((userProfile) => {
    dispatch(setUserProfileDraft(userProfile));
  }, subscribe, 700);

  return (
    // <div>Profile Form Component</div>
    <Form onSubmit={onSubmit} className='offcanvas-form'>
      <Form.Group className='mb-3'>
        <Form.Label htmlFor='username'>Họ và tên</Form.Label>
        <Form.Control
          id='username'
          isInvalid={!!errors.username}
          {...register('username')}
        />
        <Form.Control.Feedback type='invalid' className='d-block'>
          {errors.username && errors.username.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className='mb-3'>
        <Form.Label htmlFor='email'>Email</Form.Label>
        <Form.Control
          id='email'
          type='email'
          isInvalid={!!errors.email}
          {...register('email')}
        />
        <Form.Control.Feedback type='invalid' className='d-block'>
          {errors.email && errors.email.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group className='mb-3'>
        <div className='mb-2'>Giới tính</div>
        {['Nam', 'Nữ', 'Khác'].map((genderOption) => (
          <Form.Check
            key={genderOption}
            inline
            type="radio"
            label={genderOption}
            value={genderOption}
            {...register('gender')}
            id={`gender-${genderOption.toLowerCase()}`}
          />
        ))}
      </Form.Group>
      <div className='d-flex justify-content-end gap-2'>
        <Button variant='outline-secondary' type='button' onClick={() => setShowOffCanvas(false)}>
          Hủy
        </Button>
        <Button variant='outline-primary' type='submit' disabled={isLoading}>
          {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </Form>
  );
}

export default ProfileForm;