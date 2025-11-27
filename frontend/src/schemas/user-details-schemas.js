import { z } from 'zod';

export const userDetailsSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên người dùng'),
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  gender: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.enum(['Nam', 'Nữ', 'Khác']).optional()
  ),
  points: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? 0 : Number(val)),
    z.number().min(0, 'Điểm không được âm')
  ),
  isActive: z.boolean().optional(),
  isManager: z.boolean().optional(),
  is_banned: z.boolean().optional(),
  banned_reason: z.string().optional(),
});

export default userDetailsSchema;
