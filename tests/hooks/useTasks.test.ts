import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// ---- MSW Server Setup ----

const API_BASE = 'http://localhost:3000/api/v1'

const mockTasks = [
  {
    id: 'task-1',
    title: 'First Task',
    description: 'Description 1',
    status: 'pending',
    priority: 'medium',
    dueDate: null,
    tags: [{ id: 'tag-1', name: 'Work', color: 'blue', createdAt: '2025-01-01T00:00:00.000Z' }],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'task-2',
    title: 'Second Task',
    description: 'Description 2',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2025-06-01T00:00:00.000Z',
    tags: [],
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  },
]

const handlers = [
  // GET /api/v1/tasks – paginated response
  http.get(`${API_BASE}/tasks`, () => {
    return HttpResponse.json({
      data: mockTasks,
      pagination: { page: 1, limit: 100, total: 2, totalPages: 1 },
    })
  }),

  // POST /api/v1/tasks – create task
  http.post(`${API_BASE}/tasks`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      data: {
        id: 'task-new',
        title: body.title,
        description: body.description || '',
        status: body.status || 'pending',
        priority: body.priority || 'medium',
        dueDate: body.dueDate || null,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }, { status: 201 })
  }),

  // PATCH /api/v1/tasks/:id – update task
  http.patch(`${API_BASE}/tasks/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const task = mockTasks.find(t => t.id === params.id)
    if (!task) {
      return HttpResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
    }
    return HttpResponse.json({
      data: {
        ...task,
        ...body,
        updatedAt: new Date().toISOString(),
      },
    })
  }),

  // DELETE /api/v1/tasks/:id – delete task
  http.delete(`${API_BASE}/tasks/:id`, ({ params }) => {
    const task = mockTasks.find(t => t.id === params.id)
    if (!task) {
      return HttpResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

// ---- Tests ----

describe('useTasks hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads tasks on mount', async () => {
    const { useTasks } = await import('@/hooks/useTasks')
    const { result } = renderHook(() => useTasks())

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tasks).toHaveLength(2)
    expect(result.current.tasks[0].title).toBe('First Task')
    expect(result.current.tasks[1].title).toBe('Second Task')
  })

  it('sets isLoading to true while fetching', async () => {
    const { useTasks } = await import('@/hooks/useTasks')
    const { result } = renderHook(() => useTasks())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('maps API tags to tag IDs in the frontend model', async () => {
    const { useTasks } = await import('@/hooks/useTasks')
    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // API returns tags as objects, hook should map to IDs
    expect(result.current.tasks[0].tags).toEqual(['tag-1'])
    expect(result.current.tasks[1].tags).toEqual([])
  })

  it('adds a task optimistically then replaces with API response', async () => {
    const { useTasks } = await import('@/hooks/useTasks')
    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let addedTask: unknown

    await act(async () => {
      addedTask = await result.current.addTask({
        title: 'New Task',
        description: 'New description',
        status: 'pending',
        priority: 'medium',
        dueDate: null,
        tags: [],
      })
    })

    // After API resolves, the temp task should be replaced with the real one
    await waitFor(() => {
      const taskIds = result.current.tasks.map(t => t.id)
      expect(taskIds).toContain('task-new')
      // No temp IDs should remain
      expect(taskIds.every(id => !id.startsWith('temp-'))).toBe(true)
    })
  })

  it('reverts optimistic add on API failure', async () => {
    // Override POST to return an error
    server.use(
      http.post(`${API_BASE}/tasks`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    const { useTasks } = await import('@/hooks/useTasks')
    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const initialCount = result.current.tasks.length

    await act(async () => {
      try {
        await result.current.addTask({
          title: 'Failing Task',
          description: '',
          status: 'pending',
          priority: 'medium',
          dueDate: null,
          tags: [],
        })
      } catch {
        // Expected to throw
      }
    })

    // Task count should be reverted to initial
    await waitFor(() => {
      expect(result.current.tasks.length).toBe(initialCount)
    })
  })

  it('updates a task optimistically', async () => {
    const { useTasks } = await import('@/hooks/useTasks')
    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.updateTask('task-1', { title: 'Updated Title' })
    })

    await waitFor(() => {
      const task = result.current.tasks.find(t => t.id === 'task-1')
      expect(task?.title).toBe('Updated Title')
    })
  })

  it('reverts optimistic update on API failure', async () => {
    server.use(
      http.patch(`${API_BASE}/tasks/:id`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    const { useTasks } = await import('@/hooks/useTasks')
    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const originalTitle = result.current.tasks.find(t => t.id === 'task-1')?.title

    await act(async () => {
      try {
        await result.current.updateTask('task-1', { title: 'Should Revert' })
      } catch {
        // Expected
      }
    })

    await waitFor(() => {
      const task = result.current.tasks.find(t => t.id === 'task-1')
      expect(task?.title).toBe(originalTitle)
    })
  })

  it('deletes a task optimistically', async () => {
    const { useTasks } = await import('@/hooks/useTasks')
    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.deleteTask('task-1')
    })

    await waitFor(() => {
      const taskIds = result.current.tasks.map(t => t.id)
      expect(taskIds).not.toContain('task-1')
    })
  })

  it('reverts optimistic delete on API failure', async () => {
    server.use(
      http.delete(`${API_BASE}/tasks/:id`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    const { useTasks } = await import('@/hooks/useTasks')
    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const initialCount = result.current.tasks.length

    await act(async () => {
      try {
        await result.current.deleteTask('task-1')
      } catch {
        // Expected
      }
    })

    await waitFor(() => {
      expect(result.current.tasks.length).toBe(initialCount)
    })
  })

  it('sets error state on fetch failure', async () => {
    server.use(
      http.get(`${API_BASE}/tasks`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    const { useTasks } = await import('@/hooks/useTasks')
    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).not.toBeNull()
  })

  it('getTask returns a task by ID', async () => {
    const { useTasks } = await import('@/hooks/useTasks')
    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const task = result.current.getTask('task-1')
    expect(task).toBeDefined()
    expect(task?.id).toBe('task-1')
  })

  it('getTask returns undefined for non-existent ID', async () => {
    const { useTasks } = await import('@/hooks/useTasks')
    const { result } = renderHook(() => useTasks())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const task = result.current.getTask('nonexistent')
    expect(task).toBeUndefined()
  })
})
