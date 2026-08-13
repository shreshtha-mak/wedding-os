import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type {
  AccommodationAssignment,
  AccommodationLocation,
  AccommodationLocationInsert,
  AccommodationRoom,
  AccommodationRoomInsert,
} from '../../types/database'

export interface AssignmentWithGuest extends AccommodationAssignment {
  guest: { id: string; person: { name: string } }
}
export interface RoomWithAssignments extends AccommodationRoom {
  assignments: AssignmentWithGuest[]
}
export interface LocationWithRooms extends AccommodationLocation {
  rooms: RoomWithAssignments[]
}

const LOCATION_SELECT = `
  *,
  rooms:accommodation_rooms(
    *,
    assignments:accommodation_assignments(*, guest:guests(id, person:people(name)))
  )
`

export function useAccommodationLocations() {
  return useQuery({
    queryKey: ['accommodation_locations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('accommodation_locations').select(LOCATION_SELECT).order('name')
      if (error) throw error
      return data as unknown as LocationWithRooms[]
    },
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (location: AccommodationLocationInsert) => {
      const { error } = await supabase.from('accommodation_locations').insert(location)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accommodation_locations'] })
      logActivity('accommodation_location', null, 'created', `added accommodation location "${variables.name}"`)
    },
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (room: AccommodationRoomInsert) => {
      const { error } = await supabase.from('accommodation_rooms').insert(room)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodation_locations'] })
    },
  })
}

export function useAssignGuestToRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      roomId,
      guestId,
      checkIn,
      checkOut,
    }: {
      roomId: string
      guestId: string
      checkIn: string | null
      checkOut: string | null
      guestName: string
    }) => {
      const { error } = await supabase
        .from('accommodation_assignments')
        .insert({ room_id: roomId, guest_id: guestId, check_in: checkIn, check_out: checkOut })
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accommodation_locations'] })
      logActivity('accommodation_assignment', null, 'created', `assigned ${variables.guestName} to a room`)
    },
  })
}

export function useRemoveAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase.from('accommodation_assignments').delete().eq('id', assignmentId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accommodation_locations'] })
    },
  })
}
