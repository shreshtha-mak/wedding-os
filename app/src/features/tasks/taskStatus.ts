import dayjs from 'dayjs'
import type { Task } from '../../types/database'

export type DueIndicator = 'Overdue' | 'Due today' | 'Due soon' | 'Completed' | null

// Centralized so Home and Tasks always agree on what "overdue" means
// (spec: "derived values must be calculated consistently").
export function dueIndicator(task: Pick<Task, 'status' | 'due_date'>): DueIndicator {
  if (task.status === 'Completed') return 'Completed'
  if (!task.due_date) return null

  const due = dayjs(task.due_date).startOf('day')
  const today = dayjs().startOf('day')
  const diff = due.diff(today, 'day')

  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Due today'
  if (diff <= 3) return 'Due soon'
  return null
}

export function dueIndicatorColor(indicator: DueIndicator): string {
  switch (indicator) {
    case 'Overdue':
      return 'red'
    case 'Due today':
      return 'orange'
    case 'Due soon':
      return 'yellow'
    case 'Completed':
      return 'green'
    default:
      return 'gray'
  }
}

export function priorityColor(priority: Task['priority']): string {
  switch (priority) {
    case 'Critical':
      return 'red'
    case 'High':
      return 'orange'
    case 'Medium':
      return 'blue'
    case 'Low':
      return 'gray'
  }
}
