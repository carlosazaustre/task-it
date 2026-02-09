/**
 * Test DB helpers.
 *
 * Since we don't depend on a running PostgreSQL instance in unit tests,
 * these helpers provide factory functions to create mock Prisma objects
 * that match the database schema shapes.
 */

export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2a$12$hashedpassword',
    role: 'Developer',
    language: 'es',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  }
}

export function createMockTask(overrides: Partial<MockTask> = {}): MockTask {
  const now = new Date()
  return {
    id: 'task-1',
    title: 'Test Task',
    description: 'A test task description',
    status: 'PENDING' as const,
    priority: 'MEDIUM' as const,
    dueDate: null,
    userId: 'user-1',
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function createMockTag(overrides: Partial<MockTag> = {}): MockTag {
  return {
    id: 'tag-1',
    name: 'Work',
    color: 'blue',
    userId: 'user-1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    ...overrides,
  }
}

export function createMockSettings(overrides: Partial<MockSettings> = {}): MockSettings {
  return {
    id: 'settings-1',
    userId: 'user-1',
    theme: 'system',
    pomodoroFocusMin: 25,
    pomodoroShortBreak: 5,
    pomodoroLongBreak: 15,
    pomodoroLongInterval: 4,
    pomodoroTotalMin: 240,
    pomodoroAutoStart: false,
    pomodoroSoundEnabled: true,
    taskReminders: true,
    dailySummary: false,
    streakAlert: true,
    ...overrides,
  }
}

export function createMockApiKey(overrides: Partial<MockApiKey> = {}): MockApiKey {
  return {
    id: 'apikey-1',
    name: 'Test API Key',
    key: 'tk_test123abc',
    keyPreview: 'tk_test...abc',
    userId: 'user-1',
    lastUsed: null,
    createdAt: new Date('2025-01-01'),
    user: createMockUser(),
    ...overrides,
  }
}

// Type definitions for mock objects
export interface MockUser {
  id: string
  email: string
  name: string
  password: string
  role: string
  language: string
  createdAt: Date
  updatedAt: Date
}

export interface MockTask {
  id: string
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  dueDate: Date | null
  userId: string
  tags: MockTag[]
  createdAt: Date
  updatedAt: Date
}

export interface MockTag {
  id: string
  name: string
  color: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface MockSettings {
  id: string
  userId: string
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
}

export interface MockApiKey {
  id: string
  name: string
  key: string
  keyPreview: string
  userId: string
  lastUsed: Date | null
  createdAt: Date
  user: MockUser
}
