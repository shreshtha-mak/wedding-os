import { Group, Select, Stack, Text } from '@mantine/core'
import { useUpdateThingStatus } from './api'
import type { ThingWithRelations } from './api'
import type { ThingStatus } from '../../types/database'

const STATUSES: ThingStatus[] = ['Idea', 'To Buy', 'Bought', 'To Prepare', 'Packed', 'At Venue', 'Returned']

function statusColor(status: ThingStatus): string {
  switch (status) {
    case 'Packed':
    case 'At Venue':
    case 'Returned':
      return 'green'
    case 'Bought':
    case 'To Prepare':
      return 'blue'
    case 'To Buy':
      return 'yellow'
    case 'Idea':
      return 'gray'
  }
}

export function ThingItem({ thing }: { thing: ThingWithRelations }) {
  const updateStatus = useUpdateThingStatus()

  return (
    <Group
      justify="space-between"
      wrap="nowrap"
      py="xs"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text fw={500}>
          {thing.item_name}
          {thing.quantity > 1 && (
            <Text span c="dimmed">
              {' '}
              × {thing.quantity}
            </Text>
          )}
        </Text>
        <Group gap={6} wrap="wrap">
          {thing.responsible_person && (
            <Text size="xs" c="dimmed">
              {thing.responsible_person.name}
            </Text>
          )}
          {thing.event && (
            <Text size="xs" c="dimmed">
              · {thing.event.name}
            </Text>
          )}
        </Group>
      </Stack>
      <Select
        size="xs"
        w={110}
        data={STATUSES}
        value={thing.status}
        allowDeselect={false}
        onChange={(v) =>
          v && updateStatus.mutate({ id: thing.id, status: v as ThingStatus, itemName: thing.item_name })
        }
        styles={{ input: { color: `var(--mantine-color-${statusColor(thing.status)}-6)` } }}
      />
    </Group>
  )
}
