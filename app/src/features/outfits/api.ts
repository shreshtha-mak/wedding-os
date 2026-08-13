import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type { EventRow, Outfit, OutfitInsert, Person } from '../../types/database'

export interface OutfitWithRelations extends Outfit {
  person: Pick<Person, 'id' | 'name'>
  event: Pick<EventRow, 'id' | 'name'>
  responsible_person: Pick<Person, 'id' | 'name'> | null
}

const OUTFIT_SELECT = `
  *,
  person:people!outfits_person_id_fkey(id, name),
  event:events(id, name),
  responsible_person:people!outfits_responsible_person_id_fkey(id, name)
`

export function useOutfits() {
  return useQuery({
    queryKey: ['outfits'],
    queryFn: async () => {
      const { data, error } = await supabase.from('outfits').select(OUTFIT_SELECT)
      if (error) throw error
      return data as unknown as OutfitWithRelations[]
    },
  })
}

export function useOutfitsForEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['outfits', 'event', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outfits')
        .select(OUTFIT_SELECT)
        .eq('event_id', eventId as string)
      if (error) throw error
      return data as unknown as OutfitWithRelations[]
    },
  })
}

export function useCreateOutfit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (outfit: OutfitInsert) => {
      const { error } = await supabase.from('outfits').insert(outfit)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] })
    },
  })
}

export function useUpdateOutfit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<OutfitInsert>
      personName: string
      eventName: string
      becameReady: boolean
    }) => {
      const { error } = await supabase.from('outfits').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['outfits'] })
      if (variables.becameReady) {
        logActivity(
          'outfit',
          variables.id,
          'ready',
          `${variables.personName}'s ${variables.eventName} outfit is ready`,
        )
      }
    },
  })
}
