import { z } from 'zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { apiClient } from '../api-client.js'

export function registerTaskTools(server: McpServer) {
  // create_task - Create a new task
  server.tool(
    'create_task',
    'Create a new task in Task-It',
    {
      title: z.string().describe('Task title (required)'),
      description: z.string().optional().describe('Detailed description'),
      priority: z.enum(['high', 'medium', 'low']).optional().describe('Task priority (default: medium)'),
      dueDate: z.string().optional().describe('Due date in ISO 8601 format (e.g. 2026-02-15)'),
      tags: z.array(z.string()).optional().describe('Array of tag names to associate'),
    },
    async ({ title, description, priority, dueDate, tags }) => {
      try {
        const task = await apiClient.createTask({
          title,
          description,
          priority,
          dueDate,
          tags,
        })

        const parts = [
          `Task created successfully:`,
          `  ID: ${task.id}`,
          `  Title: "${task.title}"`,
          `  Priority: ${task.priority ?? 'medium'}`,
          `  Status: ${task.status}`,
        ]
        if (task.dueDate) parts.push(`  Due: ${task.dueDate}`)
        if (task.tags?.length) parts.push(`  Tags: ${task.tags.map((t: any) => t.name ?? t).join(', ')}`)

        return {
          content: [{ type: 'text' as const, text: parts.join('\n') }],
        }
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Error creating task: ${(error as Error).message}` }],
          isError: true,
        }
      }
    }
  )

  // list_tasks - List tasks with filters
  server.tool(
    'list_tasks',
    'List tasks with optional filters (status, priority, search, overdue, limit)',
    {
      status: z.enum(['pending', 'in_progress', 'completed', 'all']).optional().describe('Filter by status'),
      priority: z.enum(['high', 'medium', 'low', 'all']).optional().describe('Filter by priority'),
      search: z.string().optional().describe('Search in title and description'),
      overdue: z.boolean().optional().describe('Show only overdue tasks'),
      limit: z.number().optional().describe('Maximum number of results'),
    },
    async (params) => {
      try {
        const queryParams: Record<string, string> = {}
        if (params.status && params.status !== 'all') queryParams.status = params.status
        if (params.priority && params.priority !== 'all') queryParams.priority = params.priority
        if (params.search) queryParams.search = params.search
        if (params.overdue) queryParams.overdue = 'true'
        if (params.limit) queryParams.limit = params.limit.toString()

        const tasks = await apiClient.getTasks(queryParams)

        if (tasks.length === 0) {
          return {
            content: [{ type: 'text' as const, text: 'No tasks found matching the given filters.' }],
          }
        }

        const formatted = tasks.map((t: any) => {
          const parts = [`- [${t.status}] ${t.title} (${t.priority})`]
          if (t.dueDate) parts.push(`  Due: ${t.dueDate}`)
          if (t.tags?.length) parts.push(`  Tags: ${t.tags.map((tag: any) => tag.name ?? tag).join(', ')}`)
          parts.push(`  ID: ${t.id}`)
          return parts.join('\n')
        }).join('\n\n')

        return {
          content: [{
            type: 'text' as const,
            text: `${tasks.length} task(s) found:\n\n${formatted}`,
          }],
        }
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Error listing tasks: ${(error as Error).message}` }],
          isError: true,
        }
      }
    }
  )

  // update_task - Update task fields
  server.tool(
    'update_task',
    'Update an existing task (provide taskId and the fields to update)',
    {
      taskId: z.string().describe('ID of the task to update'),
      title: z.string().optional().describe('New title'),
      description: z.string().optional().describe('New description'),
      status: z.enum(['pending', 'in_progress', 'completed']).optional().describe('New status'),
      priority: z.enum(['high', 'medium', 'low']).optional().describe('New priority'),
      dueDate: z.string().nullable().optional().describe('New due date (ISO 8601) or null to remove'),
    },
    async ({ taskId, ...updates }) => {
      try {
        const task = await apiClient.updateTask(taskId, updates)

        const parts = [
          `Task updated successfully:`,
          `  ID: ${task.id}`,
          `  Title: "${task.title}"`,
          `  Status: ${task.status}`,
          `  Priority: ${task.priority}`,
        ]
        if (task.dueDate) parts.push(`  Due: ${task.dueDate}`)

        return {
          content: [{ type: 'text' as const, text: parts.join('\n') }],
        }
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Error updating task: ${(error as Error).message}` }],
          isError: true,
        }
      }
    }
  )

  // complete_task - Shortcut to mark a task as completed
  server.tool(
    'complete_task',
    'Mark a task as completed (shortcut for update_task with status=completed)',
    {
      taskId: z.string().describe('ID of the task to complete'),
    },
    async ({ taskId }) => {
      try {
        const task = await apiClient.updateTask(taskId, { status: 'completed' })

        return {
          content: [{
            type: 'text' as const,
            text: `Task completed: "${task.title}" (ID: ${task.id})`,
          }],
        }
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Error completing task: ${(error as Error).message}` }],
          isError: true,
        }
      }
    }
  )

  // delete_task - Delete a task by ID
  server.tool(
    'delete_task',
    'Delete a task permanently by its ID',
    {
      taskId: z.string().describe('ID of the task to delete'),
    },
    async ({ taskId }) => {
      try {
        await apiClient.deleteTask(taskId)

        return {
          content: [{
            type: 'text' as const,
            text: `Task deleted successfully (ID: ${taskId}).`,
          }],
        }
      } catch (error) {
        return {
          content: [{ type: 'text' as const, text: `Error deleting task: ${(error as Error).message}` }],
          isError: true,
        }
      }
    }
  )
}
