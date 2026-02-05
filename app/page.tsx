'use client';

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTags } from '@/hooks/useTags';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { Sidebar, PageHeader } from '@/components/layout';
import { FilterChips } from '@/components/task/FilterChips';
import { TaskList } from '@/components/task/TaskList';
import { TaskForm } from '@/components/task/TaskForm';
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
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-background">
        <div className="p-6 lg:p-10 xl:px-12 xl:py-10">
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
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>

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
      </main>
    </div>
  );
}
