import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type { Person, PersonCategory, RoleId } from '../../types/database'

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

// Deliberately no `email` here — email is a User attribute, only ever set
// by link_user_account when a login is actually granted, never typed in
// directly for a Family member or Guest.
interface CreatePersonInput {
  wedding_id: string
  name: string
  relationship: string | null
  phone: string | null
  role_id: RoleId | null
  category: PersonCategory
  notes: string | null
}

// Category is a default-list tag, not a stand-in for the guests table —
// so adding someone here as a Guest also creates their (bare) guests row
// immediately, rather than just labelling them and leaving them absent
// from the actual Guests list until someone remembers to add them there
// separately (spec: "separate the guests from family").
export function useCreatePerson() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (person: CreatePersonInput) => {
      const { data, error } = await supabase.from('people').insert(person).select('id').single()
      if (error) throw error

      if (person.category === 'guest') {
        const { error: guestError } = await supabase
          .from('guests')
          .insert({ wedding_id: person.wedding_id, person_id: data.id })
        if (guestError) throw guestError
      }

      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      if (variables.category === 'guest') {
        queryClient.invalidateQueries({ queryKey: ['guests'] })
      }
      logActivity('person', data.id, 'created', `added ${variables.name} to People`)
    },
  })
}

export function useLinkUserAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      personId,
      email,
    }: {
      personId: string
      email: string
      personName: string
    }) => {
      const { error } = await supabase.rpc('link_user_account', {
        target_person_id: personId,
        target_email: email,
      })
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      logActivity('person', variables.personId, 'linked', `linked a login for ${variables.personName}`)
    },
  })
}
