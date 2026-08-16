import { useState } from 'react'
import { Group, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import type { ReactNode } from 'react'

// Generic collapsible page section — heading + optional summary, tap to
// reveal the body. Used to keep long pages (Event Detail's Tasks/
// Decisions/Outfits/etc.) scannable by default instead of every section's
// full list rendering permanently. `action` (e.g. a "+ Add" button) stays
// a sibling of the toggle, never nested inside it.
export function CollapsibleSection({
  title,
  summary,
  action,
  defaultExpanded = false,
  children,
}: {
  title: string
  summary?: ReactNode
  action?: ReactNode
  defaultExpanded?: boolean
  children: ReactNode
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <Stack gap={0} mt="md">
      <Group justify="space-between" wrap="nowrap">
        <UnstyledButton onClick={() => setExpanded((v) => !v)} style={{ flex: 1, minWidth: 0 }}>
          <Group gap={6} wrap="nowrap">
            {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
            <Title order={4}>
              {title}
              {summary && (
                <Text span size="sm" c="dimmed">
                  {' '}
                  {summary}
                </Text>
              )}
            </Title>
          </Group>
        </UnstyledButton>
        {action}
      </Group>
      {expanded && <Stack gap={4} mt="xs">{children}</Stack>}
    </Stack>
  )
}
