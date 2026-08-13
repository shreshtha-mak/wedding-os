import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type { Person, TransportStatus, Transportation, TransportationInsert } from '../../types/database'

export interface TransportationWithRelations extends Transportation {
  person: Pick<Person, 'id' | 'name'> | null
  responsible_person: Pick<Person, 'id' | 'name'> | null
}

const TRANSPORT_SELECT = `
  *,
  person:people!transportation_person_id_fkey(id, name),
  responsible_person:people!transportation_responsible_person_id_fkey(id, name)
`

export function useTransportation() {
  return useQuery({
    queryKey: ['transportation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transportation')
        .select(TRANSPORT_SELECT)
        .order('transport_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data as unknown as TransportationWithRelations[]
    },
  })
}

export function useCreateTransportation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (record: TransportationInsert) => {
      const { data, error } = await supabase.from('transportation').insert(record).select('id').single()
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transportation'] })
      logActivity(
        'transportation',
        data.id,
        'created',
        `added a transport request${variables.group_label ? ` for ${variables.group_label}` : ''}`,
      )
    },
  })
}

export function useUpdateTransportStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TransportStatus }) => {
      const { error } = await supabase.from('transportation').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transportation'] })
    },
  })
}
