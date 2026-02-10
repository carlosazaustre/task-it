# Task-It API Documentation

## Overview

Task-It exposes a REST API under `/api/v1/` for managing tasks, tags, settings, pomodoro sessions, analytics, and data import/export. Authentication is required for all `/api/v1/` endpoints.

**Base URL:** `/api/v1`

## Authentication

Every endpoint under `/api/v1/` supports two authentication methods, tried in order:

1. **API Key** -- Send a `Bearer` token in the `Authorization` header. Keys are prefixed with `tk_`.
2. **Session cookie** -- Standard NextAuth session cookie (set automatically by the browser after login).

If neither method resolves to a valid user the response is:

```json
{ "error": "No autorizado" }
```

**Status:** `401 Unauthorized`

### Using an API Key

```bash
curl -H "Authorization: Bearer tk_abc123..." https://example.com/api/v1/tasks
```

### Using a Session (browser)

No extra headers needed -- the session cookie is sent automatically.

---

## Response Envelope

All successful responses (except `204 No Content`) use a standard envelope:

```json
{
  "data": { ... }
}
```

Paginated endpoints use:

```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120,
    "totalPages": 3
  }
}
```

Error responses use:

```json
{
  "error": "Description of the error",
  "details": { ... }
}
```

---

## 1. Tasks

### GET /api/v1/tasks

List the authenticated user's tasks with filtering, search, sorting, and pagination.

**Authentication:** Session or API Key

#### Query Parameters

| Parameter | Type     | Default     | Description                                                        |
|-----------|----------|-------------|--------------------------------------------------------------------|
| `page`    | integer  | `1`         | Page number (min 1)                                                |
| `limit`   | integer  | `50`        | Items per page (1--100)                                            |
| `status`  | string   | --          | Filter by status: `pending`, `in_progress`, `completed`            |
| `priority`| string   | --          | Filter by priority: `high`, `medium`, `low`                        |
| `tags`    | string   | --          | Comma-separated tag IDs                                            |
| `search`  | string   | --          | Case-insensitive search across `title` and `description`           |
| `overdue` | boolean  | `false`     | If `true`, only non-completed tasks with `dueDate < now`           |
| `sort`    | string   | `createdAt` | Sort field (any Task column name)                                  |
| `order`   | string   | `desc`      | Sort direction: `asc` or `desc`                                    |

#### Response (200)

```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Write docs",
      "description": "API documentation",
      "status": "pending",
      "priority": "high",
      "dueDate": "2025-06-01T00:00:00.000Z",
      "tags": [
        { "id": "clx...", "name": "Trabajo", "color": "blue", "createdAt": "2025-01-01T00:00:00.000Z" }
      ],
      "createdAt": "2025-05-01T10:00:00.000Z",
      "updatedAt": "2025-05-01T10:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 1, "totalPages": 1 }
}
```

#### Example

```bash
curl -H "Authorization: Bearer tk_..." \
  "https://example.com/api/v1/tasks?status=pending&priority=high&limit=10&page=1"
```

---

### POST /api/v1/tasks

Create a new task.

**Authentication:** Session or API Key

#### Request Body

| Field         | Type       | Required | Description                                       |
|---------------|------------|----------|---------------------------------------------------|
| `title`       | string     | Yes      | 1--100 characters                                 |
| `description` | string     | No       | Max 500 characters. Defaults to `""`              |
| `status`      | string     | No       | `pending` (default), `in_progress`, `completed`   |
| `priority`    | string     | No       | `high`, `medium` (default), `low`                 |
| `dueDate`     | string\|null | No     | ISO 8601 datetime or `null`. Defaults to `null`   |
| `tagIds`      | string[]   | No       | Array of existing tag IDs. Defaults to `[]`       |

#### Response (201)

```json
{
  "data": {
    "id": "clx...",
    "title": "Write docs",
    "description": "",
    "status": "pending",
    "priority": "medium",
    "dueDate": null,
    "tags": [],
    "createdAt": "2025-05-01T10:00:00.000Z",
    "updatedAt": "2025-05-01T10:00:00.000Z"
  }
}
```

#### Errors

| Status | Condition                           |
|--------|-------------------------------------|
| 400    | Validation failed or invalid tag IDs |
| 401    | Unauthenticated                     |
| 500    | Internal server error               |

#### Example

```bash
curl -X POST -H "Authorization: Bearer tk_..." \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","priority":"low","tagIds":["clx123"]}' \
  https://example.com/api/v1/tasks
```

---

### GET /api/v1/tasks/:id

Get a single task by ID.

**Authentication:** Session or API Key

#### Response (200)

Same shape as a single item in the task list.

#### Errors

| Status | Condition          |
|--------|--------------------|
| 401    | Unauthenticated    |
| 404    | Task not found or does not belong to user |

---

### PATCH /api/v1/tasks/:id

Update a task. All fields are optional.

**Authentication:** Session or API Key

#### Request Body

