import { TaskStatus, TaskPriority } from '@/lib/generated/prisma/client'
import type { Task, Tag } from '@/lib/generated/prisma/client'

// Map API lowercase to Prisma UPPERCASE
export const statusToPrisma: Record<string, TaskStatus> = {
  pending: 'PENDING',
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
}

export const priorityToPrisma: Record<string, TaskPriority> = {
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
}

// Transform Prisma Task to API response format
export function taskToApi(task: Task & { tags?: Tag[] }) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status.toLowerCase().replace('_', '_') as string,
    priority: task.priority.toLowerCase() as string,
    dueDate: task.dueDate?.toISOString() ?? null,
    tags: task.tags?.map(tagToApi) ?? [],
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  }
}

export function tagToApi(tag: Tag) {
  return {
    id: tag.id,
    name: tag.name,
    color: tag.color,
    createdAt: tag.createdAt.toISOString(),
  }
}
