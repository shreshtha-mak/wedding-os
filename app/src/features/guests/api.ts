import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type {
  AttendanceStatus,
  EventRow,
  Guest,
  GuestEventAttendance,
  Person,
} from '../../types/database'

export interface AttendanceWithEvent extends GuestEventAttendance {
  event: Pick<EventRow, 'id' | 'name'>
}

export interface GuestWithDetails extends Guest {
  person: Pick<Person, 'id' | 'name' | 'phone' | 'relationship'>
  attendance: AttendanceWithEvent[]
}

const GUEST_SELECT = `
  *,
  person:people(id, name, phone, relationship),
  attendance:guest_event_attendance(*, event:events(id, name))
`

export function useGuests() {
  return useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('guests').select(GUEST_SELECT)
      if (error) throw error
      return data as unknown as GuestWithDetails[]
    },
  })
}

interface NewPersonGuestInput {
  mode: 'new'
  weddingId: string
  name: string
  relationship: string | null
  phone: string | null
  familyGroup: string | null
  dietaryRequirements: string[]
  accommodationRequired: boolean
  notes: string | null
  eventIds: string[]
}

interface ExistingPersonGuestInput {
  mode: 'existing'
  weddingId: string
  personId: string
  familyGroup: string | null
  dietaryRequirements: string[]
  accommodationRequired: boolean
  notes: string | null
  eventIds: string[]
}

export function useCreateGuest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: NewPersonGuestInput | ExistingPersonGuestInput) => {
      let personId: string
      let personName: string

      if (input.mode === 'new') {
        const { data: person, error: personError } = await supabase
          .from('people')
          .insert({
            wedding_id: input.weddingId,
            name: input.name,
            relationship: input.relationship,
            phone: input.phone,
          })
          .select('id, name')
          .single()
        if (personError) throw personError
        personId = person.id
        personName = person.name
      } else {
        personId = input.personId
        const { data: person, error: personError } = await supabase
          .from('people')
          .select('name')
          .eq('id', personId)
          .single()
        if (personError) throw personError
        personName = person.name
      }

      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .insert({
          wedding_id: input.weddingId,
          person_id: personId,
          family_group: input.familyGroup,
          dietary_requirements: input.dietaryRequirements,
          accommodation_required: input.accommodationRequired,
          notes: input.notes,
        })
        .select('id')
        .single()
      if (guestError) throw guestError

      if (input.eventIds.length > 0) {
        const { error: attendanceError } = await supabase.from('guest_event_attendance').insert(
          input.eventIds.map((eventId) => ({ guest_id: guest.id, event_id: eventId })),
        )
        if (attendanceError) throw attendanceError
      }

      return { guestId: guest.id, personName }
    },
    onSuccess: ({ personName }) => {
      queryClient.invalidateQueries({ queryKey: ['guests'] })
      queryClient.invalidateQueries({ queryKey: ['people'] })
      logActivity('guest', null, 'created', `added ${personName} as a guest`)
    },
  })
}

export function useUpdateGuest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      familyGroup,
      dietaryRequirements,
      accommodationRequired,
      notes,
    }: {
      id: string
      familyGroup: string | null
      dietaryRequirements: string[]
      accommodationRequired: boolean
      notes: string | null
    }) => {
      const { error } = await supabase
        .from('guests')
        .update({
          family_group: familyGroup,
          dietary_requirements: dietaryRequirements,
          accommodation_required: accommodationRequired,
          notes,
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] })
    },
  })
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
      transportationRequired,
    }: {
      id: string
      status: AttendanceStatus
      transportationRequired: boolean
    }) => {
      const { error } = await supabase
        .from('guest_event_attendance')
        .update({ status, transportation_required: transportationRequired })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] })
    },
  })
}
