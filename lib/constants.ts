import type {
  TaskStatus,
  TaskPriority,
  TagColor,
  TaskFormData,
  TaskFilters,
  CalendarViewType,
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
