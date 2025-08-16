import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  photoUrl: z.string().url().optional(),
}).transform((data) => ({
  ...data,
  birthDate: data.birthDate || data.birth_date,
}));

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
