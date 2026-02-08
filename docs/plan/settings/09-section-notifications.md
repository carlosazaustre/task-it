# Spec 09: Seccion Notificaciones

**Archivo:** `components/settings/SettingsNotifications.tsx` (NUEVO)
**Accion:** Crear
**Dependencias:** 05-hook-useSettings
**Bloquea:** 12-orchestrator

---

## Referencia visual (del diseno Settings V3)

- Card con `bg-card rounded-[24px] p-7`
- Titulo "Notificaciones" (Plus Jakarta Sans 20px bold)
- 3 toggles con titulo + descripcion:
  1. **Recordatorio de tareas pendientes** - "Notificar tareas que vencen hoy" (switch ON, borde inferior)
  2. **Resumen diario** - "Recibir un resumen de productividad al final del dia" (switch OFF, borde inferior)
  3. **Alerta de racha** - "Avisar si vas a perder tu racha de productividad" (switch ON, sin borde)

## Comportamiento

- Los toggles controlan las 3 propiedades de `NotificationSettings`
- Estado guardado en localStorage via `useSettings().updateNotification()`
- Los toggles ON se muestran con fondo `bg-primary`, los OFF con fondo gris

## Nota sobre MVP

En esta version MVP las notificaciones son solo preferencias guardadas. No hay implementacion real de notificaciones push/browser. La UI muestra los toggles y persiste la preferencia para cuando se implemente la funcionalidad en el futuro.

## Implementacion

```tsx
'use client';

import type { NotificationSettings } from '@/lib/types';

interface SettingsNotificationsProps {
  notifications: NotificationSettings;
  onUpdate: (key: keyof NotificationSettings, value: boolean) => void;
}

const NOTIFICATION_ITEMS: {
  key: keyof NotificationSettings;
  title: string;
  description: string;
}[] = [
  {
    key: 'taskReminders',
    title: 'Recordatorio de tareas pendientes',
    description: 'Notificar tareas que vencen hoy',
  },
  {
    key: 'dailySummary',
    title: 'Resumen diario',
    description: 'Recibir un resumen de productividad al final del dia',
  },
  {
    key: 'streakAlert',
    title: 'Alerta de racha',
    description: 'Avisar si vas a perder tu racha de productividad',
  },
];

export function SettingsNotifications({
  notifications,
  onUpdate,
}: SettingsNotificationsProps) {
  return (
    <section className="bg-card rounded-[24px] p-7 flex flex-col">
      <h2 className="text-xl font-bold text-foreground font-heading">
        Notificaciones
      </h2>

      <div className="mt-4 flex flex-col">
        {NOTIFICATION_ITEMS.map((item, index) => (
          <div
            key={item.key}
            className={`flex items-center justify-between py-3.5 ${
              index < NOTIFICATION_ITEMS.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {item.title}
              </span>
              <span className="text-xs text-muted-foreground">
                {item.description}
              </span>
            </div>

            {/* Toggle switch */}
            <button
              role="switch"
              aria-checked={notifications[item.key]}
              aria-label={item.title}
              onClick={() => onUpdate(item.key, !notifications[item.key])}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                notifications[item.key]
                  ? 'bg-primary'
                  : 'bg-zinc-300 dark:bg-zinc-600'
              }`}
            >
              <div
                className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full transition-transform ${
                  notifications[item.key]
                    ? 'translate-x-[23px]'
                    : 'translate-x-[3px]'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
```

## Verificacion

- Se renderiza con 3 toggles
- Cada toggle refleja el estado actual de la preferencia
- Al hacer clic, el toggle cambia y se persiste en localStorage
- Los toggles ON muestran fondo violeta, los OFF gris
- Los 2 primeros items tienen borde inferior separador
