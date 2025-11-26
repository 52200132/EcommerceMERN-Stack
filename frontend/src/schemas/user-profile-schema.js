import { z } from 'zod';

const userProfileSchema = z.object({
  username: z
    .string()
    .min(1, 'Vui lòng nhập tên đăng nhập'),
  gender: z.preprocess((val) => (val === '' ? undefined : val),
    z.enum(['Nam', 'Nữ', 'Khác']).optional()),
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ'),
  image: z
    .string()
    .optional()
});

export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z
    .string()
    .min(1, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmNewPassword: z
    .string()
    .min(1, 'Vui lòng xác nhận mật khẩu mới')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmNewPassword']
});

export const userAddressSchema = z.object({
  receiver: z.string().min(1, 'Vui lòng nhập tên người nhận'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'),
  country: z.string().min(1, 'Vui lòng nhập tên quốc gia').default('Việt Nam'),
  province: z.string().min(1, 'Vui lòng nhập tên tỉnh/thành phố'),
  district: z.string().min(1, 'Vui lòng nhập tên quận/huyện'),
  ward: z.string().min(1, 'Vui lòng nhập tên phường/xã'),
  street: z.string().min(1, 'Vui lòng nhập tên đường'),
  postalCode: z.string().min(1, 'Vui lòng nhập mã bưu chính'),
  isDefault: z.boolean().default(false)
});

export default userProfileSchema;