'use client';

import { Settings, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PomodoroHeaderProps {
  onConfigClick: () => void;
  onStartClick: () => void;
  canStart: boolean;
}

export function PomodoroHeader({ onConfigClick, onStartClick, canStart }: PomodoroHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Pomodoro</h1>
        <p className="text-sm text-muted-foreground mt-1">Planifica y ejecuta tu jornada de trabajo</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onConfigClick}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-[14px]',
            'bg-secondary text-foreground text-sm font-medium',
            'hover:bg-secondary/80 transition-colors'
          )}
        >
          <Settings className="w-4 h-4" />
          Configurar
        </button>
        <button
          onClick={onStartClick}
          disabled={!canStart}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-[14px]',
            'bg-primary text-white text-sm font-medium',
            'hover:bg-primary/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <Play className="w-4 h-4" />
          Iniciar Jornada
        </button>
      </div>
    </div>
  );
}
