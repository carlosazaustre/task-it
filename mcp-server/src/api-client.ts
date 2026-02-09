const API_URL = process.env.TASKIT_API_URL || 'http://localhost:3000'
const API_KEY = process.env.TASKIT_API_KEY || ''

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  const json = await res.json()
  return json.data ?? json
}

export const apiClient = {
  getTasks: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiRequest<any[]>(`/tasks${query}`)
  },
  createTask: (data: any) =>
    apiRequest<any>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: any) =>
    apiRequest<any>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) =>
    apiRequest<void>(`/tasks/${id}`, { method: 'DELETE' }),
  getTags: () =>
    apiRequest<any[]>('/tags'),
  createTag: (data: any) =>
    apiRequest<any>('/tags', { method: 'POST', body: JSON.stringify(data) }),
}
