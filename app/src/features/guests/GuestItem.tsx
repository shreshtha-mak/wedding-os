import { useState } from 'react'
import { Badge, Group, Stack, Text, UnstyledButton } from '@mantine/core'
import type { GuestWithDetails } from './api'
import { GuestDetailModal } from './GuestDetailModal'

export function GuestItem({ guest }: { guest: GuestWithDetails }) {
  const [detailOpen, setDetailOpen] = useState(false)
  const attendingCount = guest.attendance.filter((a) => a.status === 'Attending').length
  const pendingCount = guest.attendance.filter((a) => a.status === 'Pending').length

  return (
    <>
      <UnstyledButton onClick={() => setDetailOpen(true)} style={{ width: '100%' }}>
        <Group
          justify="space-between"
          wrap="nowrap"
          py="xs"
          style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
        >
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text fw={500}>{guest.person.name}</Text>
            <Group gap={6} wrap="wrap">
              {guest.family_group && (
                <Text size="xs" c="dimmed">
                  {guest.family_group}
                </Text>
              )}
              <Badge size="xs" color="green" variant="light">
                {attendingCount} attending
              </Badge>
              {pendingCount > 0 && (
                <Badge size="xs" color="blue" variant="light">
                  {pendingCount} pending
                </Badge>
              )}
              {guest.accommodation_required && (
                <Badge size="xs" color="orange" variant="outline">
                  Accommodation
                </Badge>
              )}
            </Group>
          </Stack>
        </Group>
      </UnstyledButton>
      <GuestDetailModal guest={guest} opened={detailOpen} onClose={() => setDetailOpen(false)} />
    </>
  )
}
