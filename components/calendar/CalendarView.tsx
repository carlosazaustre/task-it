'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCalendar } from '@/hooks/useCalendar';
import { useTasks } from '@/hooks/useTasks';
import { useTags } from '@/hooks/useTags';
import { getTasksInRange } from '@/lib/calendar-utils';
import { CalendarHeader } from './CalendarHeader';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { Modal } from '@/components/ui/Modal';
import { TaskForm } from '@/components/task/TaskForm';
import type { Task, TaskFormData, TagFormData } from '@/lib/types';

export function CalendarView() {
  const {
    view,
    currentDate,
    periodLabel,
    subtitle,
    visibleRange,
    goToNext,
    goToPrev,
    goToToday,
    setView,
    goToDate,
  } = useCalendar();

  const router = useRouter();
  const { tasks, updateTask } = useTasks();
  const { tags, addTag } = useTags();

  // Filter tasks to visible range
  const visibleTasks = useMemo(
    () => getTasksInRange(tasks, visibleRange.start, visibleRange.end),
    [tasks, visibleRange]
  );

  // Modal state for editing tasks
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTaskClick = useCallback((task: Task) => {
    setEditingTask(task);
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditingTask(null);
  }, []);

  const handleFormSubmit = useCallback(
    (data: TaskFormData) => {
      if (!editingTask) return;
      setIsSubmitting(true);
      try {
        updateTask(editingTask.id, data);
        setEditingTask(null);
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingTask, updateTask]
  );

  const handleCreateTag = useCallback(
    (name: string) => {
      const tagData: TagFormData = { name, color: 'blue' };
      addTag(tagData);
    },
    [addTag]
  );

  // Navigate to day view when clicking on a day cell in month view
  const handleDayClick = useCallback(
    (date: Date) => {
      const params = new URLSearchParams();
      params.set('view', 'day');
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      params.set('date', `${y}-${m}-${d}`);
      router.push(`/calendar?${params.toString()}`);
    },
    [router]
  );

  // Navigate to a date in day view (from MiniCalendar)
  const handleDateSelect = useCallback(
    (date: Date) => {
      goToDate(date);
    },
    [goToDate]
  );

  return (
    <div>
      <CalendarHeader
        title="Calendario"
        subtitle={subtitle}
        view={view}
        onViewChange={setView}
        periodLabel={periodLabel}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
      />

      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          tasks={visibleTasks}
          tags={tags}
          onDayClick={handleDayClick}
          onTaskClick={handleTaskClick}
        />
      )}

      {view === 'week' && (
        <WeekView
          weekStart={currentDate}
          tasks={visibleTasks}
          tags={tags}
          onTaskClick={handleTaskClick}
        />
      )}

      {view === 'day' && (
        <DayView
          date={currentDate}
          tasks={visibleTasks}
          allTasks={tasks}
          tags={tags}
          onDateSelect={handleDateSelect}
          onTaskClick={handleTaskClick}
        />
      )}

      <Modal
        isOpen={!!editingTask}
        onClose={handleCloseModal}
        title="Editar tarea"
        size="lg"
      >
        {editingTask && (
          <TaskForm
            key={editingTask.id}
            task={editingTask}
            tags={tags}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
            onCreateTag={handleCreateTag}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>
    </div>
  );
}
