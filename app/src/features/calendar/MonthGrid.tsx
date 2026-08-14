import { Box, Card, Group, Text, Title, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useCalendarItems } from './api'
import type { CalendarItem, CalendarItemType } from './api'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const TYPE_DOT_COLOR: Record<CalendarItemType, string> = {
  event: 'accent',
  task: 'gray',
  decision: 'blue',
}

function buildMonthGrid(monthStart: dayjs.Dayjs): dayjs.Dayjs[] {
  const firstOfMonth = monthStart.startOf('month')
  const lastOfMonth = monthStart.endOf('month')
  const startWeekday = (firstOfMonth.day() + 6) % 7 // Monday = 0
  const endWeekday = (lastOfMonth.day() + 6) % 7
  const gridStart = firstOfMonth.subtract(startWeekday, 'day')
  const gridEnd = lastOfMonth.add(6 - endWeekday, 'day')

  const days: dayjs.Dayjs[] = []
  let cursor = gridStart
  while (!cursor.isAfter(gridEnd)) {
    days.push(cursor)
    cursor = cursor.add(1, 'day')
  }
  return days
}

// Home's calendar as a compact month grid rather than a scrolling date
// list (spec: "do not use a vertical list of dates on Home"). Only
// high-signal items — Events + Decisions, never every task — show as dots,
// matching the same filtering CompactCalendar used before it.
export function MonthGrid() {
  const navigate = useNavigate()
  const { data: items, isLoading } = useCalendarItems()
  const today = dayjs()
  const days = buildMonthGrid(today)

  const majorItems = (items ?? []).filter((i) => i.type !== 'task')
  const itemsByDate = new Map<string, CalendarItem[]>()
  for (const item of majorItems) {
    const list = itemsByDate.get(item.date) ?? []
    list.push(item)
    itemsByDate.set(item.date, list)
  }

  function handleDayClick(day: dayjs.Dayjs) {
    const dateKey = day.format('YYYY-MM-DD')
    const dayItems = itemsByDate.get(dateKey)
    if (dayItems?.length === 1) {
      navigate(dayItems[0].linkTo)
    } else {
      navigate('/planning?tab=calendar')
    }
  }

  return (
    <Card withBorder radius="md" p="lg">
      <UnstyledButton onClick={() => navigate('/planning?tab=calendar')} style={{ width: '100%' }}>
        <Group justify="space-between" mb="sm">
          <Title order={4}>{today.format('MMMM YYYY')}</Title>
          <Text size="xs" c="dimmed">
            See all
          </Text>
        </Group>
      </UnstyledButton>

      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} size="xs" c="dimmed" ta="center" fw={600}>
            {label}
          </Text>
        ))}
        {days.map((day) => {
          const dateKey = day.format('YYYY-MM-DD')
          const dayItems = itemsByDate.get(dateKey) ?? []
          const inMonth = day.month() === today.month()
          const isToday = dateKey === today.format('YYYY-MM-DD')

          return (
            <UnstyledButton
              key={dateKey}
              onClick={() => handleDayClick(day)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '4px 0',
                borderRadius: 6,
                opacity: inMonth ? 1 : 0.35,
                background: isToday ? 'var(--mantine-color-accent-light)' : undefined,
              }}
            >
              <Text size="xs" fw={isToday ? 700 : 400}>
                {day.date()}
              </Text>
              <Group gap={2} h={6} wrap="nowrap">
                {dayItems.slice(0, 3).map((item, idx) => (
                  <Box
                    key={idx}
                    w={4}
                    h={4}
                    style={{ borderRadius: '50%', background: `var(--mantine-color-${TYPE_DOT_COLOR[item.type]}-6)` }}
                  />
                ))}
              </Group>
            </UnstyledButton>
          )
        })}
      </Box>

      {!isLoading && majorItems.length === 0 && (
        <Text c="dimmed" size="sm" mt="sm">
          Nothing major coming up.
        </Text>
      )}
    </Card>
  )
}
