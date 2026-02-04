'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { TaskFilters as TaskFiltersType, Tag, TaskStatus, TaskPriority } from '@/lib/types';
import { TASK_STATUSES, TASK_PRIORITIES, DEFAULT_FILTERS } from '@/lib/constants';
import { TAG_COLOR_STYLES } from './TaskTagsInput';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  tags: Tag[];
  onChange: (filters: TaskFiltersType) => void;
  taskCount: {
    total: number;
    filtered: number;
  };
}

export function TaskFilters({ filters, tags, onChange, taskCount }: TaskFiltersProps) {
  // Use a key pattern to detect when filters.search changes externally
  const [lastExternalSearch, setLastExternalSearch] = useState(filters.search);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Detect external changes and reset local state
  // This happens during render, not in an effect, which is allowed
  if (filters.search !== lastExternalSearch) {
    setLastExternalSearch(filters.search);
    // Only reset if it's different from what we're typing
    if (localSearch !== filters.search) {
      setLocalSearch(filters.search);
    }
  }

  // Memoize to prevent unnecessary re-renders
  const currentFilters = useMemo(() => filters, [filters]);

  // Debounced search - update parent after 300ms of no typing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only debounce if local value differs from parent value
    if (localSearch === currentFilters.search) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      onChange({ ...currentFilters, search: localSearch });
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localSearch, currentFilters, onChange]);

  const handleStatusChange = useCallback((status: TaskStatus | 'all') => {
    onChange({ ...filters, status });
  }, [filters, onChange]);

  const handlePriorityChange = useCallback((priority: TaskPriority | 'all') => {
    onChange({ ...filters, priority });
  }, [filters, onChange]);

  const handleTagToggle = useCallback((tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter((id) => id !== tagId)
      : [...filters.tags, tagId];
    onChange({ ...filters, tags: newTags });
  }, [filters, onChange]);

  const handleClearFilters = useCallback(() => {
    setLocalSearch('');
    onChange({ ...DEFAULT_FILTERS });
  }, [onChange]);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.tags.length > 0;

  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg">
      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Buscar tareas..."
          className="input pl-10"
          aria-label="Buscar tareas por titulo o descripcion"
        />
      </div>

      {/* Status and Priority filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status filter */}
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="filter-status" className="block text-sm font-medium text-foreground mb-1">
            Estado
          </label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus | 'all')}
            className="input"
          >
            <option value="all">Todos</option>
            {TASK_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority filter */}
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="filter-priority" className="block text-sm font-medium text-foreground mb-1">
            Prioridad
          </label>
          <select
            id="filter-priority"
            value={filters.priority}
            onChange={(e) => handlePriorityChange(e.target.value as TaskPriority | 'all')}
            className="input"
          >
            <option value="all">Todas</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags filter */}
      {tags.length > 0 && (
        <div>
          <span className="block text-sm font-medium text-foreground mb-2">Etiquetas</span>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = filters.tags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    isSelected
                      ? `${TAG_COLOR_STYLES[tag.color]} ring-2 ring-ring ring-offset-2`
                      : `${TAG_COLOR_STYLES[tag.color]} opacity-60 hover:opacity-100`
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`Filtrar por etiqueta ${tag.name}`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results count and clear button */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-sm text-muted-foreground">
          Mostrando {taskCount.filtered} de {taskCount.total} tareas
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="btn btn-ghost text-sm px-3 py-1"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
