import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockUser, createMockApiKey } from '../helpers/db'

// ---- Mocks ----

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  apiKey: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

// Mock bcryptjs
const mockBcrypt = {
  hash: vi.fn().mockResolvedValue('$2a$12$hashedpassword'),
}
vi.mock('bcryptjs', () => ({
  default: {
    hash: (...args: unknown[]) => mockBcrypt.hash(...args),
  },
}))

// Mock auth module (for authenticateApiKey which imports auth indirectly)
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/lib/generated/prisma/client', () => ({}))

// Mock rate limiter so it never blocks in tests
vi.mock('@/lib/rate-limit', () => ({
  registerLimiter: vi.fn().mockReturnValue({ success: true }),
  loginLimiter: vi.fn().mockReturnValue({ success: true }),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
}))

// ---- Helpers ----

function makeRequest(url: string, init?: RequestInit): Request {
  return new Request(new URL(url, 'http://localhost:3000'), {
    headers: {
      'Content-Type': 'application/json',
    },
    ...init,
  })
}

// ---- Tests: Registration ----

describe('Auth API – POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a new user with valid data', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null) // No existing user
    mockPrisma.user.create.mockResolvedValue({
      id: 'new-user-id',
      email: 'newuser@example.com',
      name: 'New User',
    })

    const { POST } = await import('@/app/api/auth/register/route')
    const request = makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'securepassword123',
        confirmPassword: 'securepassword123',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.email).toBe('newuser@example.com')
    expect(body.name).toBe('New User')
    expect(body.id).toBeDefined()
  })

  it('hashes the password before storing', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({
      id: 'new-user-id',
      email: 'newuser@example.com',
      name: 'New User',
    })

    const { POST } = await import('@/app/api/auth/register/route')
    const request = makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'securepassword123',
        confirmPassword: 'securepassword123',
      }),
    })
    await POST(request)

    expect(mockBcrypt.hash).toHaveBeenCalledWith('securepassword123', 12)
    const createData = mockPrisma.user.create.mock.calls[0][0].data
    expect(createData.password).toBe('$2a$12$hashedpassword')
  })

  it('creates default tags and settings for new user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({
      id: 'new-user-id',
      email: 'newuser@example.com',
      name: 'New User',
    })

    const { POST } = await import('@/app/api/auth/register/route')
    const request = makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'securepassword123',
        confirmPassword: 'securepassword123',
      }),
    })
    await POST(request)

    const createArgs = mockPrisma.user.create.mock.calls[0][0]
    // Should create default tags
    expect(createArgs.data.tags.create).toBeDefined()
    expect(createArgs.data.tags.create).toHaveLength(5)
    // Should create default settings
    expect(createArgs.data.settings.create).toBeDefined()
  })

  it('rejects registration with duplicate email (409)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(createMockUser()) // User already exists

    const { POST } = await import('@/app/api/auth/register/route')
    const request = makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate User',
        email: 'test@example.com',
        password: 'securepassword123',
        confirmPassword: 'securepassword123',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.error).toContain('email')
    expect(mockPrisma.user.create).not.toHaveBeenCalled()
  })

  it('rejects registration with invalid email (400)', async () => {
    const { POST } = await import('@/app/api/auth/register/route')
    const request = makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Bad Email User',
        email: 'notanemail',
        password: 'securepassword123',
        confirmPassword: 'securepassword123',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('rejects registration with short password (400)', async () => {
    const { POST } = await import('@/app/api/auth/register/route')
    const request = makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Short Pass User',
        email: 'shortpass@example.com',
        password: 'short',
        confirmPassword: 'short',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('rejects registration when passwords do not match (400)', async () => {
    const { POST } = await import('@/app/api/auth/register/route')
    const request = makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Mismatch User',
        email: 'mismatch@example.com',
        password: 'securepassword123',
        confirmPassword: 'differentpassword123',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('rejects registration with short name (400)', async () => {
    const { POST } = await import('@/app/api/auth/register/route')
    const request = makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'A',
        email: 'shortname@example.com',
        password: 'securepassword123',
        confirmPassword: 'securepassword123',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })
})

// ---- Tests: API Key Authentication ----

describe('API Key Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('authenticates with a valid API key', async () => {
    const mockApiKey = createMockApiKey()
    mockPrisma.apiKey.findUnique.mockResolvedValue(mockApiKey)
    mockPrisma.apiKey.update.mockResolvedValue(mockApiKey) // lastUsed update

    const { authenticateApiKey } = await import('@/lib/api-key-auth')
    const request = new Request('http://localhost:3000/api/v1/tasks', {
      headers: {
        Authorization: `Bearer ${mockApiKey.key}`,
      },
    })

    const result = await authenticateApiKey(request)

    expect(result).not.toBeNull()
    expect(result?.id).toBe('user-1')
    expect(result?.email).toBe('test@example.com')
  })

  it('returns null for missing Authorization header', async () => {
    const { authenticateApiKey } = await import('@/lib/api-key-auth')
    const request = new Request('http://localhost:3000/api/v1/tasks')

    const result = await authenticateApiKey(request)

    expect(result).toBeNull()
  })

  it('returns null for non-API-key Bearer token', async () => {
    const { authenticateApiKey } = await import('@/lib/api-key-auth')
    const request = new Request('http://localhost:3000/api/v1/tasks', {
      headers: {
        Authorization: 'Bearer jwt_token_here',
      },
    })

    const result = await authenticateApiKey(request)

    expect(result).toBeNull()
  })

  it('returns null for invalid API key', async () => {
    mockPrisma.apiKey.findUnique.mockResolvedValue(null)

    const { authenticateApiKey } = await import('@/lib/api-key-auth')
    const request = new Request('http://localhost:3000/api/v1/tasks', {
      headers: {
        Authorization: 'Bearer tk_invalid_key_123',
      },
    })

    const result = await authenticateApiKey(request)

    expect(result).toBeNull()
  })

  it('updates lastUsed timestamp on valid API key', async () => {
    const mockApiKey = createMockApiKey()
    mockPrisma.apiKey.findUnique.mockResolvedValue(mockApiKey)
    mockPrisma.apiKey.update.mockResolvedValue(mockApiKey)

    const { authenticateApiKey } = await import('@/lib/api-key-auth')
    const request = new Request('http://localhost:3000/api/v1/tasks', {
      headers: {
        Authorization: `Bearer ${mockApiKey.key}`,
      },
    })

    await authenticateApiKey(request)

    expect(mockPrisma.apiKey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockApiKey.id },
        data: expect.objectContaining({ lastUsed: expect.any(Date) }),
      })
    )
  })
})
