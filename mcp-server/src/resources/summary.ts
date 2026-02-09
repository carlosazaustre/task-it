import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { apiClient } from '../api-client.js'

export function registerResources(server: McpServer) {
  // taskit://summary - Overview of task counts by status + overdue
  server.resource(
    'summary',
    'taskit://summary',
    async (uri) => {
      try {
        const tasks = await apiClient.getTasks()

        const pending = tasks.filter((t: any) => t.status === 'pending').length
        const inProgress = tasks.filter((t: any) => t.status === 'in_progress').length
        const completed = tasks.filter((t: any) => t.status === 'completed').length
        const overdue = tasks.filter((t: any) =>
          t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
        ).length

        const text = [
          'Task-It Summary',
          '===============',
          '',
          `Total tasks: ${tasks.length}`,
          `  Pending:     ${pending}`,
          `  In progress: ${inProgress}`,
          `  Completed:   ${completed}`,
          `  Overdue:     ${overdue}`,
          '',
          overdue > 0
            ? `WARNING: You have ${overdue} overdue task(s)!`
            : 'All tasks are on track.',
        ].join('\n')

        return {
          contents: [{
            uri: uri.href,
            text,
            mimeType: 'text/plain',
          }],
        }
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Error fetching summary: ${(error as Error).message}`,
            mimeType: 'text/plain',
          }],
        }
      }
    }
  )

  // taskit://tasks/pending - Detailed list of pending tasks
  server.resource(
    'pending-tasks',
    'taskit://tasks/pending',
    async (uri) => {
      try {
        const tasks = await apiClient.getTasks({ status: 'pending' })

        if (tasks.length === 0) {
          return {
            contents: [{
              uri: uri.href,
              text: 'No pending tasks. You are all caught up!',
              mimeType: 'text/plain',
            }],
          }
        }

        const header = [
          'Pending Tasks',
          '=============',
          '',
          `| # | Title | Priority | Due Date | Tags |`,
          `|---|-------|----------|----------|------|`,
        ]

        const rows = tasks.map((t: any, i: number) => {
          const tags = t.tags?.map((tag: any) => tag.name ?? tag).join(', ') || '-'
          const due = t.dueDate ? t.dueDate.split('T')[0] : '-'
          const isOverdue = t.dueDate && new Date(t.dueDate) < new Date()
          const dueDisplay = isOverdue ? `${due} (OVERDUE)` : due
          return `| ${i + 1} | ${t.title} | ${t.priority} | ${dueDisplay} | ${tags} |`
        })

        const footer = [
          '',
          `Total: ${tasks.length} pending task(s)`,
        ]

        const text = [...header, ...rows, ...footer].join('\n')

        return {
          contents: [{
            uri: uri.href,
            text,
            mimeType: 'text/plain',
          }],
        }
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Error fetching pending tasks: ${(error as Error).message}`,
            mimeType: 'text/plain',
          }],
        }
      }
    }
  )
}
