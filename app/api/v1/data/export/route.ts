import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess, apiError } from '@/lib/api-utils'

export async function GET() {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  try {
    const [tasks, tags, settings, pomodoroSessions] = await Promise.all([
      prisma.task.findMany({
        where: { userId: user.id },
        include: { tags: { select: { id: true, name: true, color: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.tag.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.userSettings.findUnique({
        where: { userId: user.id },
      }),
      prisma.pomodoroSession.findMany({
        where: { userId: user.id },
        orderBy: { startedAt: 'asc' },
      }),
    ])

    return apiSuccess({
      exportedAt: new Date().toISOString(),
      tasks: tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate?.toISOString() ?? null,
        tags: task.tags.map(t => ({ id: t.id, name: t.name, color: t.color })),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      })),
      tags: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.createdAt.toISOString(),
      })),
      settings: settings ? {
        theme: settings.theme,
        pomodoroFocusMin: settings.pomodoroFocusMin,
        pomodoroShortBreak: settings.pomodoroShortBreak,
        pomodoroLongBreak: settings.pomodoroLongBreak,
        pomodoroLongInterval: settings.pomodoroLongInterval,
        pomodoroTotalMin: settings.pomodoroTotalMin,
        pomodoroAutoStart: settings.pomodoroAutoStart,
        pomodoroSoundEnabled: settings.pomodoroSoundEnabled,
        taskReminders: settings.taskReminders,
        dailySummary: settings.dailySummary,
        streakAlert: settings.streakAlert,
      } : null,
      pomodoroSessions: pomodoroSessions.map(session => ({
        id: session.id,
        startedAt: session.startedAt.toISOString(),
        completedAt: session.completedAt?.toISOString() ?? null,
        totalMinutes: session.totalMinutes,
        focusMinutes: session.focusMinutes,
        sessionsPlanned: session.sessionsPlanned,
        sessionsCompleted: session.sessionsCompleted,
        taskIds: session.taskIds,
      })),
    })
  } catch {
    return apiError('Error interno del servidor', 500)
  }
}
