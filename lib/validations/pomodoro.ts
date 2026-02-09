import { z } from 'zod'

export const createPomodoroSessionSchema = z.object({
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable().default(null),
  totalMinutes: z.number().min(1),
  focusMinutes: z.number().min(0),
  sessionsPlanned: z.number().min(1),
  sessionsCompleted: z.number().min(0),
  taskIds: z.array(z.string()).default([]),
})

export type CreatePomodoroSessionInput = z.infer<typeof createPomodoroSessionSchema>
