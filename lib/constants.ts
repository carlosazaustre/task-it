import type {
  TaskStatus,
  TaskPriority,
  TagColor,
  TaskFormData,
  TaskFilters,
  CalendarViewType,
  PomodoroConfig,
} from './types';

// Task Status metadata
export const TASK_STATUSES: {
  value: TaskStatus;
  label: string;
  description: string;
}[] = [
  { value: 'pending', label: 'Pendiente', description: 'Tarea por comenzar' },
  { value: 'in_progress', label: 'En progreso', description: 'Tarea en desarrollo' },
  { value: 'completed', label: 'Completada', description: 'Tarea finalizada' },
];

// Task Priority metadata
export const TASK_PRIORITIES: {
  value: TaskPriority;
  label: string;
  description: string;
}[] = [
  { value: 'high', label: 'Alta', description: 'Prioridad máxima, atender primero' },
  { value: 'medium', label: 'Media', description: 'Prioridad normal' },
  { value: 'low', label: 'Baja', description: 'Puede esperar' },
];

// Available Tag Colors
export const TAG_COLORS: TagColor[] = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
];

// Default values for new task
export const DEFAULT_TASK: TaskFormData = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  dueDate: null,
  tags: [],
};

// Default filter values
export const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  tags: [],
  showOverdue: false,
};

// LocalStorage keys
export const STORAGE_KEYS = {
  TASKS: 'task-it-tasks',
  TAGS: 'task-it-tags',
  POMODORO_CONFIG: 'task-it-pomodoro-config',
  POMODORO_STATE: 'task-it-pomodoro-state',
} as const;

// Validation limits
export const VALIDATION = {
  TASK_TITLE_MAX_LENGTH: 100,
  TASK_DESCRIPTION_MAX_LENGTH: 500,
  TAG_NAME_MAX_LENGTH: 20,
} as const;

// Calendar
export const CALENDAR_VIEWS: { value: CalendarViewType; label: string }[] = [
  { value: 'month', label: 'Mes' },
  { value: 'week', label: 'Semana' },
  { value: 'day', label: 'Día' },
];

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const WEEKDAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const CALENDAR_DEFAULTS = {
  START_HOUR: 8,
  END_HOUR: 18,
  HOUR_HEIGHT_PX: 80,
  WEEK_HOUR_HEIGHT_PX: 60,
} as const;

// Pomodoro
export const POMODORO_DEFAULTS: PomodoroConfig = {
  totalDurationMinutes: 240,
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};

export const POMODORO_DURATION_OPTIONS = [
  { value: 120, label: '2h' },
  { value: 240, label: '4h' },
  { value: 360, label: '6h' },
  { value: 480, label: '8h' },
];

export const POMODORO_FOCUS_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 25, label: '25 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 50, label: '50 min' },
];

export const POMODORO_SHORT_BREAK_OPTIONS = [
  { value: 3, label: '3 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
];

export const POMODORO_LONG_BREAK_OPTIONS = [
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
];

export const POMODORO_INTERVAL_OPTIONS = [
  { value: 2, label: '2 sesiones' },
  { value: 3, label: '3 sesiones' },
  { value: 4, label: '4 sesiones' },
  { value: 5, label: '5 sesiones' },
];
