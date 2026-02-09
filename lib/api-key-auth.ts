import { prisma } from '@/lib/prisma'

export async function authenticateApiKey(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer tk_')) {
    return null
  }

  const key = authHeader.replace('Bearer ', '')

  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: { select: { id: true, email: true, name: true } } },
  })

  if (!apiKey) return null

  // Update lastUsed (fire and forget)
  prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  }).catch(() => {})

  return apiKey.user
}
