# @task-it/mcp-server

MCP (Model Context Protocol) server for Task-It. This server allows AI agents like Claude Code and Claude Desktop to interact with your Task-It tasks programmatically -- creating, listing, updating, and deleting tasks through natural language.

## How It Works

The MCP server acts as a bridge between AI agents and the Task-It REST API. It communicates with the agent via stdio (JSON-RPC) and makes authenticated HTTP requests to the Task-It API on your behalf.

```
+----------------+     MCP (stdio)     +----------------+     HTTP     +----------------+
|  Claude Code   | <=================> |  Task-It MCP   | ==========> |  Task-It API   |
|  Claude Desktop|    JSON-RPC         |  Server        |   REST      |  (Next.js)     |
+----------------+                     +----------------+             +----------------+
```

## Installation

From the repository root:

```bash
cd mcp-server
npm install
npm run build
```

This compiles the TypeScript source into `dist/`.

For development with live reload:

```bash
npm run dev
```

## Configuration

The MCP server requires two environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `TASKIT_API_KEY` | Your personal API key (generate from Task-It Settings) | `""` |
| `TASKIT_API_URL` | Base URL of the Task-It instance | `http://localhost:3000` |

### Generating an API Key

1. Open Task-It in your browser
2. Go to **Settings** > **API Keys**
3. Click **Create new API Key**
4. Give it a name (e.g., "Claude Code")
5. Copy the key (it starts with `tk_`) -- it is only shown once

## Claude Code Setup

Add the following to your project's `.claude/settings.json` or global Claude Code settings:

```json
{
  "mcpServers": {
    "task-it": {
      "command": "node",
      "args": ["/absolute/path/to/task-it/mcp-server/dist/index.js"],
      "env": {
        "TASKIT_API_KEY": "tk_your_api_key_here",
        "TASKIT_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

Replace `/absolute/path/to/task-it` with the actual path to your Task-It repository.

## Claude Desktop Setup

Add to your Claude Desktop configuration file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "task-it": {
      "command": "node",
      "args": ["/absolute/path/to/task-it/mcp-server/dist/index.js"],
      "env": {
        "TASKIT_API_KEY": "tk_your_api_key_here",
        "TASKIT_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

## Available Tools

### Task Management

| Tool | Description | Required Parameters |
|------|-------------|---------------------|
| `create_task` | Create a new task | `title` |
| `list_tasks` | List tasks with filters | (none -- all filters optional) |
| `update_task` | Update task fields | `taskId` |
| `complete_task` | Mark a task as completed | `taskId` |
| `delete_task` | Delete a task permanently | `taskId` |

#### `create_task`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Task title |
| `description` | string | No | Detailed description |
| `priority` | `high` \| `medium` \| `low` | No | Priority level (default: medium) |
| `dueDate` | string | No | Due date in ISO 8601 format |
| `tags` | string[] | No | Tag names to associate |

#### `list_tasks`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | `pending` \| `in_progress` \| `completed` \| `all` | No | Filter by status |
| `priority` | `high` \| `medium` \| `low` \| `all` | No | Filter by priority |
| `search` | string | No | Search in title and description |
| `overdue` | boolean | No | Show only overdue tasks |
| `limit` | number | No | Maximum number of results |

#### `update_task`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | string | Yes | ID of the task to update |
| `title` | string | No | New title |
| `description` | string | No | New description |
| `status` | `pending` \| `in_progress` \| `completed` | No | New status |
| `priority` | `high` \| `medium` \| `low` | No | New priority |
| `dueDate` | string \| null | No | New due date or null to remove |

#### `complete_task`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | string | Yes | ID of the task to complete |

#### `delete_task`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | string | Yes | ID of the task to delete |

### Tag Management

| Tool | Description | Required Parameters |
|------|-------------|---------------------|
| `list_tags` | List all available tags | (none) |
| `create_tag` | Create a new tag | `name`, `color` |

#### `create_tag`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Tag name (max 20 characters) |
| `color` | enum | Yes | One of: `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose` |

## Available Resources

| Resource URI | Description |
|--------------|-------------|
| `taskit://summary` | Overview of task counts by status and overdue count |
| `taskit://tasks/pending` | Detailed markdown table of all pending tasks |

## Usage Examples

Once configured, you can interact with Task-It through your AI agent naturally:

### Creating tasks

> "Create a task to review the pull request with high priority, due tomorrow"

The agent will call `create_task` with the appropriate parameters.

### Listing and filtering

> "Show me all my overdue tasks"

> "List high priority pending tasks"

### Updating tasks

> "Mark the task with ID abc123 as completed"

> "Change the priority of task xyz789 to high"

### Working with tags

> "Create a tag called 'frontend' with blue color"

> "List all my tags"

### Getting an overview

The agent can read the `taskit://summary` resource to get a quick overview:

> "What's the status of my tasks?"

## Development

```bash
# Run in development mode with tsx (auto-reload)
npm run dev

# Build for production
npm run build

# The compiled output goes to dist/
```

## Troubleshooting

- **"Unauthorized" errors**: Make sure your `TASKIT_API_KEY` is valid and not revoked. You can check your keys in Task-It Settings.
- **Connection refused**: Ensure the Task-It app is running and `TASKIT_API_URL` points to the correct address.
- **MCP server not appearing in Claude**: Verify the path in your settings JSON is absolute and the `dist/index.js` file exists (run `npm run build` first).