| Field         | Type         | Required | Description                                     |
|---------------|--------------|----------|-------------------------------------------------|
| `title`       | string       | No       | 1--100 characters                               |
| `description` | string       | No       | Max 500 characters                              |
| `status`      | string       | No       | `pending`, `in_progress`, `completed`            |
| `priority`    | string       | No       | `high`, `medium`, `low`                          |
| `dueDate`     | string\|null | No       | ISO 8601 datetime or `null`                     |
| `tagIds`      | string[]     | No       | Replaces all tags (uses Prisma `set`)            |

#### Response (200)

Returns the full updated task object.

#### Errors

| Status | Condition                           |
|--------|-------------------------------------|
| 400    | Validation failed or invalid tag IDs |
| 401    | Unauthenticated                     |
| 404    | Task not found                      |

#### Note

When `tagIds` is provided, it **replaces** all existing tag associations with the new set (it does not merge).

---

### DELETE /api/v1/tasks/:id

Delete a task.

**Authentication:** Session or API Key

#### Response

`204 No Content` -- empty body.

#### Errors

| Status | Condition       |
|--------|-----------------|
| 401    | Unauthenticated |
| 404    | Task not found  |

---

## 2. Tags

### GET /api/v1/tags

List all tags for the authenticated user, ordered by creation date ascending.

**Authentication:** Session or API Key

#### Response (200)

```json
{
  "data": [
    { "id": "clx...", "name": "Trabajo", "color": "blue", "createdAt": "2025-01-01T00:00:00.000Z" },
    { "id": "clx...", "name": "Personal", "color": "green", "createdAt": "2025-01-01T00:00:00.000Z" }
  ]
}
```

---

### POST /api/v1/tags

Create a new tag.

**Authentication:** Session or API Key

#### Request Body

| Field   | Type   | Required | Description              |
|---------|--------|----------|--------------------------|
| `name`  | string | Yes      | 1--30 characters         |
| `color` | string | Yes      | 1--20 characters (e.g. `"blue"`, `"red"`) |

#### Response (201)

```json
{
  "data": { "id": "clx...", "name": "Urgente", "color": "red", "createdAt": "2025-05-01T10:00:00.000Z" }
}
```

#### Errors

| Status | Condition                          |
|--------|------------------------------------|
| 400    | Validation failed                  |
| 401    | Unauthenticated                    |
| 409    | A tag with this name already exists |
| 500    | Internal server error              |

---

### GET /api/v1/tags/:id

Get a single tag by ID.

**Authentication:** Session or API Key

#### Response (200)

Same shape as a single tag object.

#### Errors

| Status | Condition       |
|--------|-----------------|
| 401    | Unauthenticated |
| 404    | Tag not found   |

---

### PATCH /api/v1/tags/:id

Update a tag. All fields are optional.

**Authentication:** Session or API Key

#### Request Body

| Field   | Type   | Required | Description              |
|---------|--------|----------|--------------------------|
| `name`  | string | No       | 1--30 characters         |
| `color` | string | No       | 1--20 characters         |

#### Response (200)

Returns the updated tag object.

#### Errors

| Status | Condition                              |
|--------|----------------------------------------|
| 400    | Validation failed                      |
| 401    | Unauthenticated                        |
| 404    | Tag not found                          |
| 409    | Another tag with this name already exists |

---

### DELETE /api/v1/tags/:id

Delete a tag. Disconnects the tag from all associated tasks before deleting.

**Authentication:** Session or API Key

#### Response

`204 No Content` -- empty body.

#### Errors

| Status | Condition       |
|--------|-----------------|
| 401    | Unauthenticated |
| 404    | Tag not found   |

---

## 3. Settings

### GET /api/v1/settings

Get the authenticated user's app settings.

**Authentication:** Session or API Key

#### Response (200)

If no settings record exists, returns defaults.

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

---

### PATCH /api/v1/settings

Update settings. All fields are optional; only provided fields are changed. Uses upsert (creates if not present).

**Authentication:** Session or API Key

#### Request Body

| Field                            | Type    | Description                                  |
|----------------------------------|---------|----------------------------------------------|
| `theme`                          | string  | `"system"`, `"light"`, or `"dark"`           |
| `pomodoro.focusMinutes`          | number  | 1--120                                       |
| `pomodoro.shortBreakMinutes`     | number  | 1--30                                        |
| `pomodoro.longBreakMinutes`      | number  | 1--60                                        |
| `pomodoro.longBreakInterval`     | number  | 1--10                                        |
| `pomodoro.totalDurationMinutes`  | number  | 1--480                                       |
| `pomodoro.autoStartNext`         | boolean |                                              |
| `pomodoro.soundEnabled`          | boolean |                                              |
| `notifications.taskReminders`    | boolean |                                              |
| `notifications.dailySummary`     | boolean |                                              |
| `notifications.streakAlert`      | boolean |                                              |

#### Response (200)

Returns the complete settings object (same shape as GET).

#### Errors

| Status | Condition         |
|--------|-------------------|
| 400    | Validation failed |
| 401    | Unauthenticated   |
| 500    | Internal error    |

#### Example

```bash
curl -X PATCH -H "Authorization: Bearer tk_..." \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark","pomodoro":{"focusMinutes":50}}' \
  https://example.com/api/v1/settings
```

---

## 4. Profile

### GET /api/v1/settings/profile

Get the authenticated user's profile.

