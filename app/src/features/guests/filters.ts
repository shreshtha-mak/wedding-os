import type { AttendanceStatus, TransportRequirement } from '../../types/database'
import type { GuestWithDetails } from './api'

export type AccommodationFilter = 'required' | 'not_required' | 'arranged' | 'pending'

export interface GuestFilters {
  familyGroup: string | null
  eventId: string | null
  attendance: AttendanceStatus | null
  accommodation: AccommodationFilter | null
  transportation: TransportRequirement | null
}

export const EMPTY_GUEST_FILTERS: GuestFilters = {
  familyGroup: null,
  eventId: null,
  attendance: null,
  accommodation: null,
  transportation: null,
}

export function activeFilterCount(filters: GuestFilters): number {
  return Object.values(filters).filter((v) => v !== null).length
}

// Family groups are whatever the family has actually typed into guest
// records — not a hardcoded list — so options come from the live data.
export function familyGroupOptions(guests: GuestWithDetails[]): string[] {
  const groups = new Set(guests.map((g) => g.family_group).filter((g): g is string => !!g))
  return [...groups].sort((a, b) => a.localeCompare(b))
}

export function matchesGuestFilters(
  guest: GuestWithDetails,
  filters: GuestFilters,
  assignedGuestIds: Set<string>,
): boolean {
  if (filters.familyGroup !== null && guest.family_group !== filters.familyGroup) return false

  if (filters.eventId !== null && !guest.attendance.some((a) => a.event.id === filters.eventId)) return false

  if (filters.attendance !== null) {
    const relevant = filters.eventId !== null ? guest.attendance.filter((a) => a.event.id === filters.eventId) : guest.attendance
    if (!relevant.some((a) => a.status === filters.attendance)) return false
  }

  if (filters.accommodation !== null) {
    const arranged = assignedGuestIds.has(guest.id)
    switch (filters.accommodation) {
      case 'required':
        if (!guest.accommodation_required) return false
        break
      case 'not_required':
        if (guest.accommodation_required) return false
        break
      case 'arranged':
        if (!(guest.accommodation_required && arranged)) return false
        break
      case 'pending':
        if (!(guest.accommodation_required && !arranged)) return false
        break
    }
  }

  if (filters.transportation !== null) {
    const relevant = filters.eventId !== null ? guest.attendance.filter((a) => a.event.id === filters.eventId) : guest.attendance
    if (!relevant.some((a) => a.transportation_status === filters.transportation)) return false
  }

  return true
}
