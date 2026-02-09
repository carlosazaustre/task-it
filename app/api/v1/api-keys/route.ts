import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess, apiError } from '@/lib/api-utils'
import { createApiKeySchema } from '@/lib/validations/api-key'

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser(request)
  if (!user) return errorResponse

  try {
    const body = await request.json()
    const parsed = createApiKeySchema.safeParse(body)

    if (!parsed.success) {
      return apiError('Datos invalidos', 400, parsed.error.flatten())
    }

    const key = 'tk_' + randomBytes(32).toString('hex')

    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name: parsed.data.name,
        userId: user.id,
      },
    })

    return apiSuccess(
      {
        id: apiKey.id,
        name: apiKey.name,
        key, // Return the full key only once
        createdAt: apiKey.createdAt.toISOString(),
      },
      201
    )
  } catch {
    return apiError('Error interno del servidor', 500)
  }
}

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser(request)
  if (!user) return errorResponse

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      key: true,
      lastUsed: true,
      createdAt: true,
    },
  })

  const data = apiKeys.map((ak) => ({
    id: ak.id,
    name: ak.name,
    keyPreview: ak.key.slice(0, 7) + '...' + ak.key.slice(-4),
    lastUsed: ak.lastUsed?.toISOString() ?? null,
    createdAt: ak.createdAt.toISOString(),
  }))

  return apiSuccess(data)
}