**Authentication:** Session or API Key

#### Response (200)

```json
{
  "data": {
    "id": "clx...",
    "name": "Carlos Azaustre",
    "email": "carlos@example.com",
    "role": "Developer",
    "language": "es",
    "initials": "CA"
  }
}
```

The `initials` field is computed server-side from the first letter of each word in `name` (max 2 characters).

---

### PATCH /api/v1/settings/profile

Update the user profile. All fields are optional.

**Authentication:** Session or API Key

#### Request Body

| Field      | Type   | Description                           |
|------------|--------|---------------------------------------|
| `name`     | string | 2--50 characters                      |
| `role`     | string | Max 50 characters                     |
| `language` | string | `"es"` or `"en"`                      |

#### Response (200)

Returns the updated profile object (same shape as GET).

#### Errors

| Status | Condition         |
|--------|-------------------|
| 400    | Validation failed |
| 401    | Unauthenticated   |
| 500    | Internal error    |

---

## 5. Pomodoro Sessions

### POST /api/v1/pomodoro/sessions

Record a completed pomodoro session.

**Authentication:** Session or API Key

#### Request Body

| Field              | Type         | Required | Description                                |
|--------------------|--------------|----------|--------------------------------------------|
| `startedAt`        | string       | Yes      | ISO 8601 datetime                          |
| `completedAt`      | string\|null | No       | ISO 8601 datetime or `null`. Default `null`|
| `totalMinutes`     | number       | Yes      | Total duration (min 1)                     |
| `focusMinutes`     | number       | Yes      | Focus time in minutes (min 0)              |
| `sessionsPlanned`  | number       | Yes      | Planned pomodoro count (min 1)             |
| `sessionsCompleted`| number       | Yes      | Completed pomodoro count (min 0)           |
| `taskIds`          | string[]     | No       | Associated task IDs. Default `[]`          |

#### Response (201)

```json
{
  "data": {
    "id": "clx...",
    "startedAt": "2025-05-01T09:00:00.000Z",
    "completedAt": "2025-05-01T09:25:00.000Z",
    "totalMinutes": 25,
    "focusMinutes": 25,
    "sessionsPlanned": 4,
    "sessionsCompleted": 1,
    "taskIds": ["clx123"]
  }
}
```

#### Errors

| Status | Condition                      |
|--------|--------------------------------|
| 400    | Validation failed or invalid task IDs |
| 401    | Unauthenticated                |
| 500    | Internal error                 |

---

### GET /api/v1/pomodoro/sessions

List pomodoro sessions with optional date range filtering.

**Authentication:** Session or API Key

#### Query Parameters

| Parameter | Type    | Default | Description                          |
|-----------|---------|---------|--------------------------------------|
| `from`    | string  | --      | ISO 8601 datetime lower bound        |
| `to`      | string  | --      | ISO 8601 datetime upper bound        |
| `limit`   | integer | `50`    | Max items returned (1--100)          |

#### Response (200)

```json
{
  "data": [
    {
      "id": "clx...",
      "startedAt": "2025-05-01T09:00:00.000Z",
      "completedAt": "2025-05-01T09:25:00.000Z",
      "totalMinutes": 25,
      "focusMinutes": 25,
      "sessionsPlanned": 4,
      "sessionsCompleted": 1,
      "taskIds": []
    }
  ]
}
```

Sessions are sorted by `startedAt` descending.

---

## 6. Pomodoro Stats

### GET /api/v1/pomodoro/stats

Aggregated pomodoro statistics for the authenticated user.

**Authentication:** Session or API Key

#### Query Parameters

| Parameter | Type   | Default | Description                                  |
|-----------|--------|---------|----------------------------------------------|
| `from`    | string | --      | ISO 8601 datetime lower bound (all-time if omitted) |
| `to`      | string | --      | ISO 8601 datetime upper bound                |

#### Response (200)

```json
{
  "data": {
    "totalSessions": 42,
    "totalFocusMinutes": 1050,
    "totalFocusHours": 17.5,
    "averageFocusMinutesPerSession": 25,
    "sessionsThisWeek": 5,
    "focusHoursThisWeek": 2.08
  }
}
```

**Notes:**
- `totalFocusHours` and `focusHoursThisWeek` are rounded to 2 decimal places.
- "This week" is calculated from Monday 00:00 of the current week (Monday-based weeks).
- The `from`/`to` parameters only affect the "all-time" aggregates; the "this week" stats always use the current week.

---

## 7. Analytics

### GET /api/v1/analytics

Dashboard analytics with KPIs, trends, weekly activity chart data, tag distribution, and recent activity feed.

**Authentication:** Session or API Key

#### Query Parameters

| Parameter | Type   | Default       | Description                                              |
|-----------|--------|---------------|----------------------------------------------------------|
| `range`   | string | `last_7_days` | `this_week`, `last_7_days`, `this_month`, `last_30_days` |

#### Response (200)

