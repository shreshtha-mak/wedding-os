import type { Task } from '../../types/database'

export interface EventReadiness {
  // null means "no tasks yet", distinct from 0% ("everything's incomplete") —
  // an event with zero tasks isn't unready, it just has no signal yet.
  percent: number | null
  completed: number
  total: number
}

// V1 formula: completed tasks / total tasks for the event — the simple
// starting point the spec explicitly allows. This is intentionally isolated
// here so it can grow into the full weighted model (Decisions/Vendors/Menu/
// Decor/Guests/Accommodation/Transportation/Tasks/Outfits/Things to
// Take/Finances/Timeline) once those modules exist, without call sites
// having to change.
export function computeEventReadiness(tasks: Pick<Task, 'status'>[]): EventReadiness {
  const total = tasks.length
  if (total === 0) return { percent: null, completed: 0, total: 0 }
  const completed = tasks.filter((t) => t.status === 'Completed').length
  return { percent: Math.round((completed / total) * 100), completed, total }
}

export function readinessColor(percent: number | null): string {
  if (percent === null) return 'gray'
  if (percent >= 80) return 'green'
  if (percent >= 50) return 'yellow'
  return 'red'
}
