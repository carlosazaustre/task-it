import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess, apiError } from '@/lib/api-utils'
import { tagToApi } from '@/lib/api-mappers'
import { createTagSchema } from '@/lib/validations/tag'

export async function GET() {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const tags = await prisma.tag.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  })

  return apiSuccess(tags.map(tagToApi))
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  try {
    const body = await request.json()
    const parsed = createTagSchema.safeParse(body)

    if (!parsed.success) {
      return apiError('Datos inválidos', 400, parsed.error.flatten())
    }

    const { name, color } = parsed.data

    // Check unique name per user
    const existing = await prisma.tag.findFirst({
      where: { userId: user.id, name },
    })

    if (existing) {
      return apiError('Ya existe un tag con ese nombre', 409)
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        color,
        userId: user.id,
      },
    })

    return apiSuccess(tagToApi(tag), 201)
  } catch {
    return apiError('Error interno del servidor', 500)
  }
}