```json
{
  "data": {
    "kpis": {
      "completedTasks": 12,
      "completionRate": 75,
      "focusHours": 5.5,
      "currentStreak": 3
    },
    "trends": {
      "completedTasks": 20,
      "completionRate": -5,
      "focusHours": 100
    },
    "weeklyActivity": [
      { "date": "2025-05-01", "completed": 3, "pending": 1 },
      { "date": "2025-05-02", "completed": 2, "pending": 0 }
    ],
    "tagDistribution": [
      { "id": "clx...", "name": "Trabajo", "color": "blue", "count": 8 }
    ],
    "recentActivity": [
      {
        "id": "clx...",
        "title": "Write docs",
        "status": "completed",
        "priority": "high",
        "tags": [{ "id": "clx...", "name": "Trabajo", "color": "blue" }],
        "updatedAt": "2025-05-01T10:00:00.000Z"
      }
    ]
  }
}
```

#### Response Fields

| Field                    | Description                                                                  |
|--------------------------|------------------------------------------------------------------------------|
| `kpis.completedTasks`    | Tasks completed in the selected range                                        |
| `kpis.completionRate`    | Percentage of created tasks that were completed (0--100)                      |
| `kpis.focusHours`        | Total pomodoro focus hours in the range (2 decimal places)                   |
| `kpis.currentStreak`     | Consecutive days with at least one completed task (see Streak section below) |
| `trends.*`               | Percentage change compared to the equivalent previous period                 |
| `weeklyActivity`         | Last 7 days (always, regardless of range) with completed and pending counts  |
| `tagDistribution`        | All tags with their total task count (not range-scoped)                      |
| `recentActivity`         | Last 10 updated tasks                                                        |

#### Errors

| Status | Condition                                                               |
|--------|-------------------------------------------------------------------------|
| 400    | Invalid range value                                                     |
| 401    | Unauthenticated                                                         |

#### Example

```bash
curl -H "Authorization: Bearer tk_..." \
  "https://example.com/api/v1/analytics?range=this_month"
```

---

## 8. Data Management

### GET /api/v1/data/export

Export all user data (tasks, tags, settings, pomodoro sessions) as JSON.

**Authentication:** Session or API Key

#### Response (200)

```json
{
  "data": {
    "exportedAt": "2025-05-01T10:00:00.000Z",
    "tasks": [
      {
        "id": "clx...",
        "title": "Example",
        "description": "",
        "status": "PENDING",
        "priority": "MEDIUM",
        "dueDate": null,
        "tags": [{ "id": "clx...", "name": "Trabajo", "color": "blue" }],
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "tags": [
      { "id": "clx...", "name": "Trabajo", "color": "blue", "createdAt": "2025-01-01T00:00:00.000Z" }
    ],
    "settings": {
      "theme": "system",
      "pomodoroFocusMin": 25,
      "pomodoroShortBreak": 5,
      "pomodoroLongBreak": 15,
      "pomodoroLongInterval": 4,
      "pomodoroTotalMin": 240,
      "pomodoroAutoStart": false,
      "pomodoroSoundEnabled": true,
      "taskReminders": true,
      "dailySummary": false,
      "streakAlert": true
    },
    "pomodoroSessions": [
      {
        "id": "clx...",
        "startedAt": "2025-05-01T09:00:00.000Z",
        "completedAt": "2025-05-01T09:25:00.000Z",
        "totalMinutes": 25,
        "focusMinutes": 25,
        "sessionsPlanned": 4,
        "sessionsCompleted": 1,
        "taskIds": []
      }
    ]
  }
}
```

**Note:** The export uses Prisma UPPERCASE enum values for `status` and `priority` (unlike other API endpoints that use lowercase).

---

### POST /api/v1/data/import

Import data, replacing all existing user data. This is a destructive operation.

**Authentication:** Session or API Key

#### Request Body

| Field              | Type     | Required | Description                                        |
|--------------------|----------|----------|----------------------------------------------------|
| `tags`             | array    | No       | `[{ name: string, color: string }]`. Default `[]`  |
| `tasks`            | array    | No       | See task schema below. Default `[]`                 |
| `settings`         | object\|null | No   | Flat settings fields (see export format). Default `null` |
| `pomodoroSessions` | array    | No       | See session schema below. Default `[]`              |

**Task object in import:**

| Field         | Type         | Required | Description                                              |
|---------------|--------------|----------|----------------------------------------------------------|
| `title`       | string       | Yes      |                                                          |
| `description` | string       | No       | Default `""`                                             |
| `status`      | string       | No       | `PENDING` (default), `IN_PROGRESS`, `COMPLETED`          |
| `priority`    | string       | No       | `HIGH`, `MEDIUM` (default), `LOW`                        |
| `dueDate`     | string\|null | No       | ISO 8601 datetime or `null`                              |
| `tags`        | array        | No       | `[{ name: string, color: string }]` -- matched by name   |

**Pomodoro session object in import:**

| Field              | Type         | Required | Description              |
|--------------------|--------------|----------|--------------------------|
| `startedAt`        | string       | Yes      | ISO 8601 datetime        |
| `completedAt`      | string\|null | No       | Default `null`           |
| `totalMinutes`     | number       | Yes      |                          |
| `focusMinutes`     | number       | Yes      |                          |
| `sessionsPlanned`  | number       | Yes      |                          |
| `sessionsCompleted`| number       | Yes      |                          |
| `taskIds`          | string[]     | No       | Default `[]`             |

