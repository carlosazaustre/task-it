'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Task, TaskFormData, TaskStatus } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * Generate a unique ID for tasks.
 * Uses crypto.randomUUID if available, falls back to timestamp-based ID.
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Status cycle order for cycleStatus function.
 */
const STATUS_CYCLE: TaskStatus[] = ['pending', 'in_progress', 'completed'];

/**
 * Hook for CRUD operations on tasks with localStorage persistence.
 */
export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEYS.TASKS, []);

  // isLoading is derived from whether we're on the client
  // After hydration, useLocalStorage provides the real value
  const isLoading = typeof window === 'undefined';

  /**
   * Add a new task.
   */
  const addTask = useCallback(
    (data: TaskFormData): Task => {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: generateId(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    [setTasks]
  );

  /**
   * Update an existing task.
   * Returns the updated task or null if not found.
   */
  const updateTask = useCallback(
    (id: string, data: Partial<TaskFormData>): Task | null => {
      let updatedTask: Task | null = null;

      setTasks((prev) => {
        const index = prev.findIndex((task) => task.id === id);
        if (index === -1) {
          return prev;
        }

        const updated: Task = {
          ...prev[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        updatedTask = updated;

        const newTasks = [...prev];
        newTasks[index] = updated;
        return newTasks;
      });

      return updatedTask;
    },
    [setTasks]
  );

  /**
   * Delete a task by ID.
   * Returns true if deleted, false if not found.
   */
  const deleteTask = useCallback(
    (id: string): boolean => {
      let deleted = false;

      setTasks((prev) => {
        const index = prev.findIndex((task) => task.id === id);
        if (index === -1) {
          return prev;
        }

        deleted = true;
        return prev.filter((task) => task.id !== id);
      });

      return deleted;
    },
    [setTasks]
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
    (id: string, status: TaskStatus): Task | null => {
      return updateTask(id, { status });
    },
    [updateTask]
  );

  /**
   * Cycle the task status: pending -> in_progress -> completed -> pending
   */
  const cycleStatus = useCallback(
    (id: string): Task | null => {
      const task = tasks.find((t) => t.id === id);
      if (!task) {
        return null;
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
      addTask,
      updateTask,
      deleteTask,
      getTask,
      updateStatus,
      cycleStatus,
    }),
    [tasks, isLoading, addTask, updateTask, deleteTask, getTask, updateStatus, cycleStatus]
  );
}
