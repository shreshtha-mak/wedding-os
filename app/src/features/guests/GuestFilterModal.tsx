import { Button, Group, Modal, Select, Stack } from '@mantine/core'
import { useEvents } from '../../lib/queries'
import { EMPTY_GUEST_FILTERS, familyGroupOptions } from './filters'
import type { GuestFilters } from './filters'
import type { GuestWithDetails } from './api'
import type { AttendanceStatus, TransportRequirement } from '../../types/database'

const ATTENDANCE_OPTIONS: AttendanceStatus[] = ['Pending', 'Attending', 'Not attending', 'Maybe']
const TRANSPORT_OPTIONS: { value: TransportRequirement; label: string }[] = [
  { value: 'Required', label: 'Required' },
  { value: 'Own arrangement', label: 'Own arrangement' },
  { value: 'Arranged', label: 'Arranged' },
  { value: 'Not needed', label: 'Not needed' },
  { value: 'Unknown', label: 'Pending' },
]
const ACCOMMODATION_OPTIONS = [
  { value: 'required', label: 'Accommodation required' },
  { value: 'not_required', label: 'Accommodation not required' },
  { value: 'arranged', label: 'Accommodation arranged' },
  { value: 'pending', label: 'Accommodation pending' },
]

export function GuestFilterModal({
  opened,
  onClose,
  guests,
  filters,
  onChange,
  hideEventFilter,
}: {
  opened: boolean
  onClose: () => void
  guests: GuestWithDetails[]
  filters: GuestFilters
  onChange: (filters: GuestFilters) => void
  // When the panel is already scoped to a single event (opened from an
  // Event page), the event filter is implied — don't offer it again.
  hideEventFilter?: boolean
}) {
  const { data: events } = useEvents()
  const familyGroups = familyGroupOptions(guests)

  return (
    <Modal opened={opened} onClose={onClose} title="Filter guests" centered>
      <Stack gap="sm">
        <Select
          label="Family / group"
          placeholder="All groups"
          clearable
          searchable
          data={familyGroups}
          value={filters.familyGroup}
          onChange={(v) => onChange({ ...filters, familyGroup: v })}
        />
        {!hideEventFilter && (
          <Select
            label="Event"
            placeholder="All events"
            clearable
            data={events?.map((e) => ({ value: e.id, label: e.name })) ?? []}
            value={filters.eventId}
            onChange={(v) => onChange({ ...filters, eventId: v })}
          />
        )}
        <Select
          label="Attendance"
          placeholder="All"
          clearable
          data={ATTENDANCE_OPTIONS}
          value={filters.attendance}
          onChange={(v) => onChange({ ...filters, attendance: v as AttendanceStatus | null })}
        />
        <Select
          label="Accommodation"
          placeholder="All"
          clearable
          data={ACCOMMODATION_OPTIONS}
          value={filters.accommodation}
          onChange={(v) => onChange({ ...filters, accommodation: v as GuestFilters['accommodation'] })}
        />
        <Select
          label="Transportation"
          placeholder="All"
          clearable
          data={TRANSPORT_OPTIONS}
          value={filters.transportation}
          onChange={(v) => onChange({ ...filters, transportation: v as TransportRequirement | null })}
        />
        <Group grow mt="xs">
          <Button
            variant="default"
            onClick={() => onChange(hideEventFilter ? { ...EMPTY_GUEST_FILTERS, eventId: filters.eventId } : EMPTY_GUEST_FILTERS)}
          >
            Clear filters
          </Button>
          <Button onClick={onClose}>Apply</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
