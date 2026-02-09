/**
 * Test auth helpers.
 *
 * Provides utilities to mock the getAuthUser function for API tests.
 * Uses vi.mock to replace the auth-utils module with controlled responses.
 */
import { vi } from 'vitest'
import { NextResponse } from 'next/server'

type AuthUser = { id: string; email?: string | null; name?: string | null }

/**
 * Create a mock that simulates an authenticated user.
 * Use this in vi.mock('@/lib/auth-utils', ...) factories.
 */
export function mockAuthenticatedUser(user: AuthUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' }) {
  return {
    getAuthUser: vi.fn().mockResolvedValue({
      user,
      errorResponse: null,
    }),
  }
}

/**
 * Create a mock that simulates an unauthenticated request.
 * Use this in vi.mock('@/lib/auth-utils', ...) factories.
 */
export function mockUnauthenticated() {
  return {
    getAuthUser: vi.fn().mockResolvedValue({
      user: null,
      errorResponse: NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      ),
    }),
  }
}

/**
 * Default authenticated user for tests.
 */
export const defaultTestUser: AuthUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
}

/**
 * A second user for isolation tests.
 */
export const otherTestUser: AuthUser = {
  id: 'user-2',
  email: 'other@example.com',
  name: 'Other User',
}
