import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { createMockTask, createMockTag } from '../helpers/db'

// ---- Mocks ----

// Mock Prisma
const mockPrisma = {
  task: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  tag: {
    findMany: vi.fn(),
  },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

// Mock auth – starts authenticated; individual tests override via mockGetAuthUser
const mockGetAuthUser = vi.fn()
vi.mock('@/lib/auth-utils', () => ({
  getAuthUser: (...args: unknown[]) => mockGetAuthUser(...args),
}))

// Mock generated prisma client enums
vi.mock('@/lib/generated/prisma/client', () => ({
  TaskStatus: { PENDING: 'PENDING', IN_PROGRESS: 'IN_PROGRESS', COMPLETED: 'COMPLETED' },
  TaskPriority: { HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' },
  Prisma: {},
}))

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

describe('Tasks API – GET /api/v1/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('returns 401 when not authenticated', async () => {
    unauthenticate()

    const { GET } = await import('@/app/api/v1/tasks/route')
    const request = makeRequest('/api/v1/tasks')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('No autorizado')
  })

  it('returns paginated tasks for authenticated user', async () => {
    const mockTasks = [
      createMockTask({ id: 'task-1', title: 'Task 1', tags: [] }),
      createMockTask({ id: 'task-2', title: 'Task 2', tags: [] }),
    ]

    mockPrisma.task.findMany.mockResolvedValue(mockTasks)
    mockPrisma.task.count.mockResolvedValue(2)

    const { GET } = await import('@/app/api/v1/tasks/route')
    const request = makeRequest('/api/v1/tasks?page=1&limit=10')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toHaveLength(2)
    expect(body.pagination).toBeDefined()
    expect(body.pagination.total).toBe(2)
    expect(body.pagination.page).toBe(1)
  })

  it('filters tasks by status', async () => {
    mockPrisma.task.findMany.mockResolvedValue([])
    mockPrisma.task.count.mockResolvedValue(0)

    const { GET } = await import('@/app/api/v1/tasks/route')
    const request = makeRequest('/api/v1/tasks?status=completed')
    await GET(request)

    const whereArg = mockPrisma.task.findMany.mock.calls[0][0].where
    expect(whereArg.status).toBe('COMPLETED')
    expect(whereArg.userId).toBe('user-1')
  })

  it('applies search filter', async () => {
    mockPrisma.task.findMany.mockResolvedValue([])
    mockPrisma.task.count.mockResolvedValue(0)

    const { GET } = await import('@/app/api/v1/tasks/route')
    const request = makeRequest('/api/v1/tasks?search=important')
    await GET(request)

    const whereArg = mockPrisma.task.findMany.mock.calls[0][0].where
    expect(whereArg.OR).toBeDefined()
    expect(whereArg.OR[0].title.contains).toBe('important')
  })

  it('scopes tasks to current user (user isolation)', async () => {
    mockPrisma.task.findMany.mockResolvedValue([])
    mockPrisma.task.count.mockResolvedValue(0)

    const { GET } = await import('@/app/api/v1/tasks/route')
    const request = makeRequest('/api/v1/tasks')
    await GET(request)

    const whereArg = mockPrisma.task.findMany.mock.calls[0][0].where
    expect(whereArg.userId).toBe('user-1')
  })
})

describe('Tasks API – POST /api/v1/tasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('returns 401 when not authenticated', async () => {
    unauthenticate()

    const { POST } = await import('@/app/api/v1/tasks/route')
    const request = makeRequest('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: 'New Task' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('creates a task with valid data', async () => {
    const createdTask = createMockTask({
      id: 'task-new',
      title: 'New Task',
      description: 'Description',
      tags: [],
    })
    mockPrisma.task.create.mockResolvedValue(createdTask)

    const { POST } = await import('@/app/api/v1/tasks/route')
    const request = makeRequest('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Task',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
        tagIds: [],
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.title).toBe('New Task')
  })

  it('returns 400 for invalid data (empty title)', async () => {
    const { POST } = await import('@/app/api/v1/tasks/route')
    const request = makeRequest('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: '',
        description: 'No title',
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('returns 400 when tagIds reference invalid tags', async () => {
    mockPrisma.tag.findMany.mockResolvedValue([]) // No valid tags

    const { POST } = await import('@/app/api/v1/tasks/route')
    const request = makeRequest('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Task with bad tags',
        tagIds: ['nonexistent-tag'],
      }),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toContain('tags')
  })

  it('sets userId from authenticated user', async () => {
    const createdTask = createMockTask({ id: 'task-new', tags: [] })
    mockPrisma.task.create.mockResolvedValue(createdTask)

    const { POST } = await import('@/app/api/v1/tasks/route')
    const request = makeRequest('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Task for user',
      }),
    })
    await POST(request)

    const createData = mockPrisma.task.create.mock.calls[0][0].data
    expect(createData.userId).toBe('user-1')
  })
})

