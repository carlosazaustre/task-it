import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-utils'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, errorResponse } = await getAuthUser(request)
  if (!user) return errorResponse

  const { id } = await params

  // Verify the API key belongs to the authenticated user
  const existing = await prisma.apiKey.findFirst({
    where: { id, userId: user.id },
  })

  if (!existing) return apiError('API key no encontrada', 404)

  await prisma.apiKey.delete({ where: { id } })

  return new Response(null, { status: 204 })
}
