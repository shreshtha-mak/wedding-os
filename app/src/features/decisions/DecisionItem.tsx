import { useState } from 'react'
import { Badge, Group, Stack, Text, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import type { DecisionWithRelations } from './api'
import { DecideModal } from './DecideModal'

function deadlineBadge(decision: DecisionWithRelations) {
  if (decision.status === 'Decided') return { label: 'Decided', color: 'green' }
  if (!decision.deadline) return null
  const days = dayjs(decision.deadline).startOf('day').diff(dayjs().startOf('day'), 'day')
  if (days < 0) return { label: 'Overdue', color: 'red' }
  if (days === 0) return { label: 'Due today', color: 'orange' }
  if (days <= 3) return { label: 'Due soon', color: 'yellow' }
  return null
}

export function DecisionItem({ decision }: { decision: DecisionWithRelations }) {
  const [decideOpen, setDecideOpen] = useState(false)
  const badge = deadlineBadge(decision)
  const isPending = decision.status === 'Pending'

  return (
    <>
      <UnstyledButton onClick={() => isPending && setDecideOpen(true)} style={{ width: '100%' }}>
        <Group
          justify="space-between"
          wrap="nowrap"
          py="xs"
          style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
        >
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text fw={500}>{decision.question}</Text>
            <Group gap={6} wrap="wrap">
              {badge && (
                <Badge size="xs" color={badge.color} variant="light">
                  {badge.label}
                </Badge>
              )}
              {decision.status === 'Decided' && decision.selected_option && (
                <Text size="xs" c="dimmed">
                  Selected: {decision.selected_option}
                </Text>
              )}
              {decision.responsible_person && (
                <Text size="xs" c="dimmed">
                  {decision.responsible_person.name}
                </Text>
              )}
              {decision.event && (
                <Text size="xs" c="dimmed">
                  · {decision.event.name}
                </Text>
              )}
            </Group>
          </Stack>
        </Group>
      </UnstyledButton>
      {isPending && (
        <DecideModal decision={decision} opened={decideOpen} onClose={() => setDecideOpen(false)} />
      )}
    </>
  )
}
