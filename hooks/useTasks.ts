'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { ApiTask } from '@/lib/api-client';
import type { Task, TaskFormData, TaskStatus } from '@/lib/types';

/**
 * Generate a temporary ID for optimistic updates.
 */
function generateTempId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `temp-${crypto.randomUUID()}`;
  }
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Status cycle order for cycleStatus function.
 */
const STATUS_CYCLE: TaskStatus[] = ['pending', 'in_progress', 'completed'];

/**
 * Map API task response to frontend Task type.
 * The API returns tags as full objects; the frontend expects tag IDs.
 */
function mapApiTask(apiTask: ApiTask): Task {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || '',
    status: apiTask.status as TaskStatus,
    priority: apiTask.priority as Task['priority'],
    dueDate: apiTask.dueDate ?? null,
    tags: Array.isArray(apiTask.tags)
      ? apiTask.tags.map((t) => t.id)
      : [],
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt,
  };
}

/**
 * Hook for CRUD operations on tasks with API persistence.
 * Maintains the same public interface as the localStorage version.
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  /**
   * Fetch all tasks from the API.
   */
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getTasks({ limit: '100' });
      const mapped = response.data.map(mapApiTask);
      setTasks(mapped);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Error al cargar tareas';
      setError(message);
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refetch tasks from API.
   */
  const refetch = useCallback(() => {
    return fetchTasks();
  }, [fetchTasks]);

  // Fetch tasks on mount
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchTasks();
    }
  }, [fetchTasks]);

  /**
   * Add a new task with optimistic update.
   */
  const addTask = useCallback(
    async (data: TaskFormData): Promise<Task> => {
      const now = new Date().toISOString();
      const tempId = generateTempId();
      const tempTask: Task = {
        id: tempId,
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      // Optimistic: add temp task
      setTasks((prev) => [...prev, tempTask]);

      try {
        const apiResponse = await api.createTask(data);
        const newTask = mapApiTask(apiResponse);

        // Replace temp task with real one
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? newTask : t))
        );

        return newTask;
      } catch (err) {
        // Revert optimistic update
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        const message =
          err instanceof ApiError ? err.message : 'Error al crear tarea';
        setError(message);
        throw err;
      }
    },
    []
  );

  /**
   * Update an existing task with optimistic update.
   * Returns the updated task or null if not found.
   */
  const updateTask = useCallback(
    async (id: string, data: Partial<TaskFormData>): Promise<Task | null> => {
      const taskIndex = tasks.findIndex((t) => t.id === id);
      if (taskIndex === -1) return null;

      const previousTask = tasks[taskIndex];
      const optimisticTask: Task = {
        ...previousTask,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? optimisticTask : t))
      );

      try {
        const apiResponse = await api.updateTask(id, data);
        const updatedTask = mapApiTask(apiResponse);

        // Replace with real API response
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? updatedTask : t))
        );

        return updatedTask;
      } catch (err) {
        // Revert to previous state
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? previousTask : t))
        );
        const message =
          err instanceof ApiError ? err.message : 'Error al actualizar tarea';
        setError(message);
        throw err;
      }
    },
    [tasks]
  );

  /**
   * Delete a task by ID with optimistic update.
   * Returns true if deleted, false if not found.
   */
  const deleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      const taskIndex = tasks.findIndex((t) => t.id === id);
      if (taskIndex === -1) return false;

      const previousTasks = [...tasks];

      // Optimistic removal
      setTasks((prev) => prev.filter((t) => t.id !== id));

      try {
        await api.deleteTask(id);
        return true;
      } catch (err) {
        // Revert
        setTasks(previousTasks);
        const message =
          err instanceof ApiError ? err.message : 'Error al eliminar tarea';
        setError(message);
        throw err;
      }
    },
    [tasks]
  );

  /**
   * Get a task by ID.
   */
  const getTask = useCallback(
    (id: string): Task | undefined => {
      return tasks.find((task) => task.id === id);
    },
    [tasks]
  );

  /**
   * Update only the status of a task.
   */
  const updateStatus = useCallback(
    (id: string, status: TaskStatus): Promise<Task | null> => {
      return updateTask(id, { status });
    },
    [updateTask]
  );

  /**
   * Cycle the task status: pending -> in_progress -> completed -> pending
   */
  const cycleStatus = useCallback(
    (id: string): Promise<Task | null> => {
      const task = tasks.find((t) => t.id === id);
      if (!task) {
        return Promise.resolve(null);
      }

      const currentIndex = STATUS_CYCLE.indexOf(task.status);
      const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
      const nextStatus = STATUS_CYCLE[nextIndex];

      return updateStatus(id, nextStatus);
    },
    [tasks, updateStatus]
  );

  // Memoize return object to maintain referential stability
  return useMemo(
    () => ({
      tasks,
      isLoading,
      error,
      addTask,
      updateTask,
      deleteTask,
      getTask,
      updateStatus,
      cycleStatus,
      refetch,
    }),
    [tasks, isLoading, error, addTask, updateTask, deleteTask, getTask, updateStatus, cycleStatus, refetch]
  );
}
