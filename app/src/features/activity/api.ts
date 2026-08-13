import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { ActivityLogEntry, Person } from '../../types/database'

export interface ActivityLogEntryWithActor extends ActivityLogEntry {
  actor: Pick<Person, 'id' | 'name'> | null
}

export function useRecentActivity(limit = 8) {
  return useQuery({
    queryKey: ['activity_log', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*, actor:people(id, name)')
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data as unknown as ActivityLogEntryWithActor[]
    },
  })
}

// Fire-and-forget: logging failure shouldn't roll back or block the mutation
// it's attached to, so call sites just call this and move on.
export function logActivity(
  entityType: string,
  entityId: string | null,
  action: string,
  summary: string,
) {
  supabase
    .rpc('log_activity', {
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_action: action,
      p_summary: summary,
    })
    .then(({ error }) => {
      if (error) console.error('Failed to log activity:', error)
    })
}
