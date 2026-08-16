import { useMemo, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Center,
  Group,
  Indicator,
  Loader,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { IconArrowLeft, IconChevronDown, IconChevronRight, IconFilter, IconSearch, IconX } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { useAccommodationAssignedGuestIds, useGuests } from './api'
import { GuestItem } from './GuestItem'
import { AddGuestModal } from './AddGuestModal'
import { GuestFilterModal } from './GuestFilterModal'
import { QuickAddButton } from '../../components/layout/QuickAddButton'
import { activeFilterCount, EMPTY_GUEST_FILTERS, matchesGuestFilters } from './filters'
import type { GuestFilters } from './filters'
import type { GuestWithDetails } from './api'

const UNGROUPED_KEY = '__ungrouped__'

interface GuestGroup {
  key: string
  label: string
  guests: GuestWithDetails[]
}

// The master guest list stays one list — grouping by family here is a
// display/filter layer over it, not a separate per-family guest table.
function groupByFamily(guests: GuestWithDetails[]): GuestGroup[] {
  const groups = new Map<string, GuestGroup>()
  for (const g of guests) {
    const trimmed = g.family_group?.trim()
    const key = trimmed || UNGROUPED_KEY
    const label = trimmed || 'No family group'
    const group = groups.get(key) ?? { key, label, guests: [] }
    group.guests.push(g)
    groups.set(key, group)
  }
  const sorted = [...groups.values()].sort((a, b) => a.label.localeCompare(b.label))
  const ungroupedIndex = sorted.findIndex((g) => g.key === UNGROUPED_KEY)
  if (ungroupedIndex !== -1) {
    const [ungrouped] = sorted.splice(ungroupedIndex, 1)
    sorted.push(ungrouped)
  }
  return sorted
}

// Compact expandable family-group row — same tap-to-expand pattern as
// Outfits/Decor. Doubles as a browsing filter: tap a family to see just
// its members instead of scrolling the full list.
function GuestGroupRow({ group }: { group: GuestGroup }) {
  const [expanded, setExpanded] = useState(false)
  const attendingCount = group.guests.filter((g) => g.attendance.some((a) => a.status === 'Attending')).length

  return (
    <Stack gap={0}>
      <UnstyledButton onClick={() => setExpanded((v) => !v)} style={{ width: '100%' }}>
        <Group
          justify="space-between"
          wrap="nowrap"
          py="sm"
          style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
        >
          <div>
            <Text fw={600}>{group.label}</Text>
            <Text size="xs" c="dimmed">
              {group.guests.length} guest{group.guests.length === 1 ? '' : 's'} · {attendingCount} attending
            </Text>
          </div>
          {expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
        </Group>
      </UnstyledButton>
      {expanded && (
        <Stack gap={0} pl="sm">
          {group.guests.map((g) => (
            <GuestItem key={g.id} guest={g} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}

// Human-readable labels for the active-filter chip row.
function filterChips(filters: GuestFilters, eventName: string | null): { key: keyof GuestFilters; label: string }[] {
  const chips: { key: keyof GuestFilters; label: string }[] = []
  if (filters.familyGroup) chips.push({ key: 'familyGroup', label: filters.familyGroup })
  if (filters.eventId) chips.push({ key: 'eventId', label: eventName ?? 'Event' })
  if (filters.attendance) chips.push({ key: 'attendance', label: filters.attendance })
  if (filters.accommodation) {
    const labels: Record<string, string> = {
      required: 'Accommodation required',
      not_required: 'Accommodation not required',
      arranged: 'Accommodation arranged',
      pending: 'Accommodation pending',
    }
    chips.push({ key: 'accommodation', label: labels[filters.accommodation] })
  }
  if (filters.transportation) {
    chips.push({ key: 'transportation', label: filters.transportation === 'Unknown' ? 'Transport pending' : filters.transportation })
  }
  return chips
}

export function GuestsPanel({
  scopedEventId,
  scopedEventName,
  onExitScope,
}: {
  // Pre-scopes the panel to a single event's guest list, opened from that
  // Event page's "View guest list" link. Still the same Guest + Event
  // Attendance data — no separate per-event guest table.
  scopedEventId?: string
  scopedEventName?: string
  onExitScope?: () => void
} = {}) {
  const { person } = useAuth()
  const canManage = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const { data: guests, isLoading, isError } = useGuests()
  const { data: assignedGuestIds } = useAccommodationAssignedGuestIds()
  const [addOpen, setAddOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<GuestFilters>(
    scopedEventId ? { ...EMPTY_GUEST_FILTERS, eventId: scopedEventId } : EMPTY_GUEST_FILTERS,
  )

  const filtered = useMemo(() => {
    if (!guests) return []
    const assigned = assignedGuestIds ?? new Set<string>()
    const q = search.trim().toLowerCase()
    return guests
      .filter((g) => matchesGuestFilters(g, filters, assigned))
      .filter((g) => !q || g.person.name.toLowerCase().includes(q))
  }, [guests, filters, assignedGuestIds, search])

  const groups = useMemo(() => groupByFamily(filtered), [filtered])

  const chips = filterChips(filters, scopedEventName ?? null)
  // In scoped mode the event chip represents the page context, not a
  // removable filter — everything else stays removable individually.
  const removableChips = scopedEventId ? chips.filter((c) => c.key !== 'eventId') : chips
  const filterCount = activeFilterCount(filters) - (scopedEventId ? 1 : 0)

  function removeFilter(key: keyof GuestFilters) {
    setFilters((f) => ({ ...f, [key]: null }))
  }

  return (
    <Stack p="md" pb={96} gap="md">
      {scopedEventId ? (
        <Stack gap={2}>
          {onExitScope && (
            <UnstyledButton onClick={onExitScope} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <IconArrowLeft size={16} />
              <Text size="sm" c="dimmed">
                Back to {scopedEventName}
              </Text>
            </UnstyledButton>
          )}
          <Title order={3}>{scopedEventName} Guests</Title>
        </Stack>
      ) : (
        <Title order={3}>Guests · {guests?.length ?? 0}</Title>
      )}

      <Group gap="xs" wrap="nowrap">
        <TextInput
          placeholder="Search guests"
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Indicator label={filterCount} size={16} disabled={filterCount === 0} offset={4}>
          <ActionIcon variant="default" size="lg" onClick={() => setFilterOpen(true)} aria-label="Filters">
            <IconFilter size={18} />
          </ActionIcon>
        </Indicator>
      </Group>

      {removableChips.length > 0 && (
        <Group gap={6}>
          {removableChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="light"
              rightSection={
                <UnstyledButton onClick={() => removeFilter(chip.key)} aria-label={`Remove ${chip.label} filter`}>
                  <IconX size={12} />
                </UnstyledButton>
              }
            >
              {chip.label}
            </Badge>
          ))}
        </Group>
      )}

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load guests. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && guests?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No guests added yet.</Text>
        </Center>
      )}

      {!isLoading && !isError && guests && guests.length > 0 && filtered.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No guests match these filters.</Text>
        </Center>
      )}

      <Stack gap={0}>
        {groups.map((group) => (
          <GuestGroupRow key={group.key} group={group} />
        ))}
      </Stack>

      {canManage && <QuickAddButton onClick={() => setAddOpen(true)} label="Add guest" />}

      {canManage && <AddGuestModal opened={addOpen} onClose={() => setAddOpen(false)} />}

      <GuestFilterModal
        opened={filterOpen}
        onClose={() => setFilterOpen(false)}
        guests={guests ?? []}
        filters={filters}
        onChange={setFilters}
        hideEventFilter={!!scopedEventId}
      />
    </Stack>
  )
}
