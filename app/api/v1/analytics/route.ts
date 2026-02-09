import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess, apiError } from '@/lib/api-utils'

type RangeKey = 'this_week' | 'last_7_days' | 'this_month' | 'last_30_days'

function getDateRange(range: RangeKey): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  let start: Date
  let prevStart: Date
  let prevEnd: Date

  switch (range) {
    case 'this_week': {
      const day = now.getDay()
      const diff = day === 0 ? -6 : 1 - day // Monday as start
      start = new Date(now)
      start.setDate(now.getDate() + diff)
      start.setHours(0, 0, 0, 0)
      // Previous week
      prevEnd = new Date(start)
      prevEnd.setMilliseconds(-1)
      prevStart = new Date(prevEnd)
      prevStart.setDate(prevEnd.getDate() - 6)
      prevStart.setHours(0, 0, 0, 0)
      break
    }
    case 'last_7_days': {
      start = new Date(now)
      start.setDate(now.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      // Previous 7 days
      prevEnd = new Date(start)
      prevEnd.setMilliseconds(-1)
      prevStart = new Date(prevEnd)
      prevStart.setDate(prevEnd.getDate() - 6)
      prevStart.setHours(0, 0, 0, 0)
      break
    }
    case 'this_month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      // Previous month
      prevEnd = new Date(start)
      prevEnd.setMilliseconds(-1)
      prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1)
      break
    }
    case 'last_30_days': {
      start = new Date(now)
      start.setDate(now.getDate() - 29)
      start.setHours(0, 0, 0, 0)
      // Previous 30 days
      prevEnd = new Date(start)
      prevEnd.setMilliseconds(-1)
      prevStart = new Date(prevEnd)
      prevStart.setDate(prevEnd.getDate() - 29)
      prevStart.setHours(0, 0, 0, 0)
      break
    }
  }

  return { start, end, prevStart, prevEnd }
}

function computeTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

async function computeStreak(userId: string): Promise<number> {
  // Count consecutive days with completed tasks, going backwards from today
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  // Check up to 365 days back
  for (let i = 0; i < 365; i++) {
    const dayStart = new Date(currentDate)
    const dayEnd = new Date(currentDate)
    dayEnd.setHours(23, 59, 59, 999)

    const count = await prisma.task.count({
      where: {
        userId,
        status: 'COMPLETED',
        updatedAt: { gte: dayStart, lte: dayEnd },
      },
    })

    if (count > 0) {
      streak++
    } else {
      // If it's today and no tasks yet, don't break the streak
      if (i === 0) {
        currentDate.setDate(currentDate.getDate() - 1)
        continue
      }
      break
    }

    currentDate.setDate(currentDate.getDate() - 1)
  }

  return streak
}

const VALID_RANGES: RangeKey[] = ['this_week', 'last_7_days', 'this_month', 'last_30_days']

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const searchParams = request.nextUrl.searchParams
  const rangeParam = searchParams.get('range') || 'last_7_days'

  if (!VALID_RANGES.includes(rangeParam as RangeKey)) {
    return apiError('Rango inválido. Usar: this_week, last_7_days, this_month, last_30_days', 400)
  }

  const range = rangeParam as RangeKey
  const { start, end, prevStart, prevEnd } = getDateRange(range)

  // KPIs for current period
  const [completedCurrent, totalCurrent, focusAggCurrent] = await Promise.all([
    prisma.task.count({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        updatedAt: { gte: start, lte: end },
      },
    }),
    prisma.task.count({
      where: {
        userId: user.id,
        createdAt: { gte: start, lte: end },
      },
    }),
    prisma.pomodoroSession.aggregate({
      where: {
        userId: user.id,
        startedAt: { gte: start, lte: end },
      },
      _sum: { focusMinutes: true },
    }),
  ])

  // KPIs for previous period (for trend comparison)
  const [completedPrev, totalPrev, focusAggPrev] = await Promise.all([
    prisma.task.count({
      where: {
        userId: user.id,
        status: 'COMPLETED',
        updatedAt: { gte: prevStart, lte: prevEnd },
      },
    }),
    prisma.task.count({
      where: {
        userId: user.id,
        createdAt: { gte: prevStart, lte: prevEnd },
      },
    }),
    prisma.pomodoroSession.aggregate({
      where: {
        userId: user.id,
        startedAt: { gte: prevStart, lte: prevEnd },
      },
      _sum: { focusMinutes: true },
    }),
  ])

  const focusMinutesCurrent = focusAggCurrent._sum.focusMinutes ?? 0
  const focusMinutesPrev = focusAggPrev._sum.focusMinutes ?? 0
  const focusHoursCurrent = Math.round((focusMinutesCurrent / 60) * 100) / 100
  const focusHoursPrev = Math.round((focusMinutesPrev / 60) * 100) / 100

  const completionRateCurrent = totalCurrent > 0
    ? Math.round((completedCurrent / totalCurrent) * 100)
    : 0
  const completionRatePrev = totalPrev > 0
    ? Math.round((completedPrev / totalPrev) * 100)
    : 0

  // Streak
  const currentStreak = await computeStreak(user.id)

  // Weekly activity (last 7 days from now, regardless of range)
  const weeklyActivity = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date()
    dayStart.setDate(dayStart.getDate() - i)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)

    const [completed, pending] = await Promise.all([
      prisma.task.count({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          updatedAt: { gte: dayStart, lte: dayEnd },
        },
      }),
      prisma.task.count({
        where: {
          userId: user.id,
          status: { not: 'COMPLETED' },
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      }),
    ])

    weeklyActivity.push({
      date: dayStart.toISOString().split('T')[0],
      completed,
      pending,
    })
  }

  // Tag distribution
  const tags = await prisma.tag.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  })

  const tagDistribution = tags.map(tag => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
    count: tag._count.tasks,
  }))

  // Recent activity (last 10 task updates)
  const recentTasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    include: { tags: true },
  })

  const recentActivity = recentTasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status.toLowerCase(),
    priority: task.priority.toLowerCase(),
    tags: task.tags.map(t => ({ id: t.id, name: t.name, color: t.color })),
    updatedAt: task.updatedAt.toISOString(),
  }))

  return apiSuccess({
    kpis: {
      completedTasks: completedCurrent,
      completionRate: completionRateCurrent,
      focusHours: focusHoursCurrent,
      currentStreak,
    },
    trends: {
      completedTasks: computeTrend(completedCurrent, completedPrev),
      completionRate: computeTrend(completionRateCurrent, completionRatePrev),
      focusHours: computeTrend(focusHoursCurrent, focusHoursPrev),
    },
    weeklyActivity,
    tagDistribution,
    recentActivity,
  })
}
