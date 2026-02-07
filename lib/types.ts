// Calendar View Types
export type CalendarViewType = 'month' | 'week' | 'day';

// Task Status Types
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

// Task Priority Types
export type TaskPriority = 'high' | 'medium' | 'low';

// Tag Color Types
export type TagColor =
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose';

// Main Task Interface
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null; // ISO 8601 format
  tags: string[]; // Array of tag IDs
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

// Tag Interface
export interface Tag {
  id: string;
  name: string;
  color: TagColor;
}

// Form Data Types (without auto-generated fields)
export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
}

export interface TagFormData {
  name: string;
  color: TagColor;
}

// Filter Types
export interface TaskFilters {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  tags: string[]; // Tag IDs to include
  showOverdue: boolean; // Show only overdue tasks
}

// Sort Types
export type TaskSortField = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';

export type TaskSortOrder = 'asc' | 'desc';

export interface TaskSort {
  field: TaskSortField;
  order: TaskSortOrder;
}

// Pomodoro Types
export type PomodoroSessionType = 'focus' | 'short_break' | 'long_break';
export type PomodoroPhase = 'setup' | 'active' | 'completed';

export interface PomodoroConfig {
  totalDurationMinutes: number;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

export interface PomodoroSession {
  index: number;
  type: PomodoroSessionType;
  durationMinutes: number;
  taskId: string | null;
  label: string;
}

export interface PomodoroState {
  phase: PomodoroPhase;
  config: PomodoroConfig;
  sessions: PomodoroSession[];
  taskIds: string[];
  currentSessionIndex: number;
  timeRemainingSeconds: number;
  isPaused: boolean;
  startedAt: string | null;
}
