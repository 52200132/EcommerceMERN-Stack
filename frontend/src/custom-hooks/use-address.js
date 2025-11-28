import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { userAddressSchema } from '#schemas';
import {
  useDistrictsOptions,
  useProvincesOptions,
  useWardsOptions,
} from '#component-hooks/use-register-hooks';

/**
 * Address form hook with location options + zod validation.
 * Set includeCountry=false to hide country while keeping a default value in payload.
 */
export const useAddressForm = ({ defaultValues = {}, includeCountry = true } = {}) => {
  const schema = useMemo(
    () => (includeCountry ? userAddressSchema : userAddressSchema.omit({ country: true })),
    [includeCountry]
  );

  const formDefaultValues = useMemo(
    () => ({
      receiver: '',
      phone: '',
      country: 'Vietnam',
      province: '',
      district: '',
      ward: '',
      street: '',
      postalCode: '',
      isDefault: false,
      ...defaultValues,
    }),
    [defaultValues]
  );

  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'all',
    defaultValues: formDefaultValues,
  });

  const { watch, setValue } = form;
  const [provinceCode, setProvinceCode] = useState(null);
  const [districtCode, setDistrictCode] = useState(null);
  const provinceValue = watch('province');
  const districtValue = watch('district');

  const { provincesOptions, isLoading: provincesLoading } = useProvincesOptions();
  const { districtsOptions, isLoading: districtsLoading } = useDistrictsOptions(provinceCode);
  const { wardsOptions, isLoading: wardsLoading } = useWardsOptions(districtCode);

  // Sync province code when default value is set programmatically
  useEffect(() => {
    if (!provinceValue) return;
    const matchedProvince = provincesOptions.find((option) => option.value === provinceValue);
    if (matchedProvince?.provinceCode && matchedProvince.provinceCode !== provinceCode) {
      setProvinceCode(matchedProvince.provinceCode);
    }
  }, [provinceValue, provincesOptions, provinceCode]);

  // Sync district code when default value is set programmatically
  useEffect(() => {
    if (!districtValue) return;
    const matchedDistrict = districtsOptions.find((option) => option.value === districtValue);
    if (matchedDistrict?.districtCode && matchedDistrict.districtCode !== districtCode) {
      setDistrictCode(matchedDistrict.districtCode);
    }
  }, [districtValue, districtsOptions, districtCode]);

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

  return {
    ...form,
    provinceCode,
    districtCode,
    selectOptions: { provincesOptions, districtsOptions, wardsOptions },
    selectLoading: { provincesLoading, districtsLoading, wardsLoading },
    handleProvinceChange,
    handleDistrictChange,
  };
};
