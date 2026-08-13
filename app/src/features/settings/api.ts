import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { RoleId, WeddingInsert } from '../../types/database'

export function useUpdateWedding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<WeddingInsert> }) => {
      const { error } = await supabase.from('weddings').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wedding'] })
    },
  })
}

export function useUpdatePersonRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ personId, roleId }: { personId: string; roleId: RoleId | null }) => {
      const { error } = await supabase.from('people').update({ role_id: roleId }).eq('id', personId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
  })
}
