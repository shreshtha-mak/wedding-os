import { Group, Select, Stack, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { useUpdateTransportStatus } from './api'
import type { TransportationWithRelations } from './api'
import type { TransportStatus } from '../../types/database'

const STATUSES: TransportStatus[] = ['Needed', 'Assigned', 'Confirmed', 'Completed']

function statusColor(status: TransportStatus): string {
  switch (status) {
    case 'Completed':
      return 'green'
    case 'Confirmed':
      return 'blue'
    case 'Assigned':
      return 'yellow'
    case 'Needed':
      return 'red'
  }
}

export function TransportItem({ item }: { item: TransportationWithRelations }) {
  const updateStatus = useUpdateTransportStatus()

  return (
    <Group
      justify="space-between"
      wrap="nowrap"
      py="xs"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={500}>
          {item.pickup_location} → {item.destination}
        </Text>
        <Text size="xs" c="dimmed">
          {item.person?.name ?? item.group_label ?? 'Unassigned'}
          {item.transport_date ? ` · ${dayjs(item.transport_date).format('DD MMM')}` : ''}
          {item.transport_time ? ` ${dayjs(`2000-01-01T${item.transport_time}`).format('h:mm A')}` : ''}
        </Text>
      </Stack>
      <Select
        size="xs"
        w={120}
        data={STATUSES}
        value={item.status}
        allowDeselect={false}
        onChange={(v) => v && updateStatus.mutate({ id: item.id, status: v as TransportStatus })}
        styles={{ input: { color: `var(--mantine-color-${statusColor(item.status)}-6)` } }}
      />
    </Group>
  )
}
