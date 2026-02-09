import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiSuccess, apiError } from '@/lib/api-utils'

export async function DELETE(request: NextRequest) {
  const { user, errorResponse } = await getAuthUser()
  if (!user) return errorResponse

  // Require confirmation header
  const confirmHeader = request.headers.get('X-Confirm-Delete')
  if (confirmHeader !== 'true') {
    return apiError(
      'Se requiere el header X-Confirm-Delete: true para confirmar la eliminación',
      400
    )
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.pomodoroSession.deleteMany({ where: { userId: user.id } })
      await tx.task.deleteMany({ where: { userId: user.id } })
      await tx.tag.deleteMany({ where: { userId: user.id } })
      await tx.userSettings.deleteMany({ where: { userId: user.id } })
    })

    return apiSuccess({
      message: 'Todos los datos del usuario han sido eliminados',
    })
  } catch {
    return apiError('Error interno del servidor', 500)
  }
}
