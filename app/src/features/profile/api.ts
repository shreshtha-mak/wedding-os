import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export function useUpdateMyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone: string | null }) => {
      const { error } = await supabase.rpc('update_my_profile', { p_name: name, p_phone: phone })
      if (error) throw error
    },
    onSuccess: () => {
      // AuthContext's `person` and the People directory both cache this row.
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
  })
}
