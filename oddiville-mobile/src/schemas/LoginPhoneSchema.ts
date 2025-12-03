import { z } from 'zod';

const otpSchema = z.array(z.string()?.length(1).regex(/^\d$/, 'Only digits are allowed'))?.length(4, 'OTP must be 4 digits');

export const loginPhoneSchema = z.object({
  userphone: z
    .string()
    .min(10, "Phone number must be 10 digits")
    .max(10, "Phone number must be 10 digits")
    .regex(/^\d+$/, "Only digits allowed"),
    otp: otpSchema,
});

export type LoginPhoneFormData = z.infer<typeof loginPhoneSchema>;
export default loginPhoneSchema