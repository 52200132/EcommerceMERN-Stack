import { useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import Select from 'react-select';

import { useOffCanvasStore } from '#custom-hooks';
import { userAddressSchema } from '#schemas';
import { setAddressList, updateAddressList } from '#features/user-profile-slice';
import { axiosBaseQueryUtil } from '#services/axios-config';
import { useAddAddressMutation, useUpdateAddressMutation } from '#services/user-services';
import {
  useDistrictsOptions,
  useProvincesOptions,
  useWardsOptions,
} from '#component-hooks/use-register-hooks';

const selectControlStyles = (hasError) => ({
  control: (base) => ({
    ...base,
    fontSize: '1rem',
    fontWeight: '400',
    boxShadow: 'var(--bs-box-shadow-inset)',
    borderColor: hasError ? 'var(--bs-form-invalid-border-color)' : 'var(--bs-border-color)',
    cursor: 'text',
    '&:hover': { borderColor: hasError ? 'var(--bs-danger)' : 'var(--bs-border-color)' },
    '&:focus': { borderColor: hasError ? 'var(--bs-danger)' : 'var(--bs-body-bg)' },
  }),
});

const AddressForm = () => {
  const dispatch = useDispatch();
  const setShowOffCanvas = useOffCanvasStore((zs) => zs.setShow);
  const address = useOffCanvasStore((zs) => zs.defaultFormValues);
  const isEditMode = !!address?._id;
  const defaultValues = useMemo(
    () => ({
      receiver: address?.receiver || '',
      phone: address?.phone || '',
      country: address?.country || 'Việt Nam',
      province: address?.province || '',
      district: address?.district || '',
      ward: address?.ward || '',
      street: address?.street || '',
      postalCode: address?.postalCode || '',
      isDefault: address?.isDefault || false,
    }),
    [address]
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userAddressSchema),
    mode: 'all',
    defaultValues,
  });

  const [provinceCode, setProvinceCode] = useState(null);
  const [districtCode, setDistrictCode] = useState(null);

  const { provincesOptions, isLoading: provincesLoading } = useProvincesOptions();
  const { districtsOptions, isLoading: districtsLoading } = useDistrictsOptions(provinceCode);
  const { wardsOptions, isLoading: wardsLoading } = useWardsOptions(districtCode);

  const [addAddress, { isLoading: isCreating }] = useAddAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

  const onSubmit = handleSubmit((formValues) => {
    const addressId = address?._id;
    const payload = isEditMode ? { address_id: addressId, ...formValues } : formValues;

    axiosBaseQueryUtil.configBehaviors = { showErrorToast: true, showSuccessToast: true };
    axiosBaseQueryUtil.message = {
      success: isEditMode ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công',
      error: 'Thao tác địa chỉ thất bại',
    };
    axiosBaseQueryUtil.callbackfn = (data) => {
      if (data && data.ec === 0) {
        if (data?.dt) {
          if (isEditMode) {
            dispatch(updateAddressList({ _id: addressId, ...formValues }));
          } else {
            dispatch(setAddressList(data.dt)); // Thêm địa chỉ mới vào store
          }
        }
        setShowOffCanvas(false);
      }
    };

    if (isEditMode) {
      updateAddress(payload);
    } else {
      addAddress(payload);
    }
  });

  const isSaving = isCreating || isUpdating;
  const isDefault = watch('isDefault');
  const provinceValue = watch('province');
  const districtValue = watch('district');

  const handleProvinceChange = (selectedOption, onChange) => {
    onChange(selectedOption?.value || '');
    setProvinceCode(selectedOption?.provinceCode || null);
    setDistrictCode(null);
    setValue('district', '');
    setValue('ward', '');
  };

  const handleDistrictChange = (selectedOption, onChange) => {
    onChange(selectedOption?.value || '');
    setDistrictCode(selectedOption?.districtCode || null);
    setValue('ward', '');
  };

  useEffect(() => {
    if (!provinceValue) return;
    const matchedProvince = provincesOptions.find((option) => option.value === provinceValue);
    if (matchedProvince?.provinceCode && matchedProvince.provinceCode !== provinceCode) {
      setProvinceCode(matchedProvince.provinceCode);
    }
  }, [provinceValue, provincesOptions, provinceCode]);

  useEffect(() => {
    if (!districtValue) return;
    const matchedDistrict = districtsOptions.find((option) => option.value === districtValue);
    if (matchedDistrict?.districtCode && matchedDistrict.districtCode !== districtCode) {
      setDistrictCode(matchedDistrict.districtCode);
    }
  }, [districtValue, districtsOptions, districtCode]);

  return (
    <Form onSubmit={onSubmit} className="offcanvas-form">
      <Row className="g-2">
        <Col sm={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="addressReceiver">Người nhận</Form.Label>
            <Form.Control
              id="addressReceiver"
              isInvalid={!!errors.receiver}
              {...register('receiver')}
            />
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.receiver && errors.receiver.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="addressPhone">Số điện thoại</Form.Label>
            <Form.Control
              id="addressPhone"
              isInvalid={!!errors.phone}
              {...register('phone')}
            />
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.phone && errors.phone.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-2">
        <Col sm={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="addressCountry">Quốc gia</Form.Label>
            <Form.Control
              id="addressCountry"
              isInvalid={!!errors.country}
              {...register('country')}
            />
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.country && errors.country.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="addressProvince">Tỉnh/Thành phố</Form.Label>
            <Controller
              control={control}
              name="province"
              render={({ field: { value, onChange, ref } }) => (
                <Select
                  classNamePrefix="tps"
                  placeholder="Chọn tỉnh/thành phố"
                  isLoading={provincesLoading}
                  options={provincesOptions}
                  value={provincesOptions.find((option) => option.value === value) || null}
                  onChange={(selectedOption) => handleProvinceChange(selectedOption, onChange)}
                  inputRef={ref}
                  inputId="addressProvince"
                  styles={selectControlStyles(!!errors.province)}
                />
              )}
            />
            <Form.Control hidden id="addressProvince" isInvalid={!!errors.province} />
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.province && errors.province.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-2">
        <Col sm={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="addressDistrict">Quận/Huyện</Form.Label>
            <Controller
              control={control}
              name="district"
              render={({ field: { onChange, value, ref } }) => (
                <Select
                  classNamePrefix="tps"
                  placeholder="Chọn quận/huyện"
                  isLoading={districtsLoading}
                  options={districtsOptions}
                  value={districtsOptions.find((option) => option.value === value) || null}
                  onChange={(selectedOption) => handleDistrictChange(selectedOption, onChange)}
                  inputRef={ref}
                  isDisabled={!provinceCode}
                  inputId="addressDistrict"
                  styles={selectControlStyles(!!errors.district)}
                />
              )}
            />
            <Form.Control hidden id="addressDistrict" isInvalid={!!errors.district} />
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.district && errors.district.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="addressWard">Phường/Xã</Form.Label>
            <Controller
              control={control}
              name="ward"
              render={({ field: { value, onChange, ref } }) => (
                <Select
                  classNamePrefix="tps"
                  placeholder="Chọn phường/xã"
                  isLoading={wardsLoading}
                  options={wardsOptions}
                  value={wardsOptions.find((option) => option.value === value) || null}
                  onChange={(selectedOption) => onChange(selectedOption?.value || '')}
                  inputRef={ref}
                  isDisabled={!districtCode}
                  inputId="addressWard"
                  styles={selectControlStyles(!!errors.ward)}
                />
              )}
            />
            <Form.Control hidden id="addressWard" isInvalid={!!errors.ward} />
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.ward && errors.ward.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>


      <Form.Group className="mb-3">
        <Form.Label htmlFor="addressStreet">Số nhà, tên đường</Form.Label>
        <Form.Control
          id="addressStreet"
          isInvalid={!!errors.street}
          {...register('street')}
        />
        <Form.Control.Feedback type="invalid" className="d-block">
          {errors.street && errors.street.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Row className="g-2">
        <Col sm={6}>
          <Form.Group className="mb-4">
            <Form.Label htmlFor="addressPostalCode">Mã bưu chính</Form.Label>
            <Form.Control
              id="addressPostalCode"
              isInvalid={!!errors.postalCode}
              {...register('postalCode')}
            />
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.postalCode && errors.postalCode.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col sm={12} className="d-flex align-items-center">
          <Form.Check
            type="switch"
            id="addressDefault"
            label="Đặt làm địa chỉ mặc định"
            {...register('isDefault')}
            checked={!!isDefault}
            onChange={(event) => setValue('isDefault', event.target.checked)}
            className="mb-4"
          />
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="outline-secondary" type="button" onClick={() => setShowOffCanvas(false)}>
          Hủy
        </Button>
        <Button variant="primary" type="submit" disabled={isSaving}>
          {isSaving ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Lưu địa chỉ'}
        </Button>
      </div>
    </Form>
  );
};

export default AddressForm;
