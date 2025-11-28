import { z } from 'zod';

export const discountCodeSchema = z.object({
  code: z
    .string()
    .min(5, 'Mã phải đủ 5 ký tự')
    .max(5, 'Mã phải đủ 5 ký tự')
    .regex(/^[A-Z0-9]{5}$/, 'Chỉ cho phép A-Z và 0-9'),
  valueType: z.enum(['fixed', 'percent']),
  value: z
    .number({ invalid_type_error: 'Giá trị không hợp lệ' })
    .positive('Giá trị phải lớn hơn 0'),
  maxUsage: z
    .number({ invalid_type_error: 'Số lần tối đa không hợp lệ' })
    .min(0, 'Không nhỏ hơn 0')
    .max(10, 'Không lớn hơn 10'),
  minOrderValue: z
    .number({ invalid_type_error: 'Giá trị đơn tối thiểu không hợp lệ' })
    .min(0, 'Không nhỏ hơn 0'),
  isActive: z.boolean().default(true),
}).superRefine((val, ctx) => {
  if (val.valueType === 'percent' && (val.value < 1 || val.value > 100)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['value'],
      message: 'Phần trăm phải từ 1 đến 100',
    });
  }
});

export default discountCodeSchema;
