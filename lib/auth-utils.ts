import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/api-key-auth'

type AuthUser = { id: string; email?: string | null; name?: string | null }

type AuthResult =
  | { user: AuthUser; errorResponse: null }
  | { user: null; errorResponse: NextResponse }

export async function getAuthUser(request?: Request): Promise<AuthResult> {
  // 1. Try API Key auth first (for MCP and external API)
  if (request) {
    const apiKeyUser = await authenticateApiKey(request)
    if (apiKeyUser) {
      return { user: { id: apiKeyUser.id, email: apiKeyUser.email, name: apiKeyUser.name }, errorResponse: null }
    }
  }

  // 2. Try session auth (for frontend)
  const session = await auth()
  if (session?.user?.id) {
    return { user: { id: session.user.id, email: session.user.email, name: session.user.name }, errorResponse: null }
  }

  return {
    user: null,
    errorResponse: NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    ),
  }
}
