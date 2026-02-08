# Spec 05: Hook useSettings

**Archivo:** `hooks/useSettings.ts` (NUEVO)
**Accion:** Crear
**Dependencias:** 01-types, 02-constants
**Bloquea:** 06 a 11 (todas las secciones UI)

---

## Descripcion

Hook central que gestiona todo el estado de Settings con persistencia en localStorage. Agrupa la logica de perfil, notificaciones y preferencias de pomodoro.

No gestiona el tema (ya existe `useTheme`) ni las etiquetas (ya existe `useTags`). Estos hooks existentes se consumiran directamente desde las secciones que los necesiten.

## Implementacion

```typescript
'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type {
  UserProfile,
  NotificationSettings,
  PomodoroPreferences,
  SettingsSection,
} from '@/lib/types';
import type { PomodoroConfig } from '@/lib/types';
import {
  STORAGE_KEYS,
  DEFAULT_USER_PROFILE,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_POMODORO_PREFERENCES,
  POMODORO_DEFAULTS,
} from '@/lib/constants';

export function useSettings() {
  // --- Profile ---
  const [profile, setProfile] = useLocalStorage<UserProfile>(
    STORAGE_KEYS.USER_PROFILE,
    DEFAULT_USER_PROFILE
  );

  const updateProfile = useCallback(
    (data: Partial<UserProfile>) => {
      setProfile((prev) => {
        const updated = { ...prev, ...data };
        // Auto-calcular initials a partir del nombre
        if (data.name !== undefined) {
          updated.initials = data.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
        }
        return updated;
      });
    },
    [setProfile]
  );

  // --- Notifications ---
  const [notifications, setNotifications] = useLocalStorage<NotificationSettings>(
    STORAGE_KEYS.NOTIFICATION_SETTINGS,
    DEFAULT_NOTIFICATION_SETTINGS
  );

  const updateNotification = useCallback(
    (key: keyof NotificationSettings, value: boolean) => {
      setNotifications((prev) => ({ ...prev, [key]: value }));
    },
    [setNotifications]
  );

  // --- Pomodoro Preferences (autostart, sound) ---
  const [pomodoroPrefs, setPomodoroPrefs] = useLocalStorage<PomodoroPreferences>(
    STORAGE_KEYS.POMODORO_PREFERENCES,
    DEFAULT_POMODORO_PREFERENCES
  );

  const updatePomodoroPreference = useCallback(
    (key: keyof PomodoroPreferences, value: boolean) => {
      setPomodoroPrefs((prev) => ({ ...prev, [key]: value }));
    },
    [setPomodoroPrefs]
  );

  // --- Pomodoro Config (reutiliza STORAGE_KEYS.POMODORO_CONFIG existente) ---
  const [pomodoroConfig, setPomodoroConfig] = useLocalStorage<PomodoroConfig>(
    STORAGE_KEYS.POMODORO_CONFIG,
    POMODORO_DEFAULTS
  );

  const updatePomodoroConfig = useCallback(
    (key: keyof PomodoroConfig, value: number) => {
      setPomodoroConfig((prev) => ({ ...prev, [key]: value }));
    },
    [setPomodoroConfig]
  );

  // --- Data management ---
  const exportData = useCallback(() => {
    if (typeof window === 'undefined') return;

    const data = {
      tasks: localStorage.getItem(STORAGE_KEYS.TASKS),
      tags: localStorage.getItem(STORAGE_KEYS.TAGS),
      pomodoroConfig: localStorage.getItem(STORAGE_KEYS.POMODORO_CONFIG),
      pomodoroPreferences: localStorage.getItem(STORAGE_KEYS.POMODORO_PREFERENCES),
      userProfile: localStorage.getItem(STORAGE_KEYS.USER_PROFILE),
      notificationSettings: localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-it-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback(
    (file: File): Promise<boolean> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);

            // Restaurar cada clave si existe en el backup
            if (data.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, data.tasks);
            if (data.tags) localStorage.setItem(STORAGE_KEYS.TAGS, data.tags);
            if (data.pomodoroConfig)
              localStorage.setItem(STORAGE_KEYS.POMODORO_CONFIG, data.pomodoroConfig);
            if (data.pomodoroPreferences)
              localStorage.setItem(STORAGE_KEYS.POMODORO_PREFERENCES, data.pomodoroPreferences);
            if (data.userProfile)
              localStorage.setItem(STORAGE_KEYS.USER_PROFILE, data.userProfile);
            if (data.notificationSettings)
              localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, data.notificationSettings);

            // Recargar pagina para reflejar cambios
            window.location.reload();
            resolve(true);
          } catch {
            resolve(false);
          }
        };
        reader.readAsText(file);
      });
    },
    []
  );

  const clearAllData = useCallback(() => {
    if (typeof window === 'undefined') return;

    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });

    window.location.reload();
  }, []);

  return useMemo(
    () => ({
      // Profile
      profile,
      updateProfile,
      // Notifications
      notifications,
      updateNotification,
      // Pomodoro preferences
      pomodoroPrefs,
      updatePomodoroPreference,
      // Pomodoro config
      pomodoroConfig,
      updatePomodoroConfig,
      // Data management
      exportData,
      importData,
      clearAllData,
    }),
    [
      profile,
      updateProfile,
      notifications,
      updateNotification,
      pomodoroPrefs,
      updatePomodoroPreference,
      pomodoroConfig,
      updatePomodoroConfig,
      exportData,
      importData,
      clearAllData,
    ]
  );
}
```

## Verificacion

- `npm run build` compila sin errores
- El hook es importable desde `@/hooks/useSettings`
- Las lecturas de localStorage funcionan correctamente con SSR (sin window errors)
