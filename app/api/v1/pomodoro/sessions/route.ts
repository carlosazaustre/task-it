import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess, apiError } from '@/lib/api-utils'
import { createPomodoroSessionSchema } from '@/lib/validations/pomodoro'

function sessionToApi(session: {
  id: string
  startedAt: Date
  completedAt: Date | null
  totalMinutes: number
  focusMinutes: number
  sessionsPlanned: number
  sessionsCompleted: number
  taskIds: string[]
}) {
  return {
    id: session.id,
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    totalMinutes: session.totalMinutes,
    focusMinutes: session.focusMinutes,
    sessionsPlanned: session.sessionsPlanned,
    sessionsCompleted: session.sessionsCompleted,
    taskIds: session.taskIds,
  }
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  try {
    const body = await request.json()
    const parsed = createPomodoroSessionSchema.safeParse(body)

    if (!parsed.success) {
      return apiError('Datos inválidos', 400, parsed.error.flatten())
    }

    const { startedAt, completedAt, totalMinutes, focusMinutes, sessionsPlanned, sessionsCompleted, taskIds } = parsed.data

    // Verify taskIds belong to user if provided
    if (taskIds.length > 0) {
      const validTasks = await prisma.task.findMany({
        where: { id: { in: taskIds }, userId: user.id },
        select: { id: true },
      })
      if (validTasks.length !== taskIds.length) {
        return apiError('Una o más tareas no son válidas', 400)
      }
    }

    const session = await prisma.pomodoroSession.create({
      data: {
        startedAt: new Date(startedAt),
        completedAt: completedAt ? new Date(completedAt) : null,
        totalMinutes,
        focusMinutes,
        sessionsPlanned,
        sessionsCompleted,
        taskIds,
        userId: user.id,
      },
    })

    return apiSuccess(sessionToApi(session), 201)
  } catch {
    return apiError('Error interno del servidor', 500)
  }
}

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50))

  const where: Record<string, unknown> = { userId: user.id }

  if (from || to) {
    const startedAt: Record<string, Date> = {}
    if (from) startedAt.gte = new Date(from)
    if (to) startedAt.lte = new Date(to)
    where.startedAt = startedAt
  }

  const sessions = await prisma.pomodoroSession.findMany({
    where,
    orderBy: { startedAt: 'desc' },
    take: limit,
  })

  return apiSuccess(sessions.map(sessionToApi))
}
