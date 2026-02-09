import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createMockSettings, createMockUser } from '../helpers/db'

// ---- Mocks ----

const mockPrisma = {
  userSettings: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockGetAuthUser = vi.fn()
vi.mock('@/lib/auth-utils', () => ({
  getAuthUser: (...args: unknown[]) => mockGetAuthUser(...args),
}))

vi.mock('@/lib/generated/prisma/client', () => ({}))

// ---- Helpers ----

function authenticateAs(user = { id: 'user-1', email: 'test@example.com', name: 'Test User' }) {
  mockGetAuthUser.mockResolvedValue({ user, errorResponse: null })
}

function unauthenticate() {
  const { NextResponse } = require('next/server')
  mockGetAuthUser.mockResolvedValue({
    user: null,
    errorResponse: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
  })
}

function makeRequest(url: string, init?: ConstructorParameters<typeof NextRequest>[1]): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), init)
}

// ---- Tests: Settings ----

describe('Settings API – GET /api/v1/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('returns 401 when not authenticated', async () => {
    unauthenticate()

    const { GET } = await import('@/app/api/v1/settings/route')
    const response = await GET()

    expect(response.status).toBe(401)
  })

  it('returns existing user settings', async () => {
    const mockSettings = createMockSettings()
    mockPrisma.userSettings.findUnique.mockResolvedValue(mockSettings)

    const { GET } = await import('@/app/api/v1/settings/route')
    const response = await GET()

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.theme).toBe('system')
    expect(body.data.pomodoro.focusMinutes).toBe(25)
    expect(body.data.pomodoro.shortBreakMinutes).toBe(5)
    expect(body.data.notifications.taskReminders).toBe(true)
  })

  it('returns default settings when none exist', async () => {
    mockPrisma.userSettings.findUnique.mockResolvedValue(null)

    const { GET } = await import('@/app/api/v1/settings/route')
    const response = await GET()

    expect(response.status).toBe(200)
    const body = await response.json()
    // Defaults from the route
    expect(body.data.theme).toBe('system')
    expect(body.data.pomodoro.focusMinutes).toBe(25)
    expect(body.data.notifications.dailySummary).toBe(false)
  })
})

describe('Settings API – PATCH /api/v1/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('returns 401 when not authenticated', async () => {
    unauthenticate()

    const { PATCH } = await import('@/app/api/v1/settings/route')
    const request = makeRequest('/api/v1/settings', {
      method: 'PATCH',
      body: JSON.stringify({ theme: 'dark' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(401)
  })

  it('updates theme setting', async () => {
    const updatedSettings = createMockSettings({ theme: 'dark' })
    mockPrisma.userSettings.upsert.mockResolvedValue(updatedSettings)

    const { PATCH } = await import('@/app/api/v1/settings/route')
    const request = makeRequest('/api/v1/settings', {
      method: 'PATCH',
      body: JSON.stringify({ theme: 'dark' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.theme).toBe('dark')
  })

  it('updates pomodoro settings', async () => {
    const updatedSettings = createMockSettings({
      pomodoroFocusMin: 30,
      pomodoroShortBreak: 10,
    })
    mockPrisma.userSettings.upsert.mockResolvedValue(updatedSettings)

    const { PATCH } = await import('@/app/api/v1/settings/route')
    const request = makeRequest('/api/v1/settings', {
      method: 'PATCH',
      body: JSON.stringify({
        pomodoro: {
          focusMinutes: 30,
          shortBreakMinutes: 10,
        },
      }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.pomodoro.focusMinutes).toBe(30)
    expect(body.data.pomodoro.shortBreakMinutes).toBe(10)
  })

  it('updates notification settings', async () => {
    const updatedSettings = createMockSettings({
      dailySummary: true,
      streakAlert: false,
    })
    mockPrisma.userSettings.upsert.mockResolvedValue(updatedSettings)

    const { PATCH } = await import('@/app/api/v1/settings/route')
    const request = makeRequest('/api/v1/settings', {
      method: 'PATCH',
      body: JSON.stringify({
        notifications: {
          dailySummary: true,
          streakAlert: false,
        },
      }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.notifications.dailySummary).toBe(true)
    expect(body.data.notifications.streakAlert).toBe(false)
  })

  it('returns 400 for invalid theme value', async () => {
    const { PATCH } = await import('@/app/api/v1/settings/route')
    const request = makeRequest('/api/v1/settings', {
      method: 'PATCH',
      body: JSON.stringify({ theme: 'invalid_theme' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(400)
  })

  it('uses upsert to create settings if they do not exist', async () => {
    const newSettings = createMockSettings({ theme: 'light' })
    mockPrisma.userSettings.upsert.mockResolvedValue(newSettings)

    const { PATCH } = await import('@/app/api/v1/settings/route')
    const request = makeRequest('/api/v1/settings', {
      method: 'PATCH',
      body: JSON.stringify({ theme: 'light' }),
    })
    await PATCH(request)

    expect(mockPrisma.userSettings.upsert).toHaveBeenCalled()
    const upsertArgs = mockPrisma.userSettings.upsert.mock.calls[0][0]
    expect(upsertArgs.where.userId).toBe('user-1')
    expect(upsertArgs.create.userId).toBe('user-1')
  })
})

// ---- Tests: Profile ----

describe('Profile API – GET /api/v1/settings/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('returns 401 when not authenticated', async () => {
    unauthenticate()

    const { GET } = await import('@/app/api/v1/settings/profile/route')
    const response = await GET()

    expect(response.status).toBe(401)
  })

  it('returns user profile data', async () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'Developer',
      language: 'es',
    }
    mockPrisma.user.findUnique.mockResolvedValue(mockUser)

    const { GET } = await import('@/app/api/v1/settings/profile/route')
    const response = await GET()

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.name).toBe('Test User')
    expect(body.data.email).toBe('test@example.com')
    expect(body.data.initials).toBe('TU')
  })

  it('returns 404 when user not found in DB', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const { GET } = await import('@/app/api/v1/settings/profile/route')
    const response = await GET()

    expect(response.status).toBe(404)
  })
})

describe('Profile API – PATCH /api/v1/settings/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('returns 401 when not authenticated', async () => {
    unauthenticate()

    const { PATCH } = await import('@/app/api/v1/settings/profile/route')
    const request = makeRequest('/api/v1/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'New Name' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(401)
  })

  it('updates user profile', async () => {
    const updatedUser = {
      id: 'user-1',
      name: 'Updated Name',
      email: 'test@example.com',
      role: 'Senior Developer',
      language: 'en',
    }
    mockPrisma.user.update.mockResolvedValue(updatedUser)

    const { PATCH } = await import('@/app/api/v1/settings/profile/route')
    const request = makeRequest('/api/v1/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'Updated Name',
        role: 'Senior Developer',
        language: 'en',
      }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.name).toBe('Updated Name')
    expect(body.data.role).toBe('Senior Developer')
    expect(body.data.initials).toBe('UN')
  })

  it('returns 400 for invalid profile data (name too short)', async () => {
    const { PATCH } = await import('@/app/api/v1/settings/profile/route')
    const request = makeRequest('/api/v1/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'A' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(400)
  })

  it('returns 400 for invalid language', async () => {
    const { PATCH } = await import('@/app/api/v1/settings/profile/route')
    const request = makeRequest('/api/v1/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify({ language: 'fr' }),
    })
    const response = await PATCH(request)

    expect(response.status).toBe(400)
  })
})
