'use client';

import { SkipBack, SkipForward, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  canSkipBack: boolean;
  canSkipForward: boolean;
}

export function TimerControls({
  isPaused,
  onPause,
  onResume,
  onSkipBack,
  onSkipForward,
  canSkipBack,
  canSkipForward,
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={onSkipBack}
        disabled={!canSkipBack}
        className={cn(
          'w-12 h-12 rounded-full bg-secondary flex items-center justify-center',
          'hover:bg-secondary/80 transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
        aria-label="Sesion anterior"
      >
        <SkipBack className="w-5 h-5 text-foreground" />
      </button>

      <button
        onClick={isPaused ? onResume : onPause}
        className={cn(
          'w-16 h-16 rounded-full bg-primary flex items-center justify-center',
          'hover:bg-primary/90 transition-colors'
        )}
        aria-label={isPaused ? 'Reanudar' : 'Pausar'}
      >
        {isPaused ? (
          <Play className="w-7 h-7 text-white ml-0.5" />
        ) : (
          <Pause className="w-7 h-7 text-white" />
        )}
      </button>

      <button
        onClick={onSkipForward}
        disabled={!canSkipForward}
        className={cn(
          'w-12 h-12 rounded-full bg-secondary flex items-center justify-center',
          'hover:bg-secondary/80 transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
        aria-label="Siguiente sesion"
      >
        <SkipForward className="w-5 h-5 text-foreground" />
      </button>
    </div>
  );
}
