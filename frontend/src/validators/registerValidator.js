import { z } from 'zod';

const registerSchema = z.object({
  fullname: z
    .string()
    .min(1, 'Vui lòng nhập họ và tên')
    .max(50, 'Họ và tên không được vượt quá 50 ký tự'),
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Email không hợp lệ'),
  password: z
    .string(),
    // thêm các quy tắc phức tạp hơn nếu cần
  confirmPassword: z
    .string()
}).superRefine(({ password, confirmPassword }, ctx) => {
  if ((confirmPassword !== '') && (password !== confirmPassword)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "Mật khẩu không khớp",
    });
  }
});

export default registerSchema;

