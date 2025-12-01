import { z } from 'zod';

const registerSchema = z.object({
  username: z
    .string()
    .min(1, 'Vui lòng nhập họ và tên')
    .max(50, 'Họ và tên không được vượt quá 50 ký tự'),
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ'),
  Addresses: z.object({
    receiver: z.string().min(1, 'Vui lòng nhập tên người nhận'),
    phone: z.string().regex(/^[0-9]{10}$/, 'Số điện thoại không hợp lệ'),
    country: z.string().min(1, 'Vui lòng nhập tên quốc gia').default('Việt Nam'),
    province: z.string().min(1, 'Vui lòng nhập tên tỉnh/thành phố'),
    district: z.string().min(1, 'Vui lòng nhập tên quận/huyện'),
    ward: z.string().min(1, 'Vui lòng nhập tên phường/xã'),
    street: z.string().min(1, 'Vui lòng nhập tên đường'),
    postalCode: z.string().min(1, 'Vui lòng nhập mã bưu chính'),
    isDefault: z.boolean().default(true),
  })
});

export default registerSchema;