'use client';

import { ToggleRow } from '@/components/ui/Toggle';
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
          <ToggleRow
            key={item.key}
            title={item.title}
            description={item.description}
            checked={notifications[item.key]}
            onChange={(checked) => onUpdate(item.key, checked)}
            showBorder={index < NOTIFICATION_ITEMS.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
