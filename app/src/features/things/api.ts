import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type { EventRow, Person, ThingStatus, ThingToTake, ThingToTakeInsert } from '../../types/database'

export interface ThingWithRelations extends ThingToTake {
  responsible_person: Pick<Person, 'id' | 'name'> | null
  event: Pick<EventRow, 'id' | 'name'> | null
}

const THING_SELECT = `
  *,
  responsible_person:people!things_to_take_responsible_person_id_fkey(id, name),
  event:events(id, name)
`

export function useThings(scope: 'all' | 'mine', personId: string | undefined) {
  return useQuery({
    queryKey: ['things_to_take', scope, personId],
    enabled: scope === 'all' || !!personId,
    queryFn: async () => {
      let query = supabase.from('things_to_take').select(THING_SELECT).order('item_name')
      if (scope === 'mine' && personId) {
        query = query.eq('responsible_person_id', personId)
      }
      const { data, error } = await query
      if (error) throw error
      return data as unknown as ThingWithRelations[]
    },
  })
}

export function useThingsForEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['things_to_take', 'event', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('things_to_take')
        .select(THING_SELECT)
        .eq('event_id', eventId as string)
        .order('item_name')
      if (error) throw error
      return data as unknown as ThingWithRelations[]
    },
  })
}

export function useCreateThing() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (thing: ThingToTakeInsert) => {
      const { data, error } = await supabase.from('things_to_take').insert(thing).select('id').single()
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['things_to_take'] })
      logActivity('thing_to_take', data.id, 'created', `added "${variables.item_name}" to Things to Take`)
    },
  })
}

export function useUpdateThingStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ThingStatus; itemName: string }) => {
      const { error } = await supabase.from('things_to_take').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['things_to_take'] })
      logActivity('thing_to_take', variables.id, 'status_changed', `marked "${variables.itemName}" as ${variables.status}`)
    },
  })
}
