import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess, apiError } from '@/lib/api-utils'
import { taskToApi, statusToPrisma, priorityToPrisma } from '@/lib/api-mappers'
import { updateTaskSchema } from '@/lib/validations/task'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const { id } = await params

  const task = await prisma.task.findFirst({
    where: { id, userId: user.id },
    include: { tags: true },
  })

  if (!task) return apiError('Tarea no encontrada', 404)

  return apiSuccess(taskToApi(task))
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const { id } = await params

  // Verify task exists and belongs to user
  const existing = await prisma.task.findFirst({
    where: { id, userId: user.id },
  })

  if (!existing) return apiError('Tarea no encontrada', 404)

  const body = await request.json()
  const parsed = updateTaskSchema.safeParse(body)

  if (!parsed.success) {
    return apiError('Datos inválidos', 400, parsed.error.flatten())
  }

  const { tagIds, status, priority, dueDate, ...rest } = parsed.data

  // Build update data
  const updateData: any = { ...rest }
  if (status) updateData.status = statusToPrisma[status]
  if (priority) updateData.priority = priorityToPrisma[priority]
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null

  // If tagIds provided, verify and set
  if (tagIds) {
    if (tagIds.length > 0) {
      const validTags = await prisma.tag.findMany({
        where: { id: { in: tagIds }, userId: user.id },
      })
      if (validTags.length !== tagIds.length) {
        return apiError('Uno o más tags no son válidos', 400)
      }
    }
    updateData.tags = { set: tagIds.map(id => ({ id })) }
  }

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: { tags: true },
  })

  return apiSuccess(taskToApi(task))
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const { id } = await params

  const existing = await prisma.task.findFirst({
    where: { id, userId: user.id },
  })

  if (!existing) return apiError('Tarea no encontrada', 404)

  await prisma.task.delete({ where: { id } })

  return new Response(null, { status: 204 })
}
