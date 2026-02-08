'use client';

import { Select } from '@/components/ui/Select';
import { ToggleRow } from '@/components/ui/Toggle';
import {
  POMODORO_FOCUS_OPTIONS,
  POMODORO_SHORT_BREAK_OPTIONS,
  POMODORO_LONG_BREAK_OPTIONS,
} from '@/lib/constants';
import type { PomodoroConfig, PomodoroPreferences } from '@/lib/types';

interface SettingsPomodoroProps {
  config: PomodoroConfig;
  prefs: PomodoroPreferences;
  onConfigChange: (key: keyof PomodoroConfig, value: number) => void;
  onPreferenceChange: (key: keyof PomodoroPreferences, value: boolean) => void;
}

export function SettingsPomodoro({
  config,
  prefs,
  onConfigChange,
  onPreferenceChange,
}: SettingsPomodoroProps) {
  return (
    <section className="bg-card rounded-[24px] p-7 flex flex-col gap-5">
      <h2 className="text-xl font-bold text-foreground font-heading">
        Pomodoro por defecto
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Focus Time"
          options={POMODORO_FOCUS_OPTIONS.map((o) => ({
            value: String(o.value),
            label: o.label,
          }))}
          value={String(config.focusMinutes)}
          onChange={(e) => onConfigChange('focusMinutes', Number(e.target.value))}
        />
        <Select
          label="Short Break"
          options={POMODORO_SHORT_BREAK_OPTIONS.map((o) => ({
            value: String(o.value),
            label: o.label,
          }))}
          value={String(config.shortBreakMinutes)}
          onChange={(e) => onConfigChange('shortBreakMinutes', Number(e.target.value))}
        />
        <Select
          label="Long Break"
          options={POMODORO_LONG_BREAK_OPTIONS.map((o) => ({
            value: String(o.value),
            label: o.label,
          }))}
          value={String(config.longBreakMinutes)}
          onChange={(e) => onConfigChange('longBreakMinutes', Number(e.target.value))}
        />
      </div>

      <div className="flex flex-col">
        <ToggleRow
          title="Iniciar siguiente sesion automaticamente"
          description="Continua al siguiente focus o break sin pausar"
          checked={prefs.autoStartNext}
          onChange={(v) => onPreferenceChange('autoStartNext', v)}
          showBorder
        />
        <ToggleRow
          title="Sonido al terminar sesion"
          description="Reproducir un tono cuando acabe el timer"
          checked={prefs.soundEnabled}
          onChange={(v) => onPreferenceChange('soundEnabled', v)}
        />
      </div>
    </section>
  );
}
