import { z } from 'zod';

export const vendorSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().max(10, 'Phone must be 10 digits'),
    zipcode: z.string(),
    address: z.string(),
});

export type VendorFormData = z.infer<typeof vendorSchema>;