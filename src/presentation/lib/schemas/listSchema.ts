import { z } from 'zod';

export const createListSchema = z.object({
  name: z.string().min(1, 'Nome da lista é obrigatório').max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

export const updateListSchema = z.object({
  name: z.string().min(1, 'Nome da lista é obrigatório').max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});

export const addPlaceToListSchema = z.object({
  placeId: z.string().uuid(),
  note: z.string().max(500).optional(),
});

export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type AddPlaceToListInput = z.infer<typeof addPlaceToListSchema>;
