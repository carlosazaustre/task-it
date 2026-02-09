import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  role: z.string().max(50).optional(),
  language: z.enum(['es', 'en']).optional(),
})

export const updateSettingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).optional(),
  pomodoro: z.object({
    focusMinutes: z.number().min(1).max(120).optional(),
    shortBreakMinutes: z.number().min(1).max(30).optional(),
    longBreakMinutes: z.number().min(1).max(60).optional(),
    longBreakInterval: z.number().min(1).max(10).optional(),
    totalDurationMinutes: z.number().min(1).max(480).optional(),
    autoStartNext: z.boolean().optional(),
    soundEnabled: z.boolean().optional(),
  }).optional(),
  notifications: z.object({
    taskReminders: z.boolean().optional(),
    dailySummary: z.boolean().optional(),
    streakAlert: z.boolean().optional(),
  }).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
