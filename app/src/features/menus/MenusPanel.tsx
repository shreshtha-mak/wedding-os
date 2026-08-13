import { useState } from 'react'
import { Badge, Card, Center, Group, Loader, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { useEvents } from '../../lib/queries'
import { useMenuForEvent } from './api'
import { MenuDetailModal } from './MenuDetailModal'
import type { EventRow } from '../../types/database'

function EventMenuRow({ event }: { event: EventRow }) {
  const [open, setOpen] = useState(false)
  const { data: menu } = useMenuForEvent(event.id)

  return (
    <>
      <UnstyledButton onClick={() => setOpen(true)} style={{ width: '100%' }}>
        <Card withBorder radius="md" p="md">
          <Group justify="space-between">
            <Text fw={500}>{event.name}</Text>
            <Badge
              size="sm"
              color={menu?.status === 'Finalised' ? 'green' : menu?.status === 'Discussing' ? 'yellow' : 'gray'}
              variant="light"
            >
              {menu?.status ?? 'Not started'}
            </Badge>
          </Group>
        </Card>
      </UnstyledButton>
      <MenuDetailModal eventId={event.id} eventName={event.name} opened={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function MenusPanel() {
  const { data: events, isLoading } = useEvents()

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Menus</Title>

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {events?.map((e) => <EventMenuRow key={e.id} event={e} />)}
    </Stack>
  )
}
