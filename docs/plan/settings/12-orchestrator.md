# Spec 12: Orquestador - SettingsView

**Archivo:** `components/settings/SettingsView.tsx` (reemplaza placeholder)
**Accion:** Crear/Reemplazar
**Dependencias:** 06, 07, 08, 09, 10, 11
**Bloquea:** Nada (es el ultimo spec)

---

## Referencia visual (del diseno Settings V3)

Layout principal del area de contenido:
- **Header**: Titulo "Ajustes" (Plus Jakarta Sans 34px bold) + Subtitulo "Personaliza tu experiencia en Task-It"
- **Content Area**: layout horizontal con:
  - **Settings Nav** (ancho fijo 220px): lista vertical de secciones con iconos. La seccion activa tiene fondo `primary/10` y texto `primary`
  - **Settings Content** (flex-1): scroll vertical con las secciones apiladas verticalmente, gap 32px

## Comportamiento

- La navegacion lateral permite hacer scroll suave a la seccion correspondiente
- En mobile (< lg), la navegacion lateral se oculta y las secciones se muestran secuencialmente
- Al hacer clic en un item de nav, se hace scroll smooth al `id` de la seccion
- Opcionalmente: highlight del nav item segun la seccion visible (con IntersectionObserver), pero para MVP basta con el scroll

## Implementacion

```tsx
'use client';

import { useState } from 'react';
import {
  User,
  Palette,
  Timer,
  Bell,
  Tags,
  Database,
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { SettingsProfile } from './SettingsProfile';
import { SettingsAppearance } from './SettingsAppearance';
import { SettingsPomodoro } from './SettingsPomodoro';
import { SettingsNotifications } from './SettingsNotifications';
import { SettingsTags } from './SettingsTags';
import { SettingsData } from './SettingsData';
import { cn } from '@/lib/utils';
import type { SettingsSection } from '@/lib/types';

const NAV_ITEMS: {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'tags', label: 'Etiquetas', icon: Tags },
  { id: 'data', label: 'Datos', icon: Database },
];

export function SettingsView() {
  const {
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
  } = useSettings();

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const handleNavClick = (section: SettingsSection) => {
    setActiveSection(section);
    const element = document.getElementById(`settings-${section}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col gap-7">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[34px] font-bold text-foreground font-heading leading-tight">
          Ajustes
        </h1>
        <p className="text-sm text-muted-foreground">
          Personaliza tu experiencia en Task-It
        </p>
      </div>

      {/* Content: Nav + Sections */}
      <div className="flex gap-8">
        {/* Settings Nav - hidden on mobile */}
        <nav className="hidden lg:flex flex-col gap-1 w-[220px] flex-shrink-0 sticky top-10 self-start">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-[14px]',
                  'text-sm transition-colors text-left',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground font-medium'
                )}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sections */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          <div id="settings-profile">
            <SettingsProfile profile={profile} onUpdate={updateProfile} />
          </div>

          <div id="settings-appearance">
            <SettingsAppearance />
          </div>

          <div id="settings-pomodoro">
            <SettingsPomodoro
              config={pomodoroConfig}
              prefs={pomodoroPrefs}
              onConfigChange={updatePomodoroConfig}
              onPreferenceChange={updatePomodoroPreference}
            />
          </div>

          <div id="settings-notifications">
            <SettingsNotifications
              notifications={notifications}
              onUpdate={updateNotification}
            />
          </div>

          <div id="settings-tags">
            <SettingsTags />
          </div>

          <div id="settings-data">
            <SettingsData
              onExport={exportData}
              onImport={importData}
              onClearAll={clearAllData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Actualizar barrel export

**Archivo:** `components/settings/index.ts`

```typescript
export { SettingsView } from './SettingsView';
```

## Verificacion

- La vista completa renderiza todas las 6 secciones
- La navegacion lateral hace scroll suave a cada seccion
- En mobile la nav lateral se oculta
- Todos los datos se persisten correctamente
- El tema cambia en tiempo real desde la seccion Apariencia
- Las etiquetas se pueden CRUD desde la seccion Etiquetas
- Exportar/Importar/Borrar datos funciona correctamente
- `npm run build` compila sin errores
- La ruta `/settings` es accesible desde el sidebar
