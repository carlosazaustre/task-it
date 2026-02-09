import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).default(''),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  dueDate: z.string().datetime().nullable().default(null),
  tagIds: z.array(z.string()).default([]),
})

export const updateTaskSchema = createTaskSchema.partial()

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
