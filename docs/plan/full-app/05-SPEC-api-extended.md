# Fase 4: API Extendida (Settings, Pomodoro, Analytics)

> **Estado**: Pendiente
> **Bloquea**: Fase 6
> **Bloqueado por**: Fase 2 (API Core)
> **Paralelizable**: Sí, con Fase 3 y Fase 5

## Objetivo

Extender la API REST para cubrir todas las funcionalidades de la aplicación: configuración de usuario, sesiones de Pomodoro, y analytics. Estos endpoints complementan la API Core y permiten una experiencia completa.

## Tareas

---

### T4.1: API de Settings - Perfil de usuario
**Bloqueante**: No
**Paralelo con**: T4.2, T4.3, T4.4

#### GET /api/v1/settings/profile

Obtener perfil del usuario autenticado.

**Respuesta**:
```json
{
  "data": {
    "id": "...",
    "name": "Carlos Azaustre",
    "email": "carlos@example.com",
    "role": "developer",
    "language": "es",
    "initials": "CA"
  }
}
```

> **Nota**: `initials` se calcula en el servidor (no se almacena).

#### PATCH /api/v1/settings/profile

Actualizar perfil (nombre, role, language). Email no editable por ahora.

**Body**:
```json
{
  "name": "Carlos A.",
  "role": "tech lead",
  "language": "en"
}
```

**Validación (Zod)**:
```typescript
const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  role: z.string().max(50).optional(),
  language: z.enum(['es', 'en']).optional(),
})
```

---

### T4.2: API de Settings - Configuración general
**Bloqueante**: No
**Paralelo con**: T4.1, T4.3, T4.4

#### GET /api/v1/settings

Obtener todas las configuraciones del usuario.

**Respuesta**:
```json
{
  "data": {
    "theme": "system",
    "pomodoro": {
      "focusMinutes": 25,
      "shortBreakMinutes": 5,
      "longBreakMinutes": 15,
      "longBreakInterval": 4,
      "totalDurationMinutes": 240,
      "autoStartNext": false,
      "soundEnabled": true
    },
    "notifications": {
      "taskReminders": true,
      "dailySummary": false,
      "streakAlert": true
    }
  }
}
```

#### PATCH /api/v1/settings

Actualizar cualquier subset de settings.

**Body** (partial):
```json
{
  "theme": "dark",
  "pomodoro": {
    "focusMinutes": 30
  },
  "notifications": {
    "dailySummary": true
  }
}
```

**Lógica**: Merge profundo (deep merge) de los campos enviados.

---

### T4.3: API de Pomodoro - Sesiones
**Bloqueante**: No
**Paralelo con**: T4.1, T4.2, T4.4

#### POST /api/v1/pomodoro/sessions

Guardar una sesión de Pomodoro completada.

**Body**:
```json
{
  "startedAt": "2026-02-09T10:00:00.000Z",
  "completedAt": "2026-02-09T14:00:00.000Z",
  "totalMinutes": 240,
  "focusMinutes": 180,
  "sessionsPlanned": 8,
  "sessionsCompleted": 8,
  "taskIds": ["clxyz...", "clxyz2..."]
}
```

**Respuesta**: `201 Created`

> **Nota**: El frontend envía esta data cuando una jornada de Pomodoro se completa o se detiene manualmente.

#### GET /api/v1/pomodoro/sessions

Listar sesiones del usuario con filtros de fecha.

**Query params**:
| Param | Tipo | Descripción |
|-------|------|-------------|
| `from` | ISO date | Fecha inicio |
| `to` | ISO date | Fecha fin |
| `limit` | number | Máximo resultados |

**Respuesta**:
```json
{
  "data": [
    {
      "id": "...",
      "startedAt": "2026-02-09T10:00:00.000Z",
      "completedAt": "2026-02-09T14:00:00.000Z",
      "totalMinutes": 240,
      "focusMinutes": 180,
      "sessionsPlanned": 8,
      "sessionsCompleted": 8,
      "taskIds": ["..."]
    }
  ]
}
```

#### GET /api/v1/pomodoro/stats

Estadísticas agregadas de Pomodoro.

**Query params**: `from`, `to`

**Respuesta**:
```json
{
  "data": {
    "totalSessions": 45,
    "totalFocusMinutes": 1350,
    "totalFocusHours": 22.5,
    "averageFocusMinutesPerSession": 30,
    "longestStreak": 8,
    "sessionsThisWeek": 12,
    "focusHoursThisWeek": 6.5
  }
}
```

---

### T4.4: API de Analytics
**Bloqueante**: No
**Paralelo con**: T4.1, T4.2, T4.3

#### GET /api/v1/analytics

Obtener todos los datos de analytics calculados en el servidor.

**Query params**:
| Param | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `range` | string | `this_week` | Rango temporal |

Rangos válidos: `this_week`, `last_7_days`, `this_month`, `last_30_days`