#### Response (200)

```json
{
  "data": {
    "message": "Datos importados correctamente",
    "summary": {
      "tagsImported": 5,
      "tasksImported": 12,
      "settingsImported": true,
      "pomodoroSessionsImported": 3
    }
  }
}
```

#### Errors

| Status | Condition             |
|--------|-----------------------|
| 400    | Validation failed     |
| 401    | Unauthenticated       |
| 500    | Transaction error     |

---

### DELETE /api/v1/data

Delete all user data (pomodoro sessions, tasks, tags, and settings). Requires a confirmation header.

**Authentication:** Session or API Key

#### Required Headers

| Header             | Value   | Description                                |
|--------------------|---------|--------------------------------------------|
| `X-Confirm-Delete` | `true`  | Must be present to confirm the operation   |

#### Response (200)

```json
{
  "data": {
    "message": "Todos los datos del usuario han sido eliminados"
  }
}
```

#### Errors

| Status | Condition                              |
|--------|----------------------------------------|
| 400    | Missing `X-Confirm-Delete: true` header |
| 401    | Unauthenticated                        |
| 500    | Internal error                         |

#### Example

```bash
curl -X DELETE -H "Authorization: Bearer tk_..." \
  -H "X-Confirm-Delete: true" \
  https://example.com/api/v1/data
```

---

## 9. API Keys

### POST /api/v1/api-keys

Create a new API key for the authenticated user.

**Authentication:** Session or API Key (passed via `request` parameter)

#### Request Body

| Field  | Type   | Required | Description          |
|--------|--------|----------|----------------------|
| `name` | string | Yes      | 1--50 characters     |

#### Response (201)

```json
{
  "data": {
    "id": "clx...",
    "name": "My MCP Key",
    "key": "tk_a1b2c3d4e5...",
    "createdAt": "2025-05-01T10:00:00.000Z"
  }
}
```

**Important:** The full `key` value is returned only in this response. It cannot be retrieved again after creation.

#### Errors

| Status | Condition         |
|--------|-------------------|
| 400    | Validation failed |
| 401    | Unauthenticated   |
| 500    | Internal error    |

---

### GET /api/v1/api-keys

List all API keys for the authenticated user. Keys are masked for security.

**Authentication:** Session or API Key (passed via `request` parameter)

#### Response (200)

```json
{
  "data": [
    {
      "id": "clx...",
      "name": "My MCP Key",
      "keyPreview": "tk_a1b2...f4g5",
      "lastUsed": "2025-05-01T12:00:00.000Z",
      "createdAt": "2025-05-01T10:00:00.000Z"
    }
  ]
}
```

Keys are sorted by `createdAt` descending. The `keyPreview` shows the first 7 characters and last 4 characters.

---

### DELETE /api/v1/api-keys/:id

Revoke (delete) an API key.

**Authentication:** Session or API Key (passed via `request` parameter)

#### Response

`204 No Content` -- empty body.

#### Errors

| Status | Condition                                |
|--------|------------------------------------------|
| 401    | Unauthenticated                          |
| 404    | API key not found or does not belong to user |

---

## 10. Auth -- Registration

### POST /api/auth/register

Register a new user account. This endpoint is outside the `/api/v1/` namespace and does not use the standard response envelope.

**Authentication:** None

**Rate limiting:** 3 requests per hour per IP (sliding window)

#### Request Body

| Field             | Type   | Required | Description                                            |
|-------------------|--------|----------|--------------------------------------------------------|
| `name`            | string | Yes      | 2--50 characters                                       |
| `email`           | string | Yes      | Valid email address                                    |
| `password`        | string | Yes      | Min 8 characters                                       |
| `confirmPassword` | string | Yes      | Must match `password`                                  |

#### Response (201)

```json
{
  "id": "clx...",
  "email": "user@example.com",
  "name": "User Name"
}
```

**Note:** This endpoint does NOT use the `{ data: ... }` envelope. The response is a plain JSON object.

On successful registration, the user is created with:
- 5 default tags: Trabajo (blue), Personal (green), Urgente (red), Reunion (purple), Idea (amber)
- Default settings record

#### Errors

| Status | Condition                                |
|--------|------------------------------------------|
| 400    | Validation failed                        |
| 409    | Email already registered                 |
| 429    | Rate limit exceeded (includes `Retry-After` header in seconds) |
| 500    | Internal error                           |

#### Example

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123","confirmPassword":"secret123"}' \
  https://example.com/api/auth/register
```

---

# Part 2: Internal Methods Reference

## lib/auth-utils.ts -- `getAuthUser()`

```typescript
/**
 * Resolves the authenticated user from either an API key or a session cookie.
 *
 * Uses a dual authentication flow:
 *   1. If a `request` object is provided, checks the Authorization header for
 *      a Bearer token starting with "tk_". Delegates to `authenticateApiKey()`.
 *   2. If no API key is found (or no request was passed), falls back to
 *      NextAuth `auth()` to read the session cookie.
 *   3. If neither method succeeds, returns a pre-built 401 NextResponse.
 *
 * @param request - Optional. The incoming Request object. Required for API key
 *                  authentication. When called from endpoints that only support
 *                  session auth, this can be omitted.
 *
 * @returns A discriminated union:
 *   - `{ user: AuthUser, errorResponse: null }` on success
 *   - `{ user: null, errorResponse: NextResponse }` on failure (401 JSON)
 *
 * @example
 *   // In a route handler:
 *   const { user, errorResponse } = await getAuthUser(request)
 *   if (!user) return errorResponse
 *
 * @remarks
 *   API key auth is tried first so that external clients (MCP servers, CLI
 *   tools) work without cookies. Session auth is the fallback for browser
 *   requests. The `AuthUser` type contains { id, email?, name? }.
 */
