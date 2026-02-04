'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Task, TaskFilters, TaskStatus, TaskPriority } from '@/lib/types';
import { DEFAULT_FILTERS } from '@/lib/constants';

/**
 * Hook for filtering tasks with various criteria.
 *
 * @param tasks - Array of tasks to filter
 */
export function useTaskFilters(tasks: Task[]) {
  const [filters, setFiltersState] = useState<TaskFilters>(DEFAULT_FILTERS);

  /**
   * Update filters partially (merge with existing filters).
   */
  const setFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  /**
   * Reset all filters to default values.
   */
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  /**
   * Apply all filters to the tasks array.
   * Filters are applied in AND logic.
   */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search filter: check title and description (case-insensitive)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchLower);
        const descriptionMatch = task.description
          .toLowerCase()
          .includes(searchLower);

        if (!titleMatch && !descriptionMatch) {
          return false;
        }
      }

      // 2. Status filter
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }

      // 3. Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      // 4. Tags filter: task must have at least one of the selected tags
      if (filters.tags.length > 0) {
        const hasMatchingTag = task.tags.some((tagId) =>
          filters.tags.includes(tagId)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      // 5. Overdue filter: only show tasks with dueDate < today
      if (filters.showOverdue) {
        if (!task.dueDate) {
          return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);

        if (dueDate >= today) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  /**
   * Calculate counts for total, filtered, and by status/priority.
   */
  const counts = useMemo(() => {
    const byStatus: Record<TaskStatus, number> = {
      pending: 0,
      in_progress: 0,
      completed: 0,
    };

    const byPriority: Record<TaskPriority, number> = {
      high: 0,
      medium: 0,
      low: 0,
    };

    // Count from original tasks array (not filtered)
    for (const task of tasks) {
      byStatus[task.status]++;
      byPriority[task.priority]++;
    }

    return {
      total: tasks.length,
      filtered: filteredTasks.length,
      byStatus,
      byPriority,
    };
  }, [tasks, filteredTasks.length]);

  // Memoize return object to maintain referential stability
  return useMemo(
    () => ({
      filters,
      setFilters,
      resetFilters,
      filteredTasks,
      counts,
    }),
    [filters, setFilters, resetFilters, filteredTasks, counts]
  );
}
