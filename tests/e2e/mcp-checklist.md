# E2E MCP Testing Checklist

Manual end-to-end testing checklist for the Task-It MCP Server integration.

## Prerequisites

- [ ] PostgreSQL running and accessible
- [ ] Database migrated (`npm run db:push` or `npm run db:migrate`)
- [ ] At least one user seeded (`npm run db:seed`)
- [ ] API Key generated for the test user (via Settings > API Keys)
- [ ] MCP Server built (`npm run mcp:build`)
- [ ] Next.js dev server running (`npm run dev`)

## 1. MCP Server Connection

- [ ] MCP Server starts without errors
- [ ] Server registers all expected tools (list-tasks, create-task, update-task, delete-task, list-tags, create-tag, etc.)
- [ ] Server connects using the configured API key

## 2. Task Operations via MCP

### List Tasks
- [ ] `list-tasks` returns all tasks for the authenticated user
- [ ] Pagination parameters work (page, limit)
- [ ] Filter by status works (pending, in_progress, completed)
- [ ] Filter by priority works (high, medium, low)
- [ ] Search filter works (title and description)

### Create Task
- [ ] `create-task` creates a new task with title only
- [ ] `create-task` with all fields (title, description, status, priority, dueDate, tagIds)
- [ ] Created task appears in subsequent `list-tasks` call
- [ ] Invalid data returns appropriate error

### Update Task
- [ ] `update-task` updates title
- [ ] `update-task` updates status
- [ ] `update-task` updates priority
- [ ] `update-task` adds/removes tags
- [ ] Non-existent task ID returns 404

### Delete Task
- [ ] `delete-task` removes the task
- [ ] Deleted task no longer appears in `list-tasks`
- [ ] Non-existent task ID returns 404

## 3. Tag Operations via MCP

### List Tags
- [ ] `list-tags` returns all tags for the authenticated user

### Create Tag
- [ ] `create-tag` creates a new tag with name and color
- [ ] Duplicate tag name returns 409

### Update Tag
- [ ] `update-tag` updates tag name
- [ ] `update-tag` updates tag color

### Delete Tag
- [ ] `delete-tag` removes the tag
- [ ] Tag is disconnected from tasks before deletion

## 4. Settings Operations via MCP (if exposed)

- [ ] Get settings returns current user settings
- [ ] Update theme setting
- [ ] Update pomodoro settings
- [ ] Get profile returns user profile data

## 5. Authentication & Security

- [ ] Requests without API key are rejected (401)
- [ ] Requests with invalid API key are rejected (401)
- [ ] User can only access their own data (task isolation)
- [ ] User can only access their own tags (tag isolation)

## 6. Error Handling

- [ ] Network errors are handled gracefully
- [ ] Invalid JSON payloads return 400
- [ ] Server errors return 500 with appropriate message
- [ ] MCP Server reports errors back to the LLM client

## 7. Cross-Functional

- [ ] Task created via MCP appears in the web UI
- [ ] Task created in web UI appears via MCP `list-tasks`
- [ ] Tag changes via MCP reflect in the web UI
- [ ] Settings changed via MCP reflect in the web UI

## Test Results

| Area | Pass | Fail | Notes |
|------|------|------|-------|
| MCP Connection | | | |
| Task CRUD | | | |
| Tag CRUD | | | |
| Settings | | | |
| Auth & Security | | | |
| Error Handling | | | |
| Cross-Functional | | | |

**Tested by:** _______________
**Date:** _______________
**MCP Server Version:** _______________
**API Version:** v1
