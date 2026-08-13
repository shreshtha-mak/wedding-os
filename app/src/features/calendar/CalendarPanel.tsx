import { Badge, Center, Group, Loader, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useCalendarItems } from './api'
import type { CalendarItem, CalendarItemType } from './api'

const TYPE_COLOR: Record<CalendarItemType, string> = {
  event: 'blue',
  task: 'gray',
  decision: 'grape',
}

function groupByDate(items: CalendarItem[]) {
  const groups = new Map<string, CalendarItem[]>()
  for (const item of items) {
    const list = groups.get(item.date) ?? []
    list.push(item)
    groups.set(item.date, list)
  }
  return [...groups.entries()]
}

export function CalendarPanel() {
  const navigate = useNavigate()
  const { data: items, isLoading, isError } = useCalendarItems()
  const upcoming = items?.filter((i) => !dayjs(i.date).isBefore(dayjs(), 'day'))
  const groups = groupByDate(upcoming ?? [])

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Calendar</Title>

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load the calendar. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && groups.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">Nothing scheduled yet.</Text>
        </Center>
      )}

      <Stack gap="md">
        {groups.map(([date, dayItems]) => (
          <Stack key={date} gap={4}>
            <Text size="sm" fw={600} c="dimmed">
              {dayjs(date).format('dddd, DD MMM YYYY')}
            </Text>
            {dayItems.map((item) => (
              <UnstyledButton key={`${item.type}-${item.id}`} onClick={() => navigate(item.linkTo)}>
                <Group
                  wrap="nowrap"
                  py={6}
                  style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
                >
                  <Badge size="xs" color={TYPE_COLOR[item.type]} variant="light" w={72}>
                    {item.type}
                  </Badge>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm">{item.label}</Text>
                    {item.sublabel && (
                      <Text size="xs" c="dimmed">
                        {item.sublabel}
                      </Text>
                    )}
                  </div>
                </Group>
              </UnstyledButton>
            ))}
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
