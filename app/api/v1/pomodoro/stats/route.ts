import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess } from '@/lib/api-utils'

function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  // Monday as start of week
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  // Build where clause for all-time stats (with optional date range)
  const where: Record<string, unknown> = { userId: user.id }
  if (from || to) {
    const startedAt: Record<string, Date> = {}
    if (from) startedAt.gte = new Date(from)
    if (to) startedAt.lte = new Date(to)
    where.startedAt = startedAt
  }

  // Build where clause for this week's stats
  const startOfWeek = getStartOfWeek(new Date())
  const weekWhere = {
    userId: user.id,
    startedAt: { gte: startOfWeek },
  }

  const [allTimeAgg, weekAgg] = await Promise.all([
    prisma.pomodoroSession.aggregate({
      where,
      _count: { id: true },
      _sum: { focusMinutes: true },
    }),
    prisma.pomodoroSession.aggregate({
      where: weekWhere,
      _count: { id: true },
      _sum: { focusMinutes: true },
    }),
  ])

  const totalSessions = allTimeAgg._count.id
  const totalFocusMinutes = allTimeAgg._sum.focusMinutes ?? 0
  const totalFocusHours = Math.round((totalFocusMinutes / 60) * 100) / 100
  const averageFocusMinutesPerSession = totalSessions > 0
    ? Math.round((totalFocusMinutes / totalSessions) * 100) / 100
    : 0

  const sessionsThisWeek = weekAgg._count.id
  const focusMinutesThisWeek = weekAgg._sum.focusMinutes ?? 0
  const focusHoursThisWeek = Math.round((focusMinutesThisWeek / 60) * 100) / 100

  return apiSuccess({
    totalSessions,
    totalFocusMinutes,
    totalFocusHours,
    averageFocusMinutesPerSession,
    sessionsThisWeek,
    focusHoursThisWeek,
  })
}
