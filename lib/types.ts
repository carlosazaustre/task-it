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

// === Analytics Types ===

export type AnalyticsDateRange = 'this_week' | 'last_7_days' | 'this_month' | 'last_30_days';

export interface KpiData {
  completedCount: number;
  completionRate: number;
  focusTimeHours: number;
  currentStreak: number;
}

export interface KpiTrend {
  value: number;
  isPositive: boolean;
}

export interface DailyActivity {
  date: string;
  dayLabel: string;
  completed: number;
  pending: number;
}

export interface TagCount {
  tagId: string;
  tagName: string;
  tagColor: TagColor;
  count: number;
}

export type ActivityActionType = 'completed' | 'created' | 'pomodoro';

export interface ActivityItem {
  id: string;
  action: ActivityActionType;
  title: string;
  meta: string;
  timestamp: string;
}

export interface AnalyticsData {
  kpis: KpiData;
  kpiTrends: Record<keyof KpiData, KpiTrend>;
  weeklyActivity: DailyActivity[];
  tagDistribution: TagCount[];
  recentActivity: ActivityItem[];
  totalTasksInRange: number;
}

// === Settings Types ===

// User Profile (persistido en localStorage)
export interface UserProfile {
  name: string;
  email: string;
  role: string;
  language: 'es' | 'en';
  initials: string;
}

// Notification preferences (persistido en localStorage)
export interface NotificationSettings {
  taskReminders: boolean;
  dailySummary: boolean;
  streakAlert: boolean;
}

// Pomodoro preferences (autostart y sonido)
export interface PomodoroPreferences {
  autoStartNext: boolean;
  soundEnabled: boolean;
}

// Settings section identifiers
export type SettingsSection =
  | 'profile'
  | 'appearance'
  | 'pomodoro'
  | 'notifications'
  | 'tags'
  | 'data';
