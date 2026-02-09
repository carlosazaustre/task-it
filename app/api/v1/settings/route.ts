import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess, apiError } from '@/lib/api-utils'
import { updateSettingsSchema } from '@/lib/validations/settings'

function settingsToApi(settings: {
  theme: string
  pomodoroFocusMin: number
  pomodoroShortBreak: number
  pomodoroLongBreak: number
  pomodoroLongInterval: number
  pomodoroTotalMin: number
  pomodoroAutoStart: boolean
  pomodoroSoundEnabled: boolean
  taskReminders: boolean
  dailySummary: boolean
  streakAlert: boolean
}) {
  return {
    theme: settings.theme,
    pomodoro: {
      focusMinutes: settings.pomodoroFocusMin,
      shortBreakMinutes: settings.pomodoroShortBreak,
      longBreakMinutes: settings.pomodoroLongBreak,
      longBreakInterval: settings.pomodoroLongInterval,
      totalDurationMinutes: settings.pomodoroTotalMin,
      autoStartNext: settings.pomodoroAutoStart,
      soundEnabled: settings.pomodoroSoundEnabled,
    },
    notifications: {
      taskReminders: settings.taskReminders,
      dailySummary: settings.dailySummary,
      streakAlert: settings.streakAlert,
    },
  }
}

// Default settings values (match Prisma schema defaults)
const DEFAULT_SETTINGS = {
  theme: 'system',
  pomodoroFocusMin: 25,
  pomodoroShortBreak: 5,
  pomodoroLongBreak: 15,
  pomodoroLongInterval: 4,
  pomodoroTotalMin: 240,
  pomodoroAutoStart: false,
  pomodoroSoundEnabled: true,
  taskReminders: true,
  dailySummary: false,
  streakAlert: true,
}

export async function GET() {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  })

  return apiSuccess(settingsToApi(settings ?? DEFAULT_SETTINGS))
}

export async function PATCH(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  try {
    const body = await request.json()
    const parsed = updateSettingsSchema.safeParse(body)

    if (!parsed.success) {
      return apiError('Datos inválidos', 400, parsed.error.flatten())
    }

    const { theme, pomodoro, notifications } = parsed.data

    // Map nested API structure to flat Prisma fields
    const data: Record<string, unknown> = {}

    if (theme !== undefined) data.theme = theme

    if (pomodoro) {
      if (pomodoro.focusMinutes !== undefined) data.pomodoroFocusMin = pomodoro.focusMinutes
      if (pomodoro.shortBreakMinutes !== undefined) data.pomodoroShortBreak = pomodoro.shortBreakMinutes
      if (pomodoro.longBreakMinutes !== undefined) data.pomodoroLongBreak = pomodoro.longBreakMinutes
      if (pomodoro.longBreakInterval !== undefined) data.pomodoroLongInterval = pomodoro.longBreakInterval
      if (pomodoro.totalDurationMinutes !== undefined) data.pomodoroTotalMin = pomodoro.totalDurationMinutes
      if (pomodoro.autoStartNext !== undefined) data.pomodoroAutoStart = pomodoro.autoStartNext
      if (pomodoro.soundEnabled !== undefined) data.pomodoroSoundEnabled = pomodoro.soundEnabled
    }

    if (notifications) {
      if (notifications.taskReminders !== undefined) data.taskReminders = notifications.taskReminders
      if (notifications.dailySummary !== undefined) data.dailySummary = notifications.dailySummary
      if (notifications.streakAlert !== undefined) data.streakAlert = notifications.streakAlert
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...data,
      },
      update: data,
    })

    return apiSuccess(settingsToApi(settings))
  } catch {
    return apiError('Error interno del servidor', 500)
  }
}
