import { useState } from 'react'
import { Center, Group, Loader, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { useEvents } from '../../lib/queries'
import { useDecorItems } from './api'
import { DecorItemRow } from './DecorItemRow'
import { AddDecorModal } from './AddDecorModal'
import { QuickAddButton } from '../../components/layout/QuickAddButton'
import type { DecorItemWithRelations } from './api'
import type { DecorHomeArea } from '../../types/database'

const HOME_AREAS: { value: DecorHomeArea; label: string }[] = [
  { value: 'house', label: 'House Decor' },
  { value: 'garden', label: 'Garden Decor' },
]

function summary(items: DecorItemWithRelations[]): string {
  if (items.length === 0) return 'No items yet'
  const done = items.filter((i) => i.status === 'Done').length
  return `${items.length} item${items.length === 1 ? '' : 's'} · ${done}/${items.length} ready`
}

// Same compact expandable pattern as Outfits — a summary row you tap to
// reveal its items, rather than every decor item permanently on screen.
function DecorGroupRow({
  label,
  items,
  onAdd,
}: {
  label: string
  items: DecorItemWithRelations[]
  onAdd: () => void
}) {
  const [expanded, setExpanded] = useState(false)

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
            <Text fw={600}>{label}</Text>
            <Text size="xs" c="dimmed">
              {summary(items)}
            </Text>
          </div>
          {expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
        </Group>
      </UnstyledButton>
      {expanded && (
        <Stack gap={0} pl="sm">
          {items.length === 0 ? (
            <Group justify="space-between" py="xs">
              <Text size="sm" c="dimmed">
                No decor items yet.
              </Text>
              <UnstyledButton onClick={onAdd}>
                <Text size="sm" c="accent">
                  Add item
                </Text>
              </UnstyledButton>
            </Group>
          ) : (
            items.map((item) => <DecorItemRow key={item.id} item={item} />)
          )}
        </Stack>
      )}
    </Stack>
  )
}

// First standalone Decor screen — previously Decor only appeared embedded
// inside each Event page. Structure per spec: Event Decor (one row per
// configured event, dynamic — never hardcoded) and Home Decor (House/
// Garden), clearly separated sections since Home Decor is its own
// planning context, not a fake Event (see readiness/api.ts — the wedding
// readiness query only ever reads context='event' rows).
export function DecorPanel() {
  const { data: events, isLoading: eventsLoading } = useEvents()
  const { data: decorItems, isLoading: itemsLoading, isError } = useDecorItems()
  const [addOpen, setAddOpen] = useState(false)
  const [addDefaults, setAddDefaults] = useState<{ eventId?: string; homeArea?: DecorHomeArea }>({})

  const isLoading = eventsLoading || itemsLoading

  function openAddFor(defaults: { eventId?: string; homeArea?: DecorHomeArea }) {
    setAddDefaults(defaults)
    setAddOpen(true)
  }

  const eventItems = (decorItems ?? []).filter((i) => i.context === 'event')
  const homeItems = (decorItems ?? []).filter((i) => i.context === 'home')

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Decor</Title>

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load decor. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && (
        <>
          <Stack gap={4}>
            <Text size="sm" fw={600} c="dimmed">
              Event Decor
            </Text>
            <Stack gap={0}>
              {events?.map((event) => (
                <DecorGroupRow
                  key={event.id}
                  label={event.name}
                  items={eventItems.filter((i) => i.event_id === event.id)}
                  onAdd={() => openAddFor({ eventId: event.id })}
                />
              ))}
              {events?.length === 0 && (
                <Text size="sm" c="dimmed">
                  No events configured yet.
                </Text>
              )}
            </Stack>
          </Stack>

          <Stack gap={4}>
            <Text size="sm" fw={600} c="dimmed">
              Home Decor
            </Text>
            <Stack gap={0}>
              {HOME_AREAS.map((area) => (
                <DecorGroupRow
                  key={area.value}
                  label={area.label}
                  items={homeItems.filter((i) => i.home_area === area.value)}
                  onAdd={() => openAddFor({ homeArea: area.value })}
                />
              ))}
            </Stack>
          </Stack>
        </>
      )}

      <QuickAddButton onClick={() => openAddFor({})} label="Add decor item" />

      <AddDecorModal
        // Remount on each new target so its internal state (initialized
        // once from these defaults) picks up the right context/event/area
        // instead of keeping whatever the previous "Add" click left behind.
        key={`${addDefaults.eventId ?? ''}-${addDefaults.homeArea ?? ''}`}
        opened={addOpen}
        onClose={() => setAddOpen(false)}
        defaultEventId={addDefaults.eventId}
        defaultContext={addDefaults.homeArea ? 'home' : undefined}
        defaultHomeArea={addDefaults.homeArea}
      />
    </Stack>
  )
}
