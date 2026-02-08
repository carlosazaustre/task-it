# Plan de Implementacion: Vista de Ajustes (Settings)

## Resumen

Implementar la vista de Ajustes de Task-It segun el diseno "Settings V3" en Pencil. La vista permite al usuario personalizar su perfil, apariencia (tema), configuracion de Pomodoro, notificaciones, gestionar etiquetas y exportar/importar datos.

## Referencia de diseno

- **Archivo**: `docs/design/task-it.pen`
- **Frame**: "Settings V3" (ID: `wstpB`)

## Estructura de la vista

```
/settings
├── Header: "Ajustes" + subtitulo
├── Settings Nav (sidebar izquierdo, 220px, sticky)
│   ├── Perfil (user icon)
│   ├── Apariencia (palette icon)
│   ├── Pomodoro (timer icon)
│   ├── Notificaciones (bell icon)
│   ├── Etiquetas (tags icon)
│   └── Datos (database icon)
└── Settings Content (scroll vertical)
    ├── Section Perfil (avatar + 4 campos editables)
    ├── Section Apariencia (3 tarjetas de tema: claro/oscuro/sistema)
    ├── Section Pomodoro (3 selects + 2 toggles)
    ├── Section Notificaciones (3 toggles)
    ├── Section Etiquetas (lista CRUD con modal)
    └── Section Datos (exportar/importar/borrar)
```

## Archivos a crear/modificar

### Nuevos archivos (9)
| Archivo | Spec |
|---------|------|
| `hooks/useSettings.ts` | 05 |
| `app/settings/page.tsx` | 04 |
| `components/settings/index.ts` | 04 |
| `components/settings/SettingsView.tsx` | 12 |
| `components/settings/SettingsProfile.tsx` | 06 |
| `components/settings/SettingsAppearance.tsx` | 07 |
| `components/settings/SettingsPomodoro.tsx` | 08 |
| `components/settings/SettingsNotifications.tsx` | 09 |
| `components/settings/SettingsTags.tsx` | 10 |
| `components/settings/SettingsData.tsx` | 11 |

### Archivos a modificar (3)
| Archivo | Spec | Cambio |
|---------|------|--------|
| `lib/types.ts` | 01 | Anadir tipos Settings |
| `lib/constants.ts` | 02 | Anadir constantes y STORAGE_KEYS |
| `components/layout/Sidebar.tsx` | 03 | Anadir `href="/settings"` al NavItem |

## Hooks reutilizados (ya existen)

- `useTheme()` — para la seccion Apariencia
- `useTags()` — para la seccion Etiquetas
- `useLocalStorage()` — base del hook useSettings

## Componentes UI reutilizados (ya existen)

- `Input`, `Select`, `Modal`, `Button` — en formularios y dialogos
- `AppShell`, `Sidebar`, `NavItem` — layout general

## Specs (orden de implementacion)

```
Paso 1:  01-types
Paso 2:  02-constants ║ 03-navigation ║ 04-route-skeleton
Paso 3:  05-hook-useSettings
Paso 4:  06-profile ║ 07-appearance ║ 08-pomodoro ║ 09-notifications ║ 10-tags ║ 11-data
Paso 5:  12-orchestrator
```

## Detalle de specs

| # | Spec | Archivo | Accion |
|---|------|---------|--------|
| 00 | [Grafo de dependencias](./00-dependency-graph.md) | — | Referencia |
| 01 | [Tipos](./01-types.md) | `lib/types.ts` | Modificar |
| 02 | [Constantes](./02-constants.md) | `lib/constants.ts` | Modificar |
| 03 | [Navegacion](./03-navigation.md) | `components/layout/Sidebar.tsx` | Modificar |
| 04 | [Route skeleton](./04-route-skeleton.md) | `app/settings/page.tsx` | Crear |
| 05 | [Hook useSettings](./05-hook-useSettings.md) | `hooks/useSettings.ts` | Crear |
| 06 | [Seccion Perfil](./06-section-profile.md) | `components/settings/SettingsProfile.tsx` | Crear |
| 07 | [Seccion Apariencia](./07-section-appearance.md) | `components/settings/SettingsAppearance.tsx` | Crear |
| 08 | [Seccion Pomodoro](./08-section-pomodoro.md) | `components/settings/SettingsPomodoro.tsx` | Crear |
| 09 | [Seccion Notificaciones](./09-section-notifications.md) | `components/settings/SettingsNotifications.tsx` | Crear |
| 10 | [Seccion Etiquetas](./10-section-tags.md) | `components/settings/SettingsTags.tsx` | Crear |
| 11 | [Seccion Datos](./11-section-data.md) | `components/settings/SettingsData.tsx` | Crear |
| 12 | [Orquestador](./12-orchestrator.md) | `components/settings/SettingsView.tsx` | Crear |

## Principios aplicados

- **MVP**: Solo funcionalidad esencial. Notificaciones son solo preferencias guardadas (sin push real)
- **Reutilizacion**: Se aprovechan hooks (`useTheme`, `useTags`, `useLocalStorage`) y componentes UI existentes
- **Consistencia**: Mismo patron que Analytics/Pomodoro — page.tsx > AppShell > XxxView
- **Mobile-first**: Nav lateral se oculta en mobile, grids pasan a 1 columna
- **Variables CSS**: Se usan `bg-card`, `text-foreground`, etc. (nunca hex hardcodeados)
- **Dark mode**: Todos los componentes usan variables de tema, compatible automaticamente
