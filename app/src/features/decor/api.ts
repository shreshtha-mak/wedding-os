import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type { DecorItem, DecorItemInsert, DecorStatus, Vendor } from '../../types/database'

export interface DecorItemWithRelations extends DecorItem {
  vendor: Pick<Vendor, 'id' | 'name'> | null
}

const DECOR_SELECT = `*, vendor:vendors(id, name)`

export function useDecorForEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['decor_items', 'event', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('decor_items')
        .select(DECOR_SELECT)
        .eq('event_id', eventId as string)
        .order('created_at')
      if (error) throw error
      return data as unknown as DecorItemWithRelations[]
    },
  })
}

export function useDecorItems() {
  return useQuery({
    queryKey: ['decor_items'],
    queryFn: async () => {
      const { data, error } = await supabase.from('decor_items').select(DECOR_SELECT).order('created_at')
      if (error) throw error
      return data as unknown as DecorItemWithRelations[]
    },
  })
}

export function useCreateDecorItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item: DecorItemInsert) => {
      const { data, error } = await supabase.from('decor_items').insert(item).select('id').single()
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['decor_items'] })
      logActivity('decor_item', data.id, 'created', `added "${variables.name}" to Decor`)
    },
  })
}

export function useUpdateDecorStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DecorStatus; name: string }) => {
      const { error } = await supabase.from('decor_items').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['decor_items'] })
      logActivity('decor_item', variables.id, 'status_changed', `marked "${variables.name}" as ${variables.status}`)
    },
  })
}
