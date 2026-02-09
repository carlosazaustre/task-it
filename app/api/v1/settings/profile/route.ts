import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess, apiError } from '@/lib/api-utils'
import { updateProfileSchema } from '@/lib/validations/settings'

function computeInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0].toUpperCase())
    .slice(0, 2)
    .join('')
}

export async function GET() {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      language: true,
    },
  })

  if (!dbUser) {
    return apiError('Usuario no encontrado', 404)
  }

  return apiSuccess({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    language: dbUser.language,
    initials: computeInitials(dbUser.name),
  })
}

export async function PATCH(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  try {
    const body = await request.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return apiError('Datos inválidos', 400, parsed.error.flatten())
    }

    const { name, role, language } = parsed.data

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(language !== undefined && { language }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        language: true,
      },
    })

    return apiSuccess({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      language: updatedUser.language,
      initials: computeInitials(updatedUser.name),
    })
  } catch {
    return apiError('Error interno del servidor', 500)
  }
}
