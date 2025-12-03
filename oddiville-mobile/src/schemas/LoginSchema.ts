import { z } from 'zod';

const allowedDomains = ['gmail.com', 'hotmail.com', 'oddiville.com'];

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .refine((email) => {
      const domain = email.split('@')[1];
      return allowedDomains.includes(domain);
    }, {
      message: `Email must be from: ${allowedDomains.join(', ')}`,
    }),
  userpass: z.string().min(1, { message: "Password is required" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export default loginSchema;
