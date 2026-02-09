import type { TaskFormData, TagFormData } from '@/lib/types'

const API_BASE = '/api/v1'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: object
  ) {
    super(message)
  }
}

// API response types (from the server-side mappers)
export interface ApiTag {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface ApiTask {
  id: string
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  tags: ApiTag[]
  createdAt: string
  updatedAt: string
}

export interface ApiProfile {
  id: string
  name: string
  email: string
  role: string
  language: string
  initials: string
}

export interface ApiSettings {
  theme: string
  pomodoro: {
    focusMinutes: number
    shortBreakMinutes: number
    longBreakMinutes: number
    longBreakInterval: number
    totalDurationMinutes: number
    autoStartNext: boolean
    soundEnabled: boolean
  }
  notifications: {
    taskReminders: boolean
    dailySummary: boolean
    streakAlert: boolean
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Data export/import types
export interface ExportData {
  exportedAt: string
  tasks: Array<{
    id: string
    title: string
    description: string
    status: string
    priority: string
    dueDate: string | null
    tags: Array<{ id: string; name: string; color: string }>
    createdAt: string
    updatedAt: string
  }>
  tags: Array<{
    id: string
    name: string
    color: string
    createdAt: string
  }>
  settings: {
    theme: string
    pomodoroFocusMin: number
    pomodoroShortBreak: number
    pomodoroLongBreak: number
    pomodoroLongInterval: number
    pomodoroTotalMin: number
    pomodoroAutoStart: boolean
    pomodoroSoundEnabled: boolean
    taskReminders: boolean
    dailySummary: boolean
    streakAlert: boolean
  } | null
  pomodoroSessions: Array<{
    id: string
    startedAt: string
    completedAt: string | null
    totalMinutes: number
    focusMinutes: number
    sessionsPlanned: number
    sessionsCompleted: number
    taskIds: string[]
  }>
}

export interface ImportPayload {
  tags?: Array<{ name: string; color: string }>
  tasks?: Array<{
    title: string
    description?: string
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    priority?: 'HIGH' | 'MEDIUM' | 'LOW'
    dueDate?: string | null
    tags?: Array<{ name: string; color: string }>
  }>
  settings?: {
    theme?: string
    pomodoroFocusMin?: number
    pomodoroShortBreak?: number
    pomodoroLongBreak?: number
    pomodoroLongInterval?: number
    pomodoroTotalMin?: number
    pomodoroAutoStart?: boolean
    pomodoroSoundEnabled?: boolean
    taskReminders?: boolean
    dailySummary?: boolean
    streakAlert?: boolean
  } | null
  pomodoroSessions?: Array<{
    startedAt: string
    completedAt?: string | null
    totalMinutes: number
    focusMinutes: number
    sessionsPlanned: number
    sessionsCompleted: number
    taskIds?: string[]
  }>
}

export interface ImportResult {
  message: string
  summary: {
    tagsImported: number
    tasksImported: number
    settingsImported: boolean
    pomodoroSessionsImported: number
  }
}

// Payload types for create/update
interface CreateTaskPayload {
  title: string
  description: string
  status: string
  priority: string
  dueDate: string | null
  tagIds: string[]
}

type UpdateTaskPayload = Partial<CreateTaskPayload>

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new ApiError(error.error || 'Error desconocido', res.status, error.details)
  }

  if (res.status === 204) return undefined as T

  const json = await res.json()
  return json.data ?? json
}

async function requestPaginated<T>(endpoint: string, options?: RequestInit): Promise<PaginatedResponse<T>> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new ApiError(error.error || 'Error desconocido', res.status, error.details)
  }

  return res.json()
}

/**
 * Convert frontend TaskFormData to API payload.
 * Maps `tags` (string[]) to `tagIds` (string[]).
 */
function toTaskPayload(data: TaskFormData): CreateTaskPayload {
  return {
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate,
    tagIds: data.tags,
  }
}

function toPartialTaskPayload(data: Partial<TaskFormData>): UpdateTaskPayload {
  const payload: UpdateTaskPayload = {}
  if (data.title !== undefined) payload.title = data.title
  if (data.description !== undefined) payload.description = data.description
  if (data.status !== undefined) payload.status = data.status
  if (data.priority !== undefined) payload.priority = data.priority
  if (data.dueDate !== undefined) payload.dueDate = data.dueDate
  if (data.tags !== undefined) payload.tagIds = data.tags
  return payload
}

export const api = {
  // Tasks
  getTasks: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return requestPaginated<ApiTask>(`/tasks${query}`)
  },
  createTask: (data: TaskFormData) =>
    request<ApiTask>('/tasks', { method: 'POST', body: JSON.stringify(toTaskPayload(data)) }),
  updateTask: (id: string, data: Partial<TaskFormData>) =>
    request<ApiTask>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(toPartialTaskPayload(data)) }),
  deleteTask: (id: string) =>
    request<void>(`/tasks/${id}`, { method: 'DELETE' }),

  // Tags
  getTags: () => request<ApiTag[]>('/tags'),
  createTag: (data: TagFormData) =>
    request<ApiTag>('/tags', { method: 'POST', body: JSON.stringify(data) }),
  updateTag: (id: string, data: Partial<TagFormData>) =>
    request<ApiTag>(`/tags/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTag: (id: string) =>
    request<void>(`/tags/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => request<ApiSettings>('/settings'),
  updateSettings: (data: { theme?: string; pomodoro?: Partial<ApiSettings['pomodoro']>; notifications?: Partial<ApiSettings['notifications']> }) =>
    request<ApiSettings>('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  getProfile: () => request<ApiProfile>('/settings/profile'),
  updateProfile: (data: Partial<Pick<ApiProfile, 'name' | 'role' | 'language'>>) =>
    request<ApiProfile>('/settings/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  // Data management
  exportAllData: () => request<ExportData>('/data/export'),
  importAllData: (data: ImportPayload) =>
    request<ImportResult>('/data/import', { method: 'POST', body: JSON.stringify(data) }),
  clearAllData: () =>
    request<{ message: string }>('/data', { method: 'DELETE', headers: { 'X-Confirm-Delete': 'true' } }),
}