**Respuesta**:
```json
{
  "data": {
    "kpis": {
      "completedTasks": 15,
      "completionRate": 0.75,
      "focusHours": 22.5,
      "currentStreak": 5
    },
    "kpiTrends": {
      "completedTasks": { "direction": "up", "percentage": 20 },
      "completionRate": { "direction": "same", "percentage": 0 },
      "focusHours": { "direction": "up", "percentage": 15 },
      "currentStreak": { "direction": "down", "percentage": -10 }
    },
    "weeklyActivity": [
      { "date": "2026-02-03", "dayLabel": "Lun", "completed": 3, "pending": 2 },
      { "date": "2026-02-04", "dayLabel": "Mar", "completed": 5, "pending": 1 }
    ],
    "tagDistribution": [
      { "tagId": "...", "tagName": "Trabajo", "tagColor": "blue", "count": 8, "percentage": 40 }
    ],
    "recentActivity": [
      {
        "id": "...",
        "type": "task_completed",
        "title": "Implementar API",
        "timestamp": "2026-02-09T10:00:00.000Z",
        "relativeTime": "Hace 2 horas"
      }
    ]
  }
}
```

**Implementación server-side**:

La ventaja de calcular analytics en el servidor:
1. **Performance**: Las queries SQL son más eficientes que procesar en JS
2. **Precisión**: El cálculo de streaks y trends usa datos completos
3. **Escalabilidad**: No depende del tamaño del dataset en el cliente

```typescript
// Ejemplo: calcular streak
const streak = await prisma.$queryRaw`
  WITH daily_completions AS (
    SELECT DATE("updatedAt") as day
    FROM tasks
    WHERE "userId" = ${userId}
      AND status = 'COMPLETED'
    GROUP BY DATE("updatedAt")
    ORDER BY day DESC
  ),
  streaks AS (
    SELECT day,
           day - (ROW_NUMBER() OVER (ORDER BY day DESC))::int * INTERVAL '1 day' as grp
    FROM daily_completions
  )
  SELECT COUNT(*) as streak
  FROM streaks
  WHERE grp = (SELECT grp FROM streaks LIMIT 1)
`
```

---

### T4.5: API de Datos - Export/Import
**Bloqueante**: No
**Paralelo con**: T4.1 - T4.4

#### GET /api/v1/data/export

Exportar todos los datos del usuario como JSON.

**Respuesta**: Archivo JSON descargable con:
```json
{
  "exportedAt": "2026-02-09T...",
  "version": "1.0",
  "user": { "name": "...", "email": "..." },
  "tasks": [...],
  "tags": [...],
  "settings": {...},
  "pomodoroSessions": [...]
}
```

#### POST /api/v1/data/import

Importar datos desde JSON exportado. **Sobrescribe** los datos existentes.

**Body**: El mismo formato del export.

**Lógica**:
1. Validar estructura del JSON
2. Transacción: borrar datos existentes e insertar nuevos
3. Devolver resumen de lo importado

#### DELETE /api/v1/data

Eliminar TODOS los datos del usuario (excepto la cuenta).

**Seguridad**: Requiere confirmación en header (`X-Confirm-Delete: true`).

---

## Estructura de archivos resultante

```
app/
└── api/
    └── v1/
        ├── settings/
        │   ├── route.ts              # GET + PATCH settings
        │   └── profile/
        │       └── route.ts          # GET + PATCH profile
        ├── pomodoro/
        │   ├── sessions/
        │   │   └── route.ts          # GET list + POST create
        │   └── stats/
        │       └── route.ts          # GET stats
        ├── analytics/
        │   └── route.ts              # GET analytics
        └── data/
            ├── export/
            │   └── route.ts          # GET export
            ├── import/
            │   └── route.ts          # POST import
            └── route.ts              # DELETE all data
```

## Resumen de Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/settings/profile` | Obtener perfil |
| PATCH | `/api/v1/settings/profile` | Actualizar perfil |
| GET | `/api/v1/settings` | Obtener configuración |
| PATCH | `/api/v1/settings` | Actualizar configuración |
| POST | `/api/v1/pomodoro/sessions` | Guardar sesión Pomodoro |
| GET | `/api/v1/pomodoro/sessions` | Listar sesiones |
| GET | `/api/v1/pomodoro/stats` | Estadísticas Pomodoro |
| GET | `/api/v1/analytics` | Dashboard analytics |
| GET | `/api/v1/data/export` | Exportar datos |
| POST | `/api/v1/data/import` | Importar datos |
| DELETE | `/api/v1/data` | Borrar todos los datos |

## Criterios de Aceptación

- [ ] Perfil se lee y actualiza correctamente
- [ ] Settings se persisten y recuperan
- [ ] Sesiones de Pomodoro se guardan al completar/detener
- [ ] Stats de Pomodoro se calculan correctamente
- [ ] Analytics devuelve KPIs, trends, actividad y distribución
- [ ] Export genera JSON descargable con todos los datos
- [ ] Import restaura datos correctamente (operación atómica)
- [ ] Delete borra todo excepto la cuenta
- [ ] Todos los endpoints requieren autenticación
- [ ] `npm run build` compila sin errores
