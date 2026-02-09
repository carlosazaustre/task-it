import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess, apiError } from '@/lib/api-utils'
import { z } from 'zod'

const importSchema = z.object({
  tags: z.array(z.object({
    name: z.string(),
    color: z.string(),
  })).optional().default([]),
  tasks: z.array(z.object({
    title: z.string(),
    description: z.string().default(''),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
    dueDate: z.string().nullable().default(null),
    tags: z.array(z.object({
      name: z.string(),
      color: z.string(),
    })).optional().default([]),
  })).optional().default([]),
  settings: z.object({
    theme: z.string().optional(),
    pomodoroFocusMin: z.number().optional(),
    pomodoroShortBreak: z.number().optional(),
    pomodoroLongBreak: z.number().optional(),
    pomodoroLongInterval: z.number().optional(),
    pomodoroTotalMin: z.number().optional(),
    pomodoroAutoStart: z.boolean().optional(),
    pomodoroSoundEnabled: z.boolean().optional(),
    taskReminders: z.boolean().optional(),
    dailySummary: z.boolean().optional(),
    streakAlert: z.boolean().optional(),
  }).nullable().optional(),
  pomodoroSessions: z.array(z.object({
    startedAt: z.string(),
    completedAt: z.string().nullable().default(null),
    totalMinutes: z.number(),
    focusMinutes: z.number(),
    sessionsPlanned: z.number(),
    sessionsCompleted: z.number(),
    taskIds: z.array(z.string()).default([]),
  })).optional().default([]),
})

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  try {
    const body = await request.json()
    const parsed = importSchema.safeParse(body)

    if (!parsed.success) {
      return apiError('Datos de importación inválidos', 400, parsed.error.flatten())
    }

    const data = parsed.data

    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete existing user data
      await tx.pomodoroSession.deleteMany({ where: { userId: user.id } })
      await tx.task.deleteMany({ where: { userId: user.id } })
      await tx.tag.deleteMany({ where: { userId: user.id } })
      await tx.userSettings.deleteMany({ where: { userId: user.id } })

      // 2. Import tags - build a map from name to new tag id
      const tagMap = new Map<string, string>()
      for (const tag of data.tags) {
        const created = await tx.tag.create({
          data: {
            name: tag.name,
            color: tag.color,
            userId: user.id,
          },
        })
        tagMap.set(tag.name, created.id)
      }

      // 3. Import tasks with tag connections
      let tasksImported = 0
      for (const task of data.tasks) {
        const tagConnections = (task.tags ?? [])
          .map(t => tagMap.get(t.name))
          .filter((id): id is string => id !== undefined)

        await tx.task.create({
          data: {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            userId: user.id,
            tags: tagConnections.length > 0
              ? { connect: tagConnections.map(id => ({ id })) }
              : undefined,
          },
        })
        tasksImported++
      }

      // 4. Import settings
      if (data.settings) {
        await tx.userSettings.create({
          data: {
            userId: user.id,
            ...data.settings,
          },
        })
      }

      // 5. Import pomodoro sessions
      let sessionsImported = 0
      for (const session of data.pomodoroSessions) {
        await tx.pomodoroSession.create({
          data: {
            startedAt: new Date(session.startedAt),
            completedAt: session.completedAt ? new Date(session.completedAt) : null,
            totalMinutes: session.totalMinutes,
            focusMinutes: session.focusMinutes,
            sessionsPlanned: session.sessionsPlanned,
            sessionsCompleted: session.sessionsCompleted,
            taskIds: session.taskIds,
            userId: user.id,
          },
        })
        sessionsImported++
      }

      return {
        tagsImported: data.tags.length,
        tasksImported,
        settingsImported: data.settings ? true : false,
        pomodoroSessionsImported: sessionsImported,
      }
    })

    return apiSuccess({
      message: 'Datos importados correctamente',
      summary: result,
    })
  } catch {
    return apiError('Error interno del servidor', 500)
  }
}
