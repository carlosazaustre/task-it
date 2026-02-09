import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess, apiPaginated, apiError } from '@/lib/api-utils'
import { taskToApi, statusToPrisma, priorityToPrisma } from '@/lib/api-mappers'
import { createTaskSchema } from '@/lib/validations/task'
import { Prisma } from '@/lib/generated/prisma/client'

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const searchParams = request.nextUrl.searchParams
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50))
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const tags = searchParams.get('tags')
  const search = searchParams.get('search')
  const overdue = searchParams.get('overdue') === 'true'
  const sort = searchParams.get('sort') || 'createdAt'
  const order = searchParams.get('order') || 'desc'

  const tagIds = tags ? tags.split(',').filter(Boolean) : []

  // Build where clause
  const where: Prisma.TaskWhereInput = {
    userId: user.id,
    ...(status && statusToPrisma[status] && { status: statusToPrisma[status] }),
    ...(priority && priorityToPrisma[priority] && { priority: priorityToPrisma[priority] }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(overdue && {
      dueDate: { lt: new Date() },
      status: { not: 'COMPLETED' as const },
    }),
    ...(tagIds.length > 0 && { tags: { some: { id: { in: tagIds } } } }),
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: { tags: true },
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ])

  return apiPaginated(tasks.map(taskToApi), { page, limit, total })
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  try {
    const body = await request.json()
    const parsed = createTaskSchema.safeParse(body)

    if (!parsed.success) {
      return apiError('Datos inválidos', 400, parsed.error.flatten())
    }

    const { title, description, status, priority, dueDate, tagIds } = parsed.data

    // Verify tags belong to user
    if (tagIds.length > 0) {
      const validTags = await prisma.tag.findMany({
        where: { id: { in: tagIds }, userId: user.id },
      })
      if (validTags.length !== tagIds.length) {
        return apiError('Uno o más tags no son válidos', 400)
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: statusToPrisma[status] || 'PENDING',
        priority: priorityToPrisma[priority] || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: user.id,
        tags: tagIds.length > 0 ? { connect: tagIds.map(id => ({ id })) } : undefined,
      },
      include: { tags: true },
    })

    return apiSuccess(taskToApi(task), 201)
  } catch {
    return apiError('Error interno del servidor', 500)
  }
}
