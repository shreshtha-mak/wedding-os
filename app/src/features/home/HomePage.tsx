import { Badge, Card, Center, Group, Loader, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTasks } from '../tasks/api'
import { dueIndicator, dueIndicatorColor } from '../tasks/taskStatus'
import { useRecentActivity } from '../activity/api'
import { useEvents, useWedding } from '../../lib/queries'

function Countdown({ startDate, name }: { startDate: string | null; name: string }) {
  if (!startDate) return null
  const days = dayjs(startDate).startOf('day').diff(dayjs().startOf('day'), 'day')

  let label: string
  if (days > 0) label = `${days} day${days === 1 ? '' : 's'} to go`
  else if (days === 0) label = 'Today!'
  else label = 'Underway'

  return (
    <Card withBorder radius="md" p="lg">
      <Text size="sm" c="dimmed">
        {name}
      </Text>
      <Title order={2}>{label}</Title>
      <Text size="sm" c="dimmed">
        {dayjs(startDate).format('DD MMM YYYY')}
      </Text>
    </Card>
  )
}

function UpcomingEvents() {
  const navigate = useNavigate()
  const { data: events, isLoading } = useEvents()
  const upcoming = events?.filter((e) => !dayjs(e.event_date).isBefore(dayjs(), 'day')).slice(0, 3)

  return (
    <Card withBorder radius="md" p="lg">
      <Title order={4} mb="sm">
        Upcoming Events
      </Title>
      {isLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!isLoading && upcoming?.length === 0 && (
        <Text c="dimmed" size="sm">
          No upcoming events.
        </Text>
      )}
      <Stack gap="xs">
        {upcoming?.map((e) => (
          <UnstyledButton key={e.id} onClick={() => navigate(`/events/${e.id}`)}>
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text fw={500}>{e.name}</Text>
                <Text size="xs" c="dimmed">
                  {e.day_label} · {e.location}
                </Text>
              </div>
              <Text size="sm" c="dimmed">
                {dayjs(e.event_date).format('DD MMM')}
              </Text>
            </Group>
          </UnstyledButton>
        ))}
      </Stack>
    </Card>
  )
}

function MyTasks() {
  const { person } = useAuth()
  const { data: tasks, isLoading } = useTasks('mine', person?.id)
  const pending = tasks?.filter((t) => t.status !== 'Completed').slice(0, 5)

  return (
    <Card withBorder radius="md" p="lg">
      <Title order={4} mb="sm">
        My Tasks
      </Title>
      {isLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!isLoading && pending?.length === 0 && (
        <Text c="dimmed" size="sm">
          Nothing pending — you're all caught up.
        </Text>
      )}
      <Stack gap="xs">
        {pending?.map((t) => {
          const indicator = dueIndicator(t)
          return (
            <Group key={t.id} justify="space-between" wrap="nowrap">
              <Text style={{ flex: 1 }}>{t.name}</Text>
              {indicator && (
                <Badge size="xs" color={dueIndicatorColor(indicator)} variant="light">
                  {indicator}
                </Badge>
              )}
            </Group>
          )
        })}
      </Stack>
    </Card>
  )
}

function RecentActivity() {
  const { data: activity, isLoading } = useRecentActivity(6)

  return (
    <Card withBorder radius="md" p="lg">
      <Title order={4} mb="sm">
        Recent Activity
      </Title>
      {isLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!isLoading && activity?.length === 0 && (
        <Text c="dimmed" size="sm">
          Nothing logged yet.
        </Text>
      )}
      <Stack gap={6}>
        {activity?.map((entry) => (
          <Text key={entry.id} size="sm">
            <Text span fw={500}>
              {entry.actor?.name ?? 'Someone'}
            </Text>{' '}
            {entry.summary}{' '}
            <Text span size="xs" c="dimmed">
              · {dayjs(entry.created_at).fromNow()}
            </Text>
          </Text>
        ))}
      </Stack>
    </Card>
  )
}

export function HomePage() {
  const { person } = useAuth()
  const { data: wedding } = useWedding()

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={2}>Hi {person?.name?.split(' ')[0] ?? ''}</Title>
      {wedding && <Countdown startDate={wedding.start_date} name={wedding.name} />}
      <MyTasks />
      <UpcomingEvents />
      <RecentActivity />
    </Stack>
  )
}
