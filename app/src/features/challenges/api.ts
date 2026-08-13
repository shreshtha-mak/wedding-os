import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type { Challenge, ChallengeInsert, ChallengeStatus, EventRow, Person, TaskCategory } from '../../types/database'

export interface ChallengeWithRelations extends Challenge {
  owner: Pick<Person, 'id' | 'name'> | null
  category: Pick<TaskCategory, 'id' | 'name'> | null
  event: Pick<EventRow, 'id' | 'name'> | null
}

const CHALLENGE_SELECT = `
  *,
  owner:people!challenges_owner_person_id_fkey(id, name),
  category:task_categories(id, name),
  event:events(id, name)
`

export function useChallenges(scope: 'all' | 'mine', personId: string | undefined) {
  return useQuery({
    queryKey: ['challenges', scope, personId],
    enabled: scope === 'all' || !!personId,
    queryFn: async () => {
      let query = supabase
        .from('challenges')
        .select(CHALLENGE_SELECT)
        .order('priority', { ascending: false })
        .order('deadline', { ascending: true, nullsFirst: false })

      if (scope === 'mine' && personId) {
        query = query.eq('owner_person_id', personId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as unknown as ChallengeWithRelations[]
    },
  })
}

export function useChallengesForEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['challenges', 'event', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select(CHALLENGE_SELECT)
        .eq('event_id', eventId as string)
        .order('priority', { ascending: false })
      if (error) throw error
      return data as unknown as ChallengeWithRelations[]
    },
  })
}

export function useCreateChallenge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (challenge: ChallengeInsert) => {
      const { data, error } = await supabase.from('challenges').insert(challenge).select('id').single()
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
      logActivity('challenge', data.id, 'created', `raised the challenge "${variables.title}"`)
    },
  })
}

export function useUpdateChallengeStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
      resolution,
    }: {
      id: string
      status: ChallengeStatus
      resolution?: string | null
      title: string
    }) => {
      const { error } = await supabase
        .from('challenges')
        .update({ status, resolution: resolution ?? null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] })
      logActivity(
        'challenge',
        variables.id,
        'status_changed',
        `marked "${variables.title}" as ${variables.status}`,
      )
    },
  })
}
