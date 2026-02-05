'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { TaskFilters as TaskFiltersType, Tag, TaskStatus, TaskPriority } from '@/lib/types';
import { TASK_STATUSES, TASK_PRIORITIES, DEFAULT_FILTERS } from '@/lib/constants';
import { TAG_COLOR_STYLES } from './TaskTagsInput';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface TaskFiltersProps {
  filters: TaskFiltersType;
  tags: Tag[];
  onChange: (filters: TaskFiltersType) => void;
  taskCount: {
    total: number;
    filtered: number;
  };
}

// V3 Minimal Vibrant - Filter pill styling
const filterPillBase = 'py-2 px-4 rounded-[20px] text-sm font-medium transition-all';
const filterPillInactive = 'bg-secondary text-foreground hover:bg-secondary/80';
const filterPillActive = 'bg-[#8B5CF620] text-primary';

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
    <div className="space-y-5 p-5 bg-card rounded-[24px]">
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
        <Input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Buscar tareas..."
          className="pl-10"
          aria-label="Buscar tareas por titulo o descripcion"
        />
      </div>

      {/* Status filter pills */}
      <div>
        <span className="block text-sm font-semibold text-foreground mb-3">Estado</span>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleStatusChange('all')}
            className={cn(
              filterPillBase,
              filters.status === 'all' ? filterPillActive : filterPillInactive
            )}
          >
            Todos
          </button>
          {TASK_STATUSES.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => handleStatusChange(status.value)}
              className={cn(
                filterPillBase,
                filters.status === status.value ? filterPillActive : filterPillInactive
              )}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Priority filter pills */}
      <div>
        <span className="block text-sm font-semibold text-foreground mb-3">Prioridad</span>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handlePriorityChange('all')}
            className={cn(
              filterPillBase,
              filters.priority === 'all' ? filterPillActive : filterPillInactive
            )}
          >
            Todas
          </button>
          {TASK_PRIORITIES.map((priority) => (
            <button
              key={priority.value}
              type="button"
              onClick={() => handlePriorityChange(priority.value)}
              className={cn(
                filterPillBase,
                filters.priority === priority.value ? filterPillActive : filterPillInactive
              )}
            >
              {priority.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags filter */}
      {tags.length > 0 && (
        <div>
          <span className="block text-sm font-semibold text-foreground mb-3">Etiquetas</span>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => {
              const isSelected = filters.tags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={cn(
                    'py-2 px-4 rounded-[20px] text-sm font-medium transition-all',
                    TAG_COLOR_STYLES[tag.color],
                    isSelected
                      ? 'ring-2 ring-primary ring-offset-2'
                      : 'opacity-60 hover:opacity-100'
                  )}
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
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-sm text-muted-foreground">
          Mostrando {taskCount.filtered} de {taskCount.total} tareas
        </span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            leftIcon={
              <svg
                className="w-4 h-4"
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
            }
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
