# Spec 01: Tipos Settings

**Archivo:** `lib/types.ts`
**Accion:** Modificar (anadir al final)
**Dependencias:** Ninguna
**Bloquea:** 02-constants, 05-hook

---

## Tipos a anadir

```typescript
// === Settings Types ===

// User Profile (persistido en localStorage)
export interface UserProfile {
  name: string;
  email: string;
  role: string;
  language: 'es' | 'en';
  initials: string;
}

// Notification preferences (persistido en localStorage)
export interface NotificationSettings {
  taskReminders: boolean;     // Recordatorio de tareas pendientes
  dailySummary: boolean;      // Resumen diario de productividad
  streakAlert: boolean;       // Alerta de racha
}

// Pomodoro default settings (ya existe PomodoroConfig, se reutiliza)
// Se anaden campos adicionales para autostart y sonido
export interface PomodoroPreferences {
  autoStartNext: boolean;     // Iniciar siguiente sesion automaticamente
  soundEnabled: boolean;      // Sonido al terminar sesion
}

// Settings section identifiers
export type SettingsSection =
  | 'profile'
  | 'appearance'
  | 'pomodoro'
  | 'notifications'
  | 'tags'
  | 'data';
```

## Verificacion

- `npm run build` compila sin errores
- Los tipos son importables desde `@/lib/types`
