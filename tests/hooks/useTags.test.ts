import { describe, it, expect, vi, beforeAll, afterAll, afterEach, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// ---- MSW Server Setup ----

const API_BASE = 'http://localhost:3000/api/v1'

const mockTags = [
  { id: 'tag-1', name: 'Work', color: 'blue', createdAt: '2025-01-01T00:00:00.000Z' },
  { id: 'tag-2', name: 'Personal', color: 'green', createdAt: '2025-01-02T00:00:00.000Z' },
  { id: 'tag-3', name: 'Urgent', color: 'red', createdAt: '2025-01-03T00:00:00.000Z' },
]

const handlers = [
  // GET /api/v1/tags – returns flat array via apiSuccess wrapper
  http.get(`${API_BASE}/tags`, () => {
    return HttpResponse.json({ data: mockTags })
  }),

  // POST /api/v1/tags – create tag
  http.post(`${API_BASE}/tags`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({
      data: {
        id: 'tag-new',
        name: body.name,
        color: body.color,
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 })
  }),

  // PATCH /api/v1/tags/:id – update tag
  http.patch(`${API_BASE}/tags/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>
    const tag = mockTags.find(t => t.id === params.id)
    if (!tag) {
      return HttpResponse.json({ error: 'Tag no encontrado' }, { status: 404 })
    }
    return HttpResponse.json({
      data: {
        ...tag,
        ...body,
      },
    })
  }),

  // DELETE /api/v1/tags/:id – delete tag
  http.delete(`${API_BASE}/tags/:id`, ({ params }) => {
    const tag = mockTags.find(t => t.id === params.id)
    if (!tag) {
      return HttpResponse.json({ error: 'Tag no encontrado' }, { status: 404 })
    }
    return new HttpResponse(null, { status: 204 })
  }),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

// ---- Tests ----

describe('useTags hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads tags on mount', async () => {
    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.tags).toHaveLength(3)
    expect(result.current.tags[0].name).toBe('Work')
    expect(result.current.tags[1].name).toBe('Personal')
    expect(result.current.tags[2].name).toBe('Urgent')
  })

  it('maps API response to frontend Tag type (without createdAt)', async () => {
    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const tag = result.current.tags[0]
    expect(tag.id).toBe('tag-1')
    expect(tag.name).toBe('Work')
    expect(tag.color).toBe('blue')
    // Frontend Tag type doesn't include createdAt
    expect((tag as unknown as Record<string, unknown>).createdAt).toBeUndefined()
  })

  it('adds a tag optimistically then replaces with API response', async () => {
    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.addTag({ name: 'New Tag', color: 'purple' })
    })

    await waitFor(() => {
      const tagIds = result.current.tags.map(t => t.id)
      expect(tagIds).toContain('tag-new')
      // No temp IDs should remain
      expect(tagIds.every(id => !id.startsWith('temp-'))).toBe(true)
    })

    expect(result.current.tags).toHaveLength(4)
  })

  it('rejects duplicate tag name locally', async () => {
    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      try {
        await result.current.addTag({ name: 'Work', color: 'orange' })
      } catch (err) {
        expect((err as Error).message).toContain('Work')
      }
    })

    // Tag count should not have changed
    expect(result.current.tags).toHaveLength(3)
  })

  it('reverts optimistic add on API failure', async () => {
    server.use(
      http.post(`${API_BASE}/tags`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const initialCount = result.current.tags.length

    await act(async () => {
      try {
        await result.current.addTag({ name: 'Failing Tag', color: 'cyan' })
      } catch {
        // Expected
      }
    })

    await waitFor(() => {
      expect(result.current.tags.length).toBe(initialCount)
    })
  })

  it('updates a tag optimistically', async () => {
    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.updateTag('tag-1', { name: 'Updated Work' })
    })

    await waitFor(() => {
      const tag = result.current.tags.find(t => t.id === 'tag-1')
      expect(tag?.name).toBe('Updated Work')
    })
  })

  it('reverts optimistic update on API failure', async () => {
    server.use(
      http.patch(`${API_BASE}/tags/:id`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const originalName = result.current.tags.find(t => t.id === 'tag-1')?.name

    await act(async () => {
      try {
        await result.current.updateTag('tag-1', { name: 'Should Revert' })
      } catch {
        // Expected
      }
    })

    await waitFor(() => {
      const tag = result.current.tags.find(t => t.id === 'tag-1')
      expect(tag?.name).toBe(originalName)
    })
  })

  it('deletes a tag optimistically', async () => {
    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      const deleted = await result.current.deleteTag('tag-1')
      expect(deleted).toBe(true)
    })

    await waitFor(() => {
      const tagIds = result.current.tags.map(t => t.id)
      expect(tagIds).not.toContain('tag-1')
    })
  })

  it('reverts optimistic delete on API failure', async () => {
    server.use(
      http.delete(`${API_BASE}/tags/:id`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const initialCount = result.current.tags.length

    await act(async () => {
      try {
        await result.current.deleteTag('tag-1')
      } catch {
        // Expected
      }
    })

    await waitFor(() => {
      expect(result.current.tags.length).toBe(initialCount)
    })
  })

  it('getTag returns a tag by ID', async () => {
    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const tag = result.current.getTag('tag-2')
    expect(tag).toBeDefined()
    expect(tag?.name).toBe('Personal')
  })

  it('getTagsByIds returns multiple tags', async () => {
    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const tags = result.current.getTagsByIds(['tag-1', 'tag-3'])
    expect(tags).toHaveLength(2)
    expect(tags[0].name).toBe('Work')
    expect(tags[1].name).toBe('Urgent')
  })

  it('getTagsByIds silently filters out non-existent IDs', async () => {
    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const tags = result.current.getTagsByIds(['tag-1', 'nonexistent', 'tag-2'])
    expect(tags).toHaveLength(2)
  })

  it('sets error state on fetch failure', async () => {
    server.use(
      http.get(`${API_BASE}/tags`, () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )

    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).not.toBeNull()
  })

  it('deleteTag returns false for non-existent ID', async () => {
    const { useTags } = await import('@/hooks/useTags')
    const { result } = renderHook(() => useTags())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    let deleted: boolean | undefined
    await act(async () => {
      deleted = await result.current.deleteTag('nonexistent-id')
    })

    expect(deleted).toBe(false)
  })
})
