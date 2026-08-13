import { useState } from 'react'
import { Badge, Group, Stack, Text, UnstyledButton } from '@mantine/core'
import type { ChallengeWithRelations } from './api'
import { UpdateChallengeModal } from './UpdateChallengeModal'
import { priorityColor } from '../tasks/taskStatus'

function statusColor(status: ChallengeWithRelations['status']): string {
  switch (status) {
    case 'Resolved':
      return 'green'
    case 'Being Resolved':
      return 'yellow'
    case 'Open':
      return 'red'
  }
}

export function ChallengeItem({ challenge }: { challenge: ChallengeWithRelations }) {
  const [updateOpen, setUpdateOpen] = useState(false)

  return (
    <>
      <UnstyledButton onClick={() => setUpdateOpen(true)} style={{ width: '100%' }}>
        <Group
          justify="space-between"
          wrap="nowrap"
          py="xs"
          style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
        >
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text fw={500} td={challenge.status === 'Resolved' ? 'line-through' : undefined}>
              {challenge.title}
            </Text>
            <Group gap={6} wrap="wrap">
              <Badge size="xs" color={statusColor(challenge.status)} variant="light">
                {challenge.status}
              </Badge>
              {challenge.priority !== 'Medium' && (
                <Badge size="xs" color={priorityColor(challenge.priority)} variant="outline">
                  {challenge.priority}
                </Badge>
              )}
              {challenge.owner && (
                <Text size="xs" c="dimmed">
                  {challenge.owner.name}
                </Text>
              )}
              {challenge.event && (
                <Text size="xs" c="dimmed">
                  · {challenge.event.name}
                </Text>
              )}
            </Group>
          </Stack>
        </Group>
      </UnstyledButton>
      <UpdateChallengeModal challenge={challenge} opened={updateOpen} onClose={() => setUpdateOpen(false)} />
    </>
  )
}
