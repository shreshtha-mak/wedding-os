import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Person, TaskStatus, TimelineItem, TimelineItemInsert } from '../../types/database'

export interface TimelineItemWithPerson extends TimelineItem {
  responsible_person: Pick<Person, 'id' | 'name'> | null
}

export function useEventTimeline(eventId: string | undefined) {
  return useQuery({
    queryKey: ['timeline_items', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timeline_items')
        .select('*, responsible_person:people(id, name)')
        .eq('event_id', eventId as string)
        .order('start_time', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data as unknown as TimelineItemWithPerson[]
    },
  })
}

export function useCreateTimelineItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item: TimelineItemInsert) => {
      const { error } = await supabase.from('timeline_items').insert(item)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timeline_items', variables.event_id] })
    },
  })
}

// Lightweight (status + event_id only) so the Events list can compute
// per-event readiness without pulling every joined task field for all
// events at once.
export function useTaskStatusesByEvent() {
  return useQuery({
    queryKey: ['tasks', 'statuses-by-event'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('event_id, status')
      if (error) throw error
      return data as { event_id: string | null; status: TaskStatus }[]
    },
  })
}
