'use client';

import { useState, useCallback } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTags } from '@/hooks/useTags';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { TaskList } from '@/components/task/TaskList';
import { TaskForm } from '@/components/task/TaskForm';
import { TaskFilters } from '@/components/task/TaskFilters';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Task, TaskFormData, TagFormData } from '@/lib/types';

export default function Home() {
  const { tasks, isLoading, addTask, updateTask, deleteTask, cycleStatus } = useTasks();
  const { tags, addTag } = useTags();
  const { filters, setFilters, filteredTasks, counts } = useTaskFilters(tasks);

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle opening create form
  const handleCreateTask = useCallback(() => {
    setEditingTask(undefined);
    setIsFormModalOpen(true);
  }, []);

  // Handle opening edit form
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  }, []);

  // Handle form submit (create or edit)
  const handleFormSubmit = useCallback(
    (data: TaskFormData) => {
      setIsSubmitting(true);

      try {
        if (editingTask) {
          updateTask(editingTask.id, data);
        } else {
          addTask(data);
        }
        setIsFormModalOpen(false);
        setEditingTask(undefined);
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingTask, addTask, updateTask]
  );

  // Handle form cancel
  const handleFormCancel = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingTask(undefined);
  }, []);

  // Handle delete task
  const handleDeleteTask = useCallback(
    (taskId: string) => {
      deleteTask(taskId);
    },
    [deleteTask]
  );

  // Handle status change (cycle)
  const handleStatusChange = useCallback(
    (taskId: string) => {
      cycleStatus(taskId);
    },
    [cycleStatus]
  );

  // Handle creating a new tag from the form
  const handleCreateTag = useCallback(
    (name: string) => {
      const tagData: TagFormData = {
        name,
        color: 'blue',
      };
      addTag(tagData);
    },
    [addTag]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Task-It</h1>
              <p className="text-sm text-muted-foreground">
                Gestión de tareas laborales
              </p>
            </div>
            <Button onClick={handleCreateTask} variant="primary">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nueva tarea
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {/* Filters */}
        <TaskFilters
          filters={filters}
          tags={tags}
          onChange={setFilters}
          taskCount={{ total: counts.total, filtered: counts.filtered }}
        />

        {/* Task list */}
        <div className="mt-6">
          <TaskList
            tasks={filteredTasks}
            tags={tags}
            isLoading={isLoading}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      </main>

      {/* Task form modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={handleFormCancel}
        title={editingTask ? 'Editar tarea' : 'Nueva tarea'}
        size="lg"
      >
        <TaskForm
          key={editingTask?.id ?? 'new'}
          task={editingTask}
          tags={tags}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          onCreateTag={handleCreateTag}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
