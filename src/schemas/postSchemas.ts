import { z } from 'zod';

export const postAddSchema = z.object({
    title: z.string().min(3).max(255),
    content: z.string().min(3),
})