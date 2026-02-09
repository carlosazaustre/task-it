import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess, apiError } from '@/lib/api-utils'
import { tagToApi } from '@/lib/api-mappers'
import { updateTagSchema } from '@/lib/validations/tag'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const { id } = await params

  const tag = await prisma.tag.findFirst({
    where: { id, userId: user.id },
  })

  if (!tag) return apiError('Tag no encontrado', 404)

  return apiSuccess(tagToApi(tag))
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const { id } = await params

  const existing = await prisma.tag.findFirst({
    where: { id, userId: user.id },
  })

  if (!existing) return apiError('Tag no encontrado', 404)

  const body = await request.json()
  const parsed = updateTagSchema.safeParse(body)

  if (!parsed.success) {
    return apiError('Datos inválidos', 400, parsed.error.flatten())
  }

  // If name is being changed, check uniqueness
  if (parsed.data.name && parsed.data.name !== existing.name) {
    const duplicate = await prisma.tag.findFirst({
      where: { userId: user.id, name: parsed.data.name },
    })
    if (duplicate) {
      return apiError('Ya existe un tag con ese nombre', 409)
    }
  }

  const tag = await prisma.tag.update({
    where: { id },
    data: parsed.data,
  })

  return apiSuccess(tagToApi(tag))
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const { id } = await params

  const existing = await prisma.tag.findFirst({
    where: { id, userId: user.id },
  })

  if (!existing) return apiError('Tag no encontrado', 404)

  // Disconnect tag from all tasks before deleting
  await prisma.tag.update({
    where: { id },
    data: { tasks: { set: [] } },
  })

  await prisma.tag.delete({ where: { id } })

  return new Response(null, { status: 204 })
}