```

---

## lib/api-key-auth.ts -- `authenticateApiKey()`

```typescript
/**
 * Authenticate an incoming request via a Bearer API key.
 *
 * Extracts the Authorization header and verifies it starts with "Bearer tk_".
 * Performs a database lookup by the full key string. On success, fires a
 * non-blocking update to set `lastUsed` on the key record and returns the
 * associated user.
 *
 * @param request - The incoming Request object.
 *
 * @returns The user object `{ id, email, name }` if the key is valid,
 *          or `null` if:
 *            - No Authorization header is present
 *            - The header does not start with "Bearer tk_"
 *            - The key is not found in the database
 *
 * @remarks
 *   - The `lastUsed` update is fire-and-forget (`.catch(() => {})`) to avoid
 *     blocking the request or failing authentication if the update fails.
 *   - Key lookup uses `findUnique` on the `key` column, which should have a
 *     unique index for performance.
 *   - The full key is stored in the database (not hashed), matching the `tk_`
 *     prefix convention used during key generation.
 */
```

---

## lib/rate-limit.ts -- `createRateLimiter()`

```typescript
/**
 * Creates a named in-memory sliding window rate limiter.
 *
 * Each call to `createRateLimiter` registers a named store so different
 * endpoints (e.g., "login", "register") maintain independent counters.
 * The returned function accepts an identifier (typically an IP address)
 * and checks whether the request should be allowed.
 *
 * **Algorithm (sliding window):**
 *   1. Look up the entry for the given identifier.
 *   2. Prune all timestamps older than `now - windowMs`.
 *   3. If the remaining count >= `maxRequests`, deny the request and return
 *      `retryAfterMs` (time until the oldest timestamp in the window expires).
 *   4. Otherwise, record the current timestamp and allow the request.
 *
 * @param name   - Unique name for this limiter. Each name gets its own store.
 * @param config - `{ maxRequests: number, windowMs: number }`
 *
 * @returns A check function:
 *   `(identifier: string) => { success: boolean, retryAfterMs?: number }`
 *
 * @example
 *   const limiter = createRateLimiter('login', { maxRequests: 5, windowMs: 60_000 })
 *   const result = limiter(clientIp)
 *   if (!result.success) {
 *     // Return 429 with Retry-After header
 *   }
 *
 * Pre-configured instances exported from this module:
 *   - `loginLimiter`: 5 requests per minute per IP
 *   - `registerLimiter`: 3 requests per hour per IP
 *
 * @remarks
 *   - **In-memory only.** State is lost on server restart and is not shared
 *     across multiple server instances. For production multi-instance
 *     deployments, replace with a Redis-backed solution.
 *   - `getClientIp()` helper extracts the IP from `x-forwarded-for` or
 *     `x-real-ip` headers, falling back to `"unknown"`.
 */
```

---

## lib/api-mappers.ts -- `taskToApi()` and `tagToApi()`

```typescript
/**
 * Transform a Prisma Task record (with included tags) to the API response
 * format.
 *
 * Performs the following mappings:
 *   - `status`: Converts Prisma UPPERCASE enum (`PENDING`, `IN_PROGRESS`,
 *     `COMPLETED`) to lowercase API format (`pending`, `in_progress`,
 *     `completed`) via `.toLowerCase()`.
 *   - `priority`: Converts `HIGH`/`MEDIUM`/`LOW` to `high`/`medium`/`low`.
 *   - `dueDate`: Converts Date to ISO 8601 string, or `null`.
 *   - `tags`: Maps each included tag through `tagToApi()`.
 *   - `createdAt`, `updatedAt`: Convert Date to ISO 8601 string.
 *
 * The reverse direction (API -> Prisma) is handled by lookup maps:
 *   - `statusToPrisma`: `{ pending: 'PENDING', in_progress: 'IN_PROGRESS', completed: 'COMPLETED' }`
 *   - `priorityToPrisma`: `{ high: 'HIGH', medium: 'MEDIUM', low: 'LOW' }`
 *
 * @param task - Prisma Task object with `tags` relation included.
 * @returns API-formatted task object with lowercase enums and ISO date strings.
 */

/**
 * Transform a Prisma Tag record to the API response format.
 *
 * @param tag - Prisma Tag object.
 * @returns `{ id, name, color, createdAt }` with `createdAt` as ISO string.
 */