describe('Tasks API – GET /api/v1/tasks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('returns 401 when not authenticated', async () => {
    unauthenticate()

    const { GET } = await import('@/app/api/v1/tasks/[id]/route')
    const request = makeRequest('/api/v1/tasks/task-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'task-1' }) })

    expect(response.status).toBe(401)
  })

  it('returns a task by ID', async () => {
    const mockTask = createMockTask({ id: 'task-1', title: 'Found Task', tags: [] })
    mockPrisma.task.findFirst.mockResolvedValue(mockTask)

    const { GET } = await import('@/app/api/v1/tasks/[id]/route')
    const request = makeRequest('/api/v1/tasks/task-1')
    const response = await GET(request, { params: Promise.resolve({ id: 'task-1' }) })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.id).toBe('task-1')
    expect(body.data.title).toBe('Found Task')
  })

  it('returns 404 when task does not exist', async () => {
    mockPrisma.task.findFirst.mockResolvedValue(null)

    const { GET } = await import('@/app/api/v1/tasks/[id]/route')
    const request = makeRequest('/api/v1/tasks/nonexistent')
    const response = await GET(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('cannot access another user\'s task (user isolation)', async () => {
    mockPrisma.task.findFirst.mockResolvedValue(null) // findFirst with userId filter returns null

    const { GET } = await import('@/app/api/v1/tasks/[id]/route')
    const request = makeRequest('/api/v1/tasks/other-user-task')
    const response = await GET(request, { params: Promise.resolve({ id: 'other-user-task' }) })

    expect(response.status).toBe(404)
    // Verify the query includes the userId filter
    const findArgs = mockPrisma.task.findFirst.mock.calls[0][0].where
    expect(findArgs.userId).toBe('user-1')
  })
})

describe('Tasks API – PATCH /api/v1/tasks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('returns 401 when not authenticated', async () => {
    unauthenticate()

    const { PATCH } = await import('@/app/api/v1/tasks/[id]/route')
    const request = makeRequest('/api/v1/tasks/task-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'task-1' }) })

    expect(response.status).toBe(401)
  })

  it('updates a task with valid data', async () => {
    const existingTask = createMockTask({ id: 'task-1' })
    const updatedTask = createMockTask({ id: 'task-1', title: 'Updated Title', tags: [] })

    mockPrisma.task.findFirst.mockResolvedValue(existingTask)
    mockPrisma.task.update.mockResolvedValue(updatedTask)

    const { PATCH } = await import('@/app/api/v1/tasks/[id]/route')
    const request = makeRequest('/api/v1/tasks/task-1', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated Title' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'task-1' }) })

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.title).toBe('Updated Title')
  })

  it('returns 404 when task does not exist', async () => {
    mockPrisma.task.findFirst.mockResolvedValue(null)

    const { PATCH } = await import('@/app/api/v1/tasks/[id]/route')
    const request = makeRequest('/api/v1/tasks/nonexistent', {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Updated' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('returns 400 for invalid update data', async () => {
    const existingTask = createMockTask({ id: 'task-1' })
    mockPrisma.task.findFirst.mockResolvedValue(existingTask)

    const { PATCH } = await import('@/app/api/v1/tasks/[id]/route')
    const request = makeRequest('/api/v1/tasks/task-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'invalid_status_value' }),
    })
    const response = await PATCH(request, { params: Promise.resolve({ id: 'task-1' }) })

    expect(response.status).toBe(400)
  })
})

describe('Tasks API – DELETE /api/v1/tasks/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateAs()
  })

  it('returns 401 when not authenticated', async () => {
    unauthenticate()

    const { DELETE } = await import('@/app/api/v1/tasks/[id]/route')
    const request = makeRequest('/api/v1/tasks/task-1', { method: 'DELETE' })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'task-1' }) })

    expect(response.status).toBe(401)
  })

  it('deletes a task and returns 204', async () => {
    const existingTask = createMockTask({ id: 'task-1' })
    mockPrisma.task.findFirst.mockResolvedValue(existingTask)
    mockPrisma.task.delete.mockResolvedValue(existingTask)

    const { DELETE } = await import('@/app/api/v1/tasks/[id]/route')
    const request = makeRequest('/api/v1/tasks/task-1', { method: 'DELETE' })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'task-1' }) })

    expect(response.status).toBe(204)
    expect(mockPrisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task-1', userId: 'user-1' } })
  })

  it('returns 404 when task does not exist', async () => {
    mockPrisma.task.findFirst.mockResolvedValue(null)

    const { DELETE } = await import('@/app/api/v1/tasks/[id]/route')
    const request = makeRequest('/api/v1/tasks/nonexistent', { method: 'DELETE' })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'nonexistent' }) })

    expect(response.status).toBe(404)
  })

  it('cannot delete another user\'s task (user isolation)', async () => {
    mockPrisma.task.findFirst.mockResolvedValue(null)

    const { DELETE } = await import('@/app/api/v1/tasks/[id]/route')
    const request = makeRequest('/api/v1/tasks/other-user-task', { method: 'DELETE' })
    const response = await DELETE(request, { params: Promise.resolve({ id: 'other-user-task' }) })

    expect(response.status).toBe(404)
    expect(mockPrisma.task.delete).not.toHaveBeenCalled()
  })
})
