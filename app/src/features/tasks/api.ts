import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type { EventRow, Person, Task, TaskCategory, TaskInsert } from '../../types/database'

export interface TaskWithRelations extends Task {
  assigned_person: Pick<Person, 'id' | 'name'> | null
  category: Pick<TaskCategory, 'id' | 'name'> | null
  event: Pick<EventRow, 'id' | 'name'> | null
}

const TASK_SELECT = `
  *,
  assigned_person:people!tasks_assigned_person_id_fkey(id, name),
  category:task_categories(id, name),
  event:events(id, name)
`

export function useTasks(scope: 'all' | 'mine', personId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', scope, personId],
    enabled: scope === 'all' || !!personId,
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select(TASK_SELECT)
        .order('due_date', { ascending: true, nullsFirst: false })

      if (scope === 'mine' && personId) {
        query = query.eq('assigned_person_id', personId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as unknown as TaskWithRelations[]
    },
  })
}

export function useTasksForEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', 'event', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(TASK_SELECT)
        .eq('event_id', eventId as string)
        .order('due_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data as unknown as TaskWithRelations[]
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (task: TaskInsert) => {
      const { data, error } = await supabase.from('tasks').insert(task).select('id').single()
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      logActivity('task', data.id, 'created', `added task "${variables.name}"`)
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      updates,
      completedBy,
      becameCompleted,
    }: {
      id: string
      updates: Partial<TaskInsert>
      completedBy: string
      becameCompleted: boolean
      taskName: string
    }) => {
      const { error } = await supabase
        .from('tasks')
        .update(becameCompleted ? { ...updates, completed_by: completedBy } : updates)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      if (variables.becameCompleted) {
        logActivity('task', variables.id, 'completed', `completed "${variables.taskName}"`)
      } else {
        logActivity('task', variables.id, 'updated', `updated "${variables.taskName}"`)
      }
    },
  })
}

export function useCompleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, completedBy }: { id: string; completedBy: string; taskName: string }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'Completed', completed_by: completedBy })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      logActivity('task', variables.id, 'completed', `completed "${variables.taskName}"`)
    },
  })
}
