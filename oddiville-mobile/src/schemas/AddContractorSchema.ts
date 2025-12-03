import { z } from 'zod';

export const addContractorSchema = z.object({
    name: z.string().nonempty(),
    male_count: z.number().int(),
    female_count: z.number().int(),
    // work_location: z.array(
    //     z.object({
    //         name: z.string().nonempty(),
    //         count: z.number().int(),
    //     })
    // ),
});

export type ContractorData = z.infer<typeof addContractorSchema>;
export default addContractorSchema