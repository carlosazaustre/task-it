'use client';

import { Plus, X, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, Tag } from '@/lib/types';
import { useState } from 'react';

interface PomodoroTaskListProps {
  tasks: Task[];
  allTasks: Task[];
  tags: Tag[];
  selectedTaskIds: string[];
  onAddTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
}

export function PomodoroTaskList({
  tasks,
  allTasks,
  tags,
  selectedTaskIds,
  onAddTask,
  onRemoveTask,
}: PomodoroTaskListProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Available tasks = all pending/in_progress tasks not already selected
  const availableTasks = allTasks.filter(
    (t) => !selectedTaskIds.includes(t.id) && t.status !== 'completed'
  );

  const getTagName = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);
    return tag?.name ?? '';
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold font-heading text-foreground">
          Tareas de la Jornada
        </h2>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-[14px] text-sm font-medium',
            'bg-primary/10 text-primary hover:bg-primary/20 transition-colors'
          )}
        >
          <Plus className="w-4 h-4" />
          Añadir
        </button>
      </div>

      {/* Task picker dropdown */}
      {showPicker && availableTasks.length > 0 && (
        <div className="bg-card rounded-[14px] border border-border mb-4 max-h-48 overflow-y-auto">
          {availableTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => {
                onAddTask(task.id);
                if (availableTasks.length <= 1) setShowPicker(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors flex items-center gap-3 text-sm text-foreground border-b border-border last:border-0"
            >
              <Plus className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{task.title}</span>
              {task.tags.length > 0 && (
                <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
                  {getTagName(task.tags[0])}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {showPicker && availableTasks.length === 0 && (
        <div className="bg-card rounded-[14px] border border-border mb-4 p-4 text-center text-sm text-muted-foreground">
          No hay más tareas disponibles
        </div>
      )}

      {/* Selected tasks list */}
      {tasks.length === 0 ? (
        <div className="bg-card rounded-[24px] p-8 text-center">
          <ListTodo className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Añade tareas para tu jornada
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className="bg-card rounded-[14px] px-4 py-3 flex items-center gap-3"
            >
              <span className="text-xs font-medium text-muted-foreground w-5 text-center flex-shrink-0">
                {index + 1}
              </span>
              <span className="text-sm text-foreground truncate flex-1">{task.title}</span>
              {task.tags.length > 0 && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {getTagName(task.tags[0])}
                </span>
              )}
              <button
                onClick={() => onRemoveTask(task.id)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
