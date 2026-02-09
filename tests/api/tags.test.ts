import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createMockTag } from '../helpers/db'

// ---- Mocks ----

const mockPrisma = {
  tag: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

// ---- Tests ----

describe('Tags API – GET /api/v1/tags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('returns 401 when not authenticated', async () => {
    unauthenticate()

    const { GET } = await import('@/app/api/v1/tags/route')
    const response = await GET()

    expect(response.status).toBe(401)
  })

  it('returns all tags for authenticated user', async () => {
    const mockTags = [
      createMockTag({ id: 'tag-1', name: 'Work' }),
      createMockTag({ id: 'tag-2', name: 'Personal', color: 'green' }),
    ]
    mockPrisma.tag.findMany.mockResolvedValue(mockTags)

    const { GET } = await import('@/app/api/v1/tags/route')
    const response = await GET()

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toHaveLength(2)
    expect(body.data[0].name).toBe('Work')
    expect(body.data[1].name).toBe('Personal')
  })

  it('scopes tags to current user', async () => {
    mockPrisma.tag.findMany.mockResolvedValue([])

    const { GET } = await import('@/app/api/v1/tags/route')
    await GET()

    const findArgs = mockPrisma.tag.findMany.mock.calls[0][0]
    expect(findArgs.where.userId).toBe('user-1')
  })
})

describe('Tags API – POST /api/v1/tags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('returns 401 when not authenticated', async () => {
    unauthenticate()

    const { POST } = await import('@/app/api/v1/tags/route')
    const request = makeRequest('/api/v1/tags', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Tag', color: 'blue' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('creates a tag with valid data', async () => {
    const createdTag = createMockTag({ id: 'tag-new', name: 'Project', color: 'purple' })
    mockPrisma.tag.findFirst.mockResolvedValue(null) // No duplicate
    mockPrisma.tag.create.mockResolvedValue(createdTag)

    const { POST } = await import('@/app/api/v1/tags/route')
    const request = makeRequest('/api/v1/tags', {
      method: 'POST',
      body: JSON.stringify({ name: 'Project', color: 'purple' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.name).toBe('Project')
    expect(body.data.color).toBe('purple')
  })

  it('returns 400 for invalid data (empty name)', async () => {
    const { POST } = await import('@/app/api/v1/tags/route')
    const request = makeRequest('/api/v1/tags', {
      method: 'POST',
      body: JSON.stringify({ name: '', color: 'blue' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })

  it('returns 409 when tag name already exists for user', async () => {
    mockPrisma.tag.findFirst.mockResolvedValue(createMockTag({ name: 'Work' }))

    const { POST } = await import('@/app/api/v1/tags/route')
    const request = makeRequest('/api/v1/tags', {
      method: 'POST',
      body: JSON.stringify({ name: 'Work', color: 'blue' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.error).toContain('tag')
  })

  it('sets userId from authenticated user', async () => {
    mockPrisma.tag.findFirst.mockResolvedValue(null)
    mockPrisma.tag.create.mockResolvedValue(createMockTag({ id: 'tag-new' }))

    const { POST } = await import('@/app/api/v1/tags/route')
    const request = makeRequest('/api/v1/tags', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', color: 'red' }),
    })
    await POST(request)

    const createData = mockPrisma.tag.create.mock.calls[0][0].data
    expect(createData.userId).toBe('user-1')
  })
})

describe('Tags API – GET /api/v1/tags/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('returns a tag by ID', async () => {
    mockPrisma.tag.findFirst.mockResolvedValue(createMockTag({ id: 'tag-1', name: 'Work' }))

    const { GET } = await import('@/app/api/v1/tags/[id]/route')
    const request = makeRequest('/api/v1/tags/tag-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'tag-1' }) })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.id).toBe('tag-1')
  })

  it('returns 404 when tag does not exist', async () => {
    mockPrisma.tag.findFirst.mockResolvedValue(null)

    const { GET } = await import('@/app/api/v1/tags/[id]/route')
    const request = makeRequest('/api/v1/tags/nonexistent')
    const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })
})

describe('Tags API – PATCH /api/v1/tags/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('updates a tag with valid data', async () => {
    const existingTag = createMockTag({ id: 'tag-1', name: 'Work' })
    const updatedTag = createMockTag({ id: 'tag-1', name: 'Updated Work', color: 'red' })

    mockPrisma.tag.findFirst
      .mockResolvedValueOnce(existingTag) // First call: find by id + userId
      .mockResolvedValueOnce(null)        // Second call: duplicate name check
    mockPrisma.tag.update.mockResolvedValue(updatedTag)

    const { PATCH } = await import('@/app/api/v1/tags/[id]/route')
    const request = makeRequest('/api/v1/tags/tag-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated Work', color: 'red' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'tag-1' }) })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.name).toBe('Updated Work')
  })

  it('returns 404 when tag does not exist', async () => {
    mockPrisma.tag.findFirst.mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/v1/tags/[id]/route')
    const request = makeRequest('/api/v1/tags/nonexistent', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Updated' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('returns 409 when renaming to an existing tag name', async () => {
    const existingTag = createMockTag({ id: 'tag-1', name: 'Work' })
    mockPrisma.tag.findFirst
      .mockResolvedValueOnce(existingTag) // First call: find existing tag
      .mockResolvedValueOnce(createMockTag({ id: 'tag-2', name: 'Personal' })) // Second call: duplicate check

    const { PATCH } = await import('@/app/api/v1/tags/[id]/route')
    const request = makeRequest('/api/v1/tags/tag-1', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Personal' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'tag-1' }) })

    expect(response.status).toBe(409)
  })
})

describe('Tags API – DELETE /api/v1/tags/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('deletes a tag and returns 204', async () => {
    const existingTag = createMockTag({ id: 'tag-1' })
    mockPrisma.tag.findFirst.mockResolvedValue(existingTag)
    mockPrisma.tag.update.mockResolvedValue(existingTag)
    mockPrisma.tag.delete.mockResolvedValue(existingTag)

    const { DELETE } = await import('@/app/api/v1/tags/[id]/route')
    const request = makeRequest('/api/v1/tags/tag-1', { method: 'DELETE' })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'tag-1' }) })

    expect(response.status).toBe(204)
  })

  it('returns 404 when tag does not exist', async () => {
    mockPrisma.tag.findFirst.mockResolvedValue(null)

    const { DELETE } = await import('@/app/api/v1/tags/[id]/route')
    const request = makeRequest('/api/v1/tags/nonexistent', { method: 'DELETE' })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
    expect(mockPrisma.tag.delete).not.toHaveBeenCalled()
  })

  it('disconnects tag from tasks before deleting', async () => {
    const existingTag = createMockTag({ id: 'tag-1' })
    mockPrisma.tag.findFirst.mockResolvedValue(existingTag)
    mockPrisma.tag.update.mockResolvedValue(existingTag)
    mockPrisma.tag.delete.mockResolvedValue(existingTag)

    const { DELETE } = await import('@/app/api/v1/tags/[id]/route')
    const request = makeRequest('/api/v1/tags/tag-1', { method: 'DELETE' })
    await DELETE(request, { params: Promise.resolve({ id: 'tag-1' }) })

    // First call should be the disconnect (update with set: [])
    expect(mockPrisma.tag.update).toHaveBeenCalledWith({
      where: { id: 'tag-1' },
      data: { tasks: { set: [] } },
    })
    // Then the actual delete
    expect(mockPrisma.tag.delete).toHaveBeenCalledWith({ where: { id: 'tag-1' } })
  })
})