```

---

## lib/api-client.ts -- `request()` and `requestPaginated()`

```typescript
/**
 * Generic fetch wrapper for non-paginated API endpoints.
 *
 * Sends a request to `${API_BASE}${endpoint}` with JSON content-type header
 * merged with any caller-provided headers.
 *
 * **Response unwrapping logic:**
 *   1. If the HTTP status is not ok, parses the error JSON and throws an
 *      `ApiError` with the status code and error message.
 *   2. If the status is `204 No Content`, returns `undefined` (cast to `T`).
 *   3. Otherwise, parses JSON and returns `json.data ?? json`. This means
 *      it automatically unwraps the `{ data: ... }` envelope, but also
 *      handles responses that don't use the envelope (e.g., the register
 *      endpoint).
 *
 * @typeParam T - Expected return type after unwrapping.
 * @param endpoint - Path relative to `/api/v1` (e.g., `/tasks`).
 * @param options  - Standard `RequestInit` options (method, body, headers, etc.).
 * @returns The unwrapped response data.
 * @throws {ApiError} On non-2xx responses.
 */

/**
 * Fetch wrapper for paginated API endpoints.
 *
 * Similar to `request()`, but returns the raw JSON response without
 * unwrapping `data`. This preserves the full paginated structure:
 * `{ data: T[], pagination: { page, limit, total, totalPages } }`.
 *
 * @typeParam T - Type of individual items in the `data` array.
 * @param endpoint - Path relative to `/api/v1`.
 * @param options  - Standard `RequestInit` options.
 * @returns `PaginatedResponse<T>` with both `data` and `pagination` fields.
 * @throws {ApiError} On non-2xx responses.
 */
```

---

## hooks/useSettings.ts -- `transformLegacyExport()`

```typescript
/**
 * Transform a legacy localStorage export into the current API import format.
 *
 * **Background:** Before the API backend was introduced, Task-It stored data
 * in localStorage. The export format used double-serialized JSON: the top-level
 * object had string values like `{ tasks: '[ ... ]', tags: '[ ... ]' }` instead
 * of actual arrays. This function bridges that format to the current
 * `ImportPayload` schema.
 *
 * **Detection:** The caller checks `typeof data.tasks === 'string'` or
 * `typeof data.tags === 'string'` to decide whether to invoke this transform.
 *
 * **Transformation steps:**
 *   1. Parse `data.tags` (a JSON string) into `LegacyTag[]` objects.
 *   2. Parse `data.tasks` (a JSON string) into `LegacyTask[]` objects.
 *   3. Build a lookup map from legacy tag ID -> `{ name, color }`.
 *   4. Map each legacy task:
 *      - Convert `status` from lowercase to UPPERCASE using `STATUS_MAP`.
 *      - Convert `priority` from lowercase to UPPERCASE using `PRIORITY_MAP`.
 *      - Resolve tag IDs to `{ name, color }` objects via the lookup map
 *        (the import endpoint matches tags by name, not by ID).
 *   5. Return `{ tags, tasks }` in `ImportPayload` format.
 *
 * @param data - The raw parsed JSON from a legacy export file, with string-
 *               encoded arrays for `tasks` and `tags`.
 * @returns An `ImportPayload` object suitable for `POST /api/v1/data/import`.
 *
 * @remarks
 *   - Legacy exports do not contain settings or pomodoro sessions, so the
 *     returned payload only includes `tags` and `tasks`.
 *   - If a task references a tag ID not found in the tag list, that tag
 *     reference is silently dropped (filtered out).
 */
```

---

## hooks/useTasks.ts -- Optimistic Update Pattern

```typescript
/**
 * OPTIMISTIC UPDATE PATTERN in useTasks hook
 *
 * All mutation methods (addTask, updateTask, deleteTask) follow a consistent
 * three-phase optimistic update pattern to provide instant UI feedback while
 * syncing with the server in the background.
 *
 * --- addTask(data: TaskFormData) ---
 *
 *   Phase 1 - Optimistic insert:
 *     Generate a temporary ID (`temp-<uuid>`) and immediately append a
 *     temporary Task object to the local state array.
 *
 *   Phase 2 - Server sync:
 *     Send POST /api/v1/tasks. On success, replace the temp task in the
 *     array with the real server-returned task (which has the permanent ID,
 *     server timestamps, and resolved tag objects).
 *
 *   Phase 3 - Rollback on error:
 *     Remove the temp task from the array by filtering out the temp ID.
 *     Set the error state and re-throw the error.
 *
 * --- updateTask(id: string, data: Partial<TaskFormData>) ---
 *
 *   Phase 1 - Optimistic update:
 *     Snapshot the current task. Apply the partial update to local state
 *     immediately with a new `updatedAt` timestamp.
 *
 *   Phase 2 - Server sync:
 *     Send PATCH /api/v1/tasks/:id. On success, replace the optimistic
 *     version with the server response.
 *
 *   Phase 3 - Rollback on error:
 *     Restore the snapshot (previous task state). Set error and re-throw.
 *
 * --- deleteTask(id: string) ---
 *
 *   Phase 1 - Optimistic removal:
 *     Snapshot the entire tasks array. Remove the target task from state
 *     immediately.
 *
 *   Phase 2 - Server sync:
 *     Send DELETE /api/v1/tasks/:id. On success, return true.
 *
 *   Phase 3 - Rollback on error:
 *     Restore the full snapshot array. Set error and re-throw.
 *
 * NOTES:
 *   - Temporary IDs use the `temp-` prefix and are generated via
 *     `crypto.randomUUID()` with a fallback to `Date.now()` + random string.
 *   - The `mapApiTask()` helper converts API response objects (with full tag
 *     objects) to frontend Task objects (with tag ID arrays).
 *   - All methods re-throw errors after rollback, allowing callers to handle
 *     them (e.g., show a toast notification).
 */
