import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Person, RoleId } from '../../types/database'

export interface PersonWithAccount extends Person {
  has_login: boolean
}

// Admin management view: everyone, active or not, unlike lib/queries'
// usePeople (which only returns active people, for assignee pickers).
export function usePeopleAdmin() {
  return useQuery({
    queryKey: ['people', 'admin'],
    queryFn: async () => {
      const { data: people, error } = await supabase.from('people').select('*').order('name')
      if (error) throw error

      const { data: accounts, error: accountsError } = await supabase
        .from('user_accounts')
        .select('person_id')
      if (accountsError) throw accountsError

      const linkedIds = new Set(accounts.map((a) => a.person_id))
      return people.map((p) => ({ ...p, has_login: linkedIds.has(p.id) })) as PersonWithAccount[]
    },
  })
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('roles').select('*').order('id')
      if (error) throw error
      return data
    },
  })
}

interface CreatePersonInput {
  wedding_id: string
  name: string
  relationship: string | null
  phone: string | null
  email: string | null
  role_id: RoleId | null
  notes: string | null
}

export function useCreatePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (person: CreatePersonInput) => {
      const { error } = await supabase.from('people').insert(person)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
  })
}

export function useLinkUserAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ personId, email }: { personId: string; email: string }) => {
      const { error } = await supabase.rpc('link_user_account', {
        target_person_id: personId,
        target_email: email,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
  })
}
