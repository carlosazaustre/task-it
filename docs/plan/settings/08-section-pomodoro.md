# Spec 08: Seccion Pomodoro

**Archivo:** `components/settings/SettingsPomodoro.tsx` (NUEVO)
**Accion:** Crear
**Dependencias:** 05-hook-useSettings
**Bloquea:** 12-orchestrator

---

## Referencia visual (del diseno Settings V3)

- Card con `bg-card rounded-[24px] p-7`
- Titulo "Pomodoro por defecto" (Plus Jakarta Sans 20px bold)
- 3 campos select en fila horizontal (igual ancho):
  - **Focus Time**: dropdown con valor actual (ej: "25 min")
  - **Short Break**: dropdown con valor actual (ej: "5 min")
  - **Long Break**: dropdown con valor actual (ej: "15 min")
- 2 toggles con descripcion debajo (separados por border-bottom):
  - **Iniciar siguiente sesion automaticamente** - "Continua al siguiente focus o break sin pausar"
  - **Sonido al terminar sesion** - "Reproducir un tono cuando acabe el timer"

## Comportamiento

- Los selects usan las opciones ya definidas en constants: `POMODORO_FOCUS_OPTIONS`, `POMODORO_SHORT_BREAK_OPTIONS`, `POMODORO_LONG_BREAK_OPTIONS`
- Al cambiar un select, se actualiza `pomodoroConfig` via `updatePomodoroConfig()`
- Los toggles actualizan `pomodoroPrefs` via `updatePomodoroPreference()`
- Los cambios se reflejan tambien en el Pomodoro view (comparten la misma key de localStorage)

## Implementacion

```tsx
'use client';

import { Select } from '@/components/ui/Select';
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

      {/* Selects row */}
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

      {/* Toggles */}
      <div className="flex flex-col">
        <ToggleRow
          title="Iniciar siguiente sesion automaticamente"
          description="Continua al siguiente focus o break sin pausar"
          checked={prefs.autoStartNext}
          onChange={(v) => onPreferenceChange('autoStartNext', v)}
          hasBorder
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

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  hasBorder = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  hasBorder?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-3.5 ${
        hasBorder ? 'border-b border-border' : ''
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>

      {/* Toggle switch */}
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'
        }`}
      >
        <div
          className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform ${
            checked ? 'translate-x-[23px]' : 'translate-x-[3px]'
          }`}
        />
      </button>
    </div>
  );
}
```

## Nota sobre el componente ToggleRow

Este componente `ToggleRow` (toggle switch con titulo + descripcion) se reutilizara en la seccion de Notificaciones (spec 09). Se puede extraer a `components/ui/ToggleRow.tsx` si se prefiere, pero para MVP se mantiene local y se duplica en ambas secciones. Si durante la implementacion se ve que tiene sentido extraerlo, hacerlo entonces.

## Verificacion

- Los 3 selects muestran valores actuales y las opciones correctas
- Al cambiar un select, el valor se persiste en localStorage
- Los 2 toggles reflejan el estado actual
- Al hacer clic en un toggle, el valor cambia y se persiste
- Los cambios aqui se reflejan tambien en la vista Pomodoro
