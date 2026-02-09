'use client';

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTags } from '@/hooks/useTags';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { AppShell, PageHeader } from '@/components/layout';
import { FilterChips } from '@/components/task/FilterChips';
import { TaskList } from '@/components/task/TaskList';
import { TaskForm } from '@/components/task/TaskForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Task, TaskFormData, TagFormData } from '@/lib/types';

export default function Home() {
  const { tasks, isLoading, error, addTask, updateTask, deleteTask, cycleStatus, refetch } = useTasks();
  const { tags, addTag } = useTags();
  const { filters, setFilters, filteredTasks, counts } = useTaskFilters(tasks);

  // Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle opening create form
  const handleCreateTask = useCallback(() => {
    setEditingTask(undefined);
    setSubmitError(null);
    setIsFormModalOpen(true);
  }, []);

  // Handle opening edit form
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setSubmitError(null);
    setIsFormModalOpen(true);
  }, []);

  // Handle form submit (create or edit)
  const handleFormSubmit = useCallback(
    async (data: TaskFormData) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        if (editingTask) {
          await updateTask(editingTask.id, data);
        } else {
          await addTask(data);
        }
        setIsFormModalOpen(false);
        setEditingTask(undefined);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al guardar la tarea';
        setSubmitError(message);
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
    setSubmitError(null);
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

  // Filter options: "Todas" + tags
  const filterOptions = [
    { value: 'all', label: 'Todas' },
    ...tags.map((tag) => ({ value: tag.id, label: tag.name })),
  ];

  // Currently selected filter (first tag or 'all')
  const selectedFilter = filters.tags[0] || 'all';

  // Handle filter chip change
  const handleFilterChange = useCallback(
    (value: string) => {
      if (value === 'all') {
        setFilters({ ...filters, tags: [] });
      } else {
        setFilters({ ...filters, tags: [value] });
      }
    },
    [filters, setFilters]
  );

  return (
    <AppShell>
      {/* PageHeader */}
      <PageHeader
        title="Mis Tareas"
        subtitle="Gestiona y organiza tus tareas diarias"
        searchValue={filters.search}
        onSearchChange={(value) => setFilters({ ...filters, search: value })}
        actions={
          <Button onClick={handleCreateTask} variant="primary">
            <Plus className="w-5 h-5 mr-1.5" />
            Nueva Tarea
          </Button>
        }
      />

      {/* FilterChips */}
      <div className="mt-6 mb-8">
        <FilterChips
          options={filterOptions}
          selected={selectedFilter}
          onChange={handleFilterChange}
        />
      </div>

      {/* TaskList */}
      <TaskList
        tasks={filteredTasks}
        tags={tags}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
        onStatusChange={handleStatusChange}
      />

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
          submitError={submitError}
        />
      </Modal>
    </AppShell>
  );
}
