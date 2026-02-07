'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import type { PomodoroConfig } from '@/lib/types';
import {
  POMODORO_DURATION_OPTIONS,
  POMODORO_FOCUS_OPTIONS,
  POMODORO_SHORT_BREAK_OPTIONS,
  POMODORO_LONG_BREAK_OPTIONS,
  POMODORO_INTERVAL_OPTIONS,
} from '@/lib/constants';
import { generateSessionPlan, calculatePlanSummary, formatMinutesAsHoursMinutes } from '@/lib/pomodoro-utils';

interface PomodoroConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PomodoroConfig;
  onSave: (config: PomodoroConfig) => void;
}

export function PomodoroConfigModal({ isOpen, onClose, config, onSave }: PomodoroConfigModalProps) {
  const [localConfig, setLocalConfig] = useState<PomodoroConfig>(config);

  // Reset local state when modal opens
  // (we use the config prop as initial value in useState,
  //  but since Modal only renders when isOpen, this effectively resets on open)

  const summary = useMemo(() => {
    const sessions = generateSessionPlan(localConfig);
    return calculatePlanSummary(sessions);
  }, [localConfig]);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const updateField = (field: keyof PomodoroConfig, value: number) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Pomodoro"
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className={cn(
              'px-4 py-2.5 rounded-[14px] text-sm font-medium',
              'bg-secondary text-foreground hover:bg-secondary/80 transition-colors'
            )}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={cn(
              'px-5 py-2.5 rounded-[14px] text-sm font-medium',
              'bg-primary text-white hover:bg-primary/90 transition-colors'
            )}
          >
            Guardar
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Duration presets */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-3">
            Duración de la Jornada
          </label>
          <div className="flex gap-2">
            {POMODORO_DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateField('totalDurationMinutes', opt.value)}
                className={cn(
                  'px-4 py-2 rounded-[14px] text-sm font-medium transition-colors',
                  localConfig.totalDurationMinutes === opt.value
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Focus time */}
        <Select
          label="Focus Time"
          value={String(localConfig.focusMinutes)}
          onChange={(e) => updateField('focusMinutes', Number(e.target.value))}
          options={POMODORO_FOCUS_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
        />

        {/* Short break */}
        <Select
          label="Descanso Corto"
          value={String(localConfig.shortBreakMinutes)}
          onChange={(e) => updateField('shortBreakMinutes', Number(e.target.value))}
          options={POMODORO_SHORT_BREAK_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
        />

        {/* Long break */}
        <Select
          label="Descanso Largo"
          value={String(localConfig.longBreakMinutes)}
          onChange={(e) => updateField('longBreakMinutes', Number(e.target.value))}
          options={POMODORO_LONG_BREAK_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
        />

        {/* Long break interval */}
        <Select
          label="Descanso Largo cada..."
          value={String(localConfig.longBreakInterval)}
          onChange={(e) => updateField('longBreakInterval', Number(e.target.value))}
          options={POMODORO_INTERVAL_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
        />

        {/* Live summary */}
        <div className="bg-secondary rounded-[14px] p-4">
          <p className="text-sm font-semibold text-foreground mb-2">Resumen</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold font-heading text-primary">{summary.focusCount}</p>
              <p className="text-xs text-muted-foreground">Sesiones</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-foreground">
                {summary.shortBreakCount + summary.longBreakCount}
              </p>
              <p className="text-xs text-muted-foreground">Descansos</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-heading text-emerald-500 dark:text-emerald-400">
                {formatMinutesAsHoursMinutes(summary.totalFocusMinutes)}
              </p>
              <p className="text-xs text-muted-foreground">Foco Total</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
