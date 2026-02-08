# Spec 02: Constantes Settings

**Archivo:** `lib/constants.ts`
**Accion:** Modificar (anadir al final)
**Dependencias:** 01-types
**Bloquea:** 05-hook

---

## Constantes a anadir

```typescript
import type {
  UserProfile,
  NotificationSettings,
  PomodoroPreferences,
  SettingsSection,
} from './types';

// Settings Navigation items
export const SETTINGS_SECTIONS: {
  value: SettingsSection;
  label: string;
  icon: string; // nombre del icono lucide
}[] = [
  { value: 'profile', label: 'Perfil', icon: 'user' },
  { value: 'appearance', label: 'Apariencia', icon: 'palette' },
  { value: 'pomodoro', label: 'Pomodoro', icon: 'timer' },
  { value: 'notifications', label: 'Notificaciones', icon: 'bell' },
  { value: 'tags', label: 'Etiquetas', icon: 'tags' },
  { value: 'data', label: 'Datos', icon: 'database' },
];

// Default user profile
export const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  email: '',
  role: '',
  language: 'es',
  initials: 'U',
};

// Default notification preferences
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  taskReminders: true,
  dailySummary: false,
  streakAlert: true,
};

// Default pomodoro preferences
export const DEFAULT_POMODORO_PREFERENCES: PomodoroPreferences = {
  autoStartNext: true,
  soundEnabled: true,
};

// Language options
export const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Espanol' },
  { value: 'en', label: 'English' },
];

// Anadir nuevas keys a STORAGE_KEYS (inline, en el objeto existente)
// STORAGE_KEYS += {
//   USER_PROFILE: 'task-it-user-profile',
//   NOTIFICATION_SETTINGS: 'task-it-notification-settings',
//   POMODORO_PREFERENCES: 'task-it-pomodoro-preferences',
// }
```

## Cambio en STORAGE_KEYS existente

Anadir las siguientes claves al objeto `STORAGE_KEYS`:

```typescript
export const STORAGE_KEYS = {
  // ... existentes ...
  USER_PROFILE: 'task-it-user-profile',
  NOTIFICATION_SETTINGS: 'task-it-notification-settings',
  POMODORO_PREFERENCES: 'task-it-pomodoro-preferences',
} as const;
```

## Verificacion

- `npm run build` compila sin errores
- Las constantes son importables desde `@/lib/constants`
