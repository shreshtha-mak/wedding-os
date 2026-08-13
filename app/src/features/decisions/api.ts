import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type { Decision, DecisionInsert, EventRow, Person, TaskCategory } from '../../types/database'

export interface DecisionWithRelations extends Decision {
  responsible_person: Pick<Person, 'id' | 'name'> | null
  category: Pick<TaskCategory, 'id' | 'name'> | null
  event: Pick<EventRow, 'id' | 'name'> | null
}

const DECISION_SELECT = `
  *,
  responsible_person:people!decisions_responsible_person_id_fkey(id, name),
  category:task_categories(id, name),
  event:events(id, name)
`

export function useDecisions(scope: 'all' | 'mine', personId: string | undefined) {
  return useQuery({
    queryKey: ['decisions', scope, personId],
    enabled: scope === 'all' || !!personId,
    queryFn: async () => {
      let query = supabase
        .from('decisions')
        .select(DECISION_SELECT)
        .order('deadline', { ascending: true, nullsFirst: false })

      if (scope === 'mine' && personId) {
        query = query.eq('responsible_person_id', personId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as unknown as DecisionWithRelations[]
    },
  })
}

export function useDecisionsForEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['decisions', 'event', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decisions')
        .select(DECISION_SELECT)
        .eq('event_id', eventId as string)
        .order('deadline', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data as unknown as DecisionWithRelations[]
    },
  })
}

export function useCreateDecision() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (decision: DecisionInsert) => {
      const { data, error } = await supabase.from('decisions').insert(decision).select('id').single()
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] })
      logActivity('decision', data.id, 'created', `raised the decision "${variables.question}"`)
    },
  })
}

export function useMarkDecided() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      selectedOption,
      decidedByPersonIds,
    }: {
      id: string
      selectedOption: string
      decidedByPersonIds: string[]
      question: string
    }) => {
      const { error } = await supabase
        .from('decisions')
        .update({
          status: 'Decided',
          selected_option: selectedOption,
          decided_by_person_ids: decidedByPersonIds,
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['decisions'] })
      logActivity(
        'decision',
        variables.id,
        'decided',
        `decided "${variables.question}" → ${variables.selectedOption}`,
      )
    },
  })
}
