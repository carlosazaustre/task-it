import { z } from 'zod'

export const createTagSchema = z.object({
  name: z.string().min(1).max(30),
  color: z.string().min(1).max(20),
})

export const updateTagSchema = createTagSchema.partial()

export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
