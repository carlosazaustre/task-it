'use client';

import { useState, useMemo } from 'react';
import type { Task, Tag, TaskFormData, TaskStatus, TaskPriority } from '@/lib/types';
import { TASK_STATUSES, TASK_PRIORITIES, DEFAULT_TASK, VALIDATION } from '@/lib/constants';
import { TaskTagsInput } from './TaskTagsInput';

interface TaskFormProps {
  task?: Task;
  tags: Tag[];
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="task-title" className="block text-sm font-medium text-foreground mb-1">
          Titulo <span className="text-destructive">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Escribe el titulo de la tarea"
          className={`input ${errors.title ? 'input-error' : ''}`}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
          maxLength={VALIDATION.TASK_TITLE_MAX_LENGTH}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-destructive mt-1">
            {errors.title}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formData.title.length}/{VALIDATION.TASK_TITLE_MAX_LENGTH}
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="task-description" className="block text-sm font-medium text-foreground mb-1">
          Descripcion
        </label>
        <textarea
          id="task-description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe la tarea (opcional)"
          className={`input min-h-24 resize-y ${errors.description ? 'input-error' : ''}`}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
          maxLength={VALIDATION.TASK_DESCRIPTION_MAX_LENGTH}
          disabled={isSubmitting}
          rows={3}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-destructive mt-1">
            {errors.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formData.description.length}/{VALIDATION.TASK_DESCRIPTION_MAX_LENGTH}
        </p>
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <label htmlFor="task-status" className="block text-sm font-medium text-foreground mb-1">
            Estado
          </label>
          <select
            id="task-status"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as TaskStatus)}
            className="input"
            disabled={isSubmitting}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <span className="block text-sm font-medium text-foreground mb-1">Prioridad</span>
          <div className="flex gap-4 mt-2">
            {TASK_PRIORITIES.map((priority) => (
              <label key={priority.value} className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value={priority.value}
                  checked={formData.priority === priority.value}
                  onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
                  className="w-4 h-4 text-primary focus:ring-ring"
                  disabled={isSubmitting}
                />
                <span className="text-sm">{priority.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="task-due-date" className="block text-sm font-medium text-foreground mb-1">
          Fecha limite
        </label>
        <input
          id="task-due-date"
          type="date"
          value={formData.dueDate || ''}
          onChange={(e) => handleChange('dueDate', e.target.value || null)}
          className="input"
          disabled={isSubmitting}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Etiquetas
        </label>
        <TaskTagsInput
          selectedTags={formData.tags}
          availableTags={tags}
          onChange={(tagIds) => handleChange('tags', tagIds)}
          onCreateTag={onCreateTag}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary px-4 py-2"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary px-4 py-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Guardando...
            </>
          ) : (
            <>{isEditMode ? 'Guardar cambios' : 'Crear tarea'}</>
          )}
        </button>
      </div>
    </form>
  );
}