```

---

## app/api/v1/data/import/route.ts -- Transaction Import Flow

```typescript
/**
 * DATA IMPORT TRANSACTION FLOW
 *
 * The import endpoint uses a Prisma interactive transaction (`$transaction`)
 * to ensure atomicity: either ALL data is replaced successfully, or the
 * entire operation is rolled back, leaving the user's data unchanged.
 *
 * Transaction steps (executed sequentially within a single transaction):
 *
 *   1. DELETE existing data:
 *      - pomodoroSession.deleteMany({ userId })
 *      - task.deleteMany({ userId })
 *      - tag.deleteMany({ userId })
 *      - userSettings.deleteMany({ userId })
 *
 *      Order matters: sessions and tasks must be deleted before tags to
 *      avoid foreign key constraint violations on tag relationships.
 *
 *   2. IMPORT tags:
 *      Create each tag individually and build a `Map<string, string>` from
 *      tag name to new tag ID. This map is used in step 3 to reconnect
 *      tasks with their tags.
 *
 *   3. IMPORT tasks:
 *      For each task, resolve its `tags[].name` references to the new tag
 *      IDs via the name->ID map from step 2. Tags that don't match are
 *      silently skipped. Tasks are created with `connect` for tag relations.
 *
 *   4. IMPORT settings:
 *      If `data.settings` is non-null, create a new UserSettings record
 *      with the provided values. Omitted fields use Prisma schema defaults.
 *
 *   5. IMPORT pomodoro sessions:
 *      Create each session individually. The `taskIds` field is stored as-is
 *      (no validation against imported task IDs since they reference the
 *      original IDs from the export, not the newly created ones).
 *
 * Return value: A summary object with counts of imported entities.
 *
 * IMPORTANT BEHAVIORS:
 *   - This is a FULL REPLACEMENT, not a merge. All existing data is deleted.
 *   - Tag matching between tasks and tags is done by NAME, not by ID.
 *     This enables cross-account imports and legacy format compatibility.
 *   - If the transaction fails at any point, all changes are rolled back.
 *   - The Zod schema validates the entire payload upfront before the
 *     transaction begins.
 */
```

---

## app/api/v1/analytics/route.ts -- Streak Calculation and Trend Computation

```typescript
/**
 * STREAK CALCULATION -- computeStreak(userId)
 *
 * Counts consecutive days (going backwards from today) on which the user
 * completed at least one task.
 *
 * Algorithm:
 *   1. Start at today (midnight to 23:59:59.999).
 *   2. Count completed tasks (status = COMPLETED) updated within that day.
 *   3. If count > 0, increment the streak and move to the previous day.
 *   4. If count === 0:
 *      - Special case: if this is day 0 (today) and no tasks are completed
 *        yet, skip today without breaking the streak. This prevents the
 *        streak from resetting to 0 at midnight before the user has had a
 *        chance to complete a task.
 *      - For any other day, the streak is broken -- stop the loop.
 *   5. Search up to 365 days back to cap computation cost.
 *
 * @param userId - The user ID to compute the streak for.
 * @returns The streak count (number of consecutive days).
 *
 * PERFORMANCE NOTE: This makes up to 365 individual COUNT queries. For
 * production optimization, consider pre-computing daily summaries or using
 * a single aggregation query grouped by date.
 */

/**
 * TREND COMPUTATION -- computeTrend(current, previous)
 *
 * Calculates the percentage change between a current and previous period
 * value for use in KPI trend indicators.
 *
 * Formula:
 *   - If `previous === 0` and `current > 0`: returns `100` (100% increase)
 *   - If `previous === 0` and `current === 0`: returns `0` (no change)
 *   - Otherwise: `Math.round(((current - previous) / previous) * 100)`
 *
 * The result is an integer percentage. Positive values indicate improvement,
 * negative values indicate decline.
 *
 * @param current  - The metric value for the current period.
 * @param previous - The metric value for the equivalent previous period.
 * @returns Integer percentage change (e.g., `20` means +20%, `-15` means -15%).
 *
 * DATE RANGE LOGIC -- getDateRange(range)
 *
 * Computes both the current period and the equivalent previous period for
 * trend comparison:
 *
 *   | Range        | Current Period              | Previous Period               |
 *   |--------------|-----------------------------|-------------------------------|
 *   | this_week    | Monday 00:00 to now         | Previous Mon 00:00 to Sun 23:59 |
 *   | last_7_days  | 6 days ago to now           | 13 days ago to 7 days ago     |
 *   | this_month   | 1st of month to now         | 1st of prev month to end of prev month |
 *   | last_30_days | 29 days ago to now          | 59 days ago to 30 days ago    |
 */
```
