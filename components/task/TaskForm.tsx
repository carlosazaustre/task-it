'use client';

import { useState, useMemo } from 'react';
import type { Task, Tag, TaskFormData, TaskStatus, TaskPriority } from '@/lib/types';
import { TASK_STATUSES, TASK_PRIORITIES, DEFAULT_TASK, VALIDATION } from '@/lib/constants';
import { TaskTagsInput } from './TaskTagsInput';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface TaskFormProps {
  task?: Task;
  tags: Tag[];
  onSubmit: (data: TaskFormData) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  onCreateTag?: (name: string) => void;
}

interface FormErrors {
  title?: string;
  description?: string;
}

function getInitialFormData(task?: Task): TaskFormData {
  if (task) {
    return {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags,
    };
  }
  return { ...DEFAULT_TASK };
}

export function TaskForm({
  task,
  tags,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitError,
  onCreateTag,
}: TaskFormProps) {
  // Use task.id as key to reset form when task changes
  // This avoids using useEffect with setState
  const formKey = task?.id ?? 'new';
  const initialData = useMemo(() => getInitialFormData(task), [task]);

  const [formData, setFormData] = useState<TaskFormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when task identity changes (detected via key comparison)
  const [lastFormKey, setLastFormKey] = useState(formKey);
  if (formKey !== lastFormKey) {
    setLastFormKey(formKey);
    setFormData(getInitialFormData(task));
    setErrors({});
  }

  const isEditMode = !!task;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El titulo es requerido';
    } else if (formData.title.length > VALIDATION.TASK_TITLE_MAX_LENGTH) {
      newErrors.title = `El titulo no puede exceder ${VALIDATION.TASK_TITLE_MAX_LENGTH} caracteres`;
    }

    if (formData.description.length > VALIDATION.TASK_DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `La descripcion no puede exceder ${VALIDATION.TASK_DESCRIPTION_MAX_LENGTH} caracteres`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
    });
  };

  const handleChange = (
    field: keyof TaskFormData,
    value: string | string[] | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Status options for Select component
  const statusOptions = TASK_STATUSES.map((status) => ({
    value: status.value,
    label: status.label,
  }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Title */}
      <div>
        <label
          htmlFor="task-title"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Titulo <span className="text-destructive">*</span>
        </label>
        <Input
          id="task-title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Escribe el titulo de la tarea"
          error={errors.title}
          maxLength={VALIDATION.TASK_TITLE_MAX_LENGTH}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          {formData.title.length}/{VALIDATION.TASK_TITLE_MAX_LENGTH}
        </p>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="task-description"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Descripcion
        </label>
        <Textarea
          id="task-description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe la tarea (opcional)"
          error={errors.description}
          maxLength={VALIDATION.TASK_DESCRIPTION_MAX_LENGTH}
          disabled={isSubmitting}
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          {formData.description.length}/{VALIDATION.TASK_DESCRIPTION_MAX_LENGTH}
        </p>
      </div>

      {/* Status and Priority - Two column layout */}
      <div className="flex gap-4">
        {/* Status */}
        <div className="flex-1">
          <label
            htmlFor="task-status"
            className="block text-sm font-semibold text-foreground mb-2"
          >
            Estado
          </label>
          <Select
            id="task-status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
            options={statusOptions}
            disabled={isSubmitting}
          />
        </div>

        {/* Priority */}
        <div className="flex-1">
          <span className="block text-sm font-semibold text-foreground mb-2">
            Prioridad
          </span>
          <div className="flex gap-4 mt-2">
            {TASK_PRIORITIES.map((priority) => (
              <label
                key={priority.value}
                className="inline-flex items-center gap-1.5 cursor-pointer"
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
                  className={cn(
                    'w-4 h-4 text-primary border-border',
                    'focus:ring-2 focus:ring-primary/20 focus:ring-offset-0'
                  )}
                  disabled={isSubmitting}
                />
                <span className="text-sm text-foreground">{priority.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label
          htmlFor="task-due-date"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Fecha limite
        </label>
        <Input
          id="task-due-date"
          type="date"
          value={formData.dueDate || ''}
          onChange={(e) => handleChange('dueDate', e.target.value || null)}
          disabled={isSubmitting}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Etiquetas
        </label>
        <TaskTagsInput
          selectedTags={formData.tags}
          availableTags={tags}
          onChange={(tagIds) => handleChange('tags', tagIds)}
          onCreateTag={onCreateTag}
        />
      </div>

      {/* API Error */}
      {submitError && (
        <div
          className="rounded-[14px] bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-5 border-t border-border">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
        >
          {isEditMode ? 'Guardar cambios' : 'Crear tarea'}
        </Button>
      </div>
    </form>
  );
}
