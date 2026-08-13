import { Group, Select, Stack, Text } from '@mantine/core'
import { useUpdateDecorStatus } from './api'
import type { DecorItemWithRelations } from './api'
import type { DecorStatus } from '../../types/database'

const STATUSES: DecorStatus[] = ['Concept', 'Confirmed', 'In Progress', 'Done']

function statusColor(status: DecorStatus): string {
  switch (status) {
    case 'Done':
      return 'green'
    case 'In Progress':
      return 'blue'
    case 'Confirmed':
      return 'yellow'
    case 'Concept':
      return 'gray'
  }
}

export function DecorItemRow({ item }: { item: DecorItemWithRelations }) {
  const updateStatus = useUpdateDecorStatus()

  return (
    <Group
      justify="space-between"
      wrap="nowrap"
      py="xs"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text fw={500}>{item.name}</Text>
        <Group gap={6} wrap="wrap">
          <Text size="xs" c="dimmed">
            {item.category}
          </Text>
          {item.vendor && (
            <Text size="xs" c="dimmed">
              · {item.vendor.name}
            </Text>
          )}
        </Group>
      </Stack>
      <Select
        size="xs"
        w={120}
        data={STATUSES}
        value={item.status}
        allowDeselect={false}
        onChange={(v) => v && updateStatus.mutate({ id: item.id, status: v as DecorStatus, name: item.name })}
        styles={{ input: { color: `var(--mantine-color-${statusColor(item.status)}-6)` } }}
      />
    </Group>
  )
}
