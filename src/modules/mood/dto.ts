import { z } from 'zod';

export const createMoodSchema = z.object({
  moodLevel: z.number().int().min(0).max(5),
  eventLabel: z.string().max(200).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  photoUrl: z.string().url().optional(),
});

export const updateMoodSchema = z.object({
  moodLevel: z.number().int().min(0).max(5).optional(),
  eventLabel: z.string().max(200).optional(),
});

export const moodListQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CreateMoodRequest = z.infer<typeof createMoodSchema>;
export type UpdateMoodRequest = z.infer<typeof updateMoodSchema>;
export type MoodListQuery = z.infer<typeof moodListQuerySchema>;
