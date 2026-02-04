import type {
  TaskStatus,
  TaskPriority,
  TagColor,
  TaskFormData,
  TaskFilters,
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
