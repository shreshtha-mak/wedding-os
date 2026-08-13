import { Badge, Card, Center, Group, Loader, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTasks } from '../tasks/api'
import { dueIndicator, dueIndicatorColor, priorityColor } from '../tasks/taskStatus'
import { useRecentActivity } from '../activity/api'
import { useDecisions } from '../decisions/api'
import { useChallenges } from '../challenges/api'
import { useCalendarItems } from '../calendar/api'
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

function CompactCalendar() {
  const navigate = useNavigate()
  const { data: items, isLoading } = useCalendarItems()
  // Home's calendar is deliberately minimal — events + deadlines + decisions,
  // never every ordinary task (spec: "do not clutter the Home calendar").
  const majorItems = items
    ?.filter((i) => i.type !== 'task' && !dayjs(i.date).isBefore(dayjs(), 'day'))
    .slice(0, 4)

  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" mb="sm">
        <Title order={4}>Calendar</Title>
        <UnstyledButton onClick={() => navigate('/planning')}>
          <Text size="xs" c="dimmed">
            See all
          </Text>
        </UnstyledButton>
      </Group>
      {isLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!isLoading && majorItems?.length === 0 && (
        <Text c="dimmed" size="sm">
          Nothing major coming up.
        </Text>
      )}
      <Stack gap="xs">
        {majorItems?.map((item) => (
          <Group key={`${item.type}-${item.id}`} justify="space-between" wrap="nowrap">
            <Text size="sm" style={{ flex: 1 }}>
              {item.label}
            </Text>
            <Text size="xs" c="dimmed">
              {dayjs(item.date).format('DD MMM')}
            </Text>
          </Group>
        ))}
      </Stack>
    </Card>
  )
}

function DecisionsCard() {
  const { person } = useAuth()
  const canSeeAll = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const { data: decisions, isLoading } = useDecisions(canSeeAll ? 'all' : 'mine', person?.id)
  const pending = decisions?.filter((d) => d.status === 'Pending').slice(0, 4)

  return (
    <Card withBorder radius="md" p="lg">
      <Title order={4} mb="sm">
        Decisions
      </Title>
      {isLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!isLoading && pending?.length === 0 && (
        <Text c="dimmed" size="sm">
          No pending decisions.
        </Text>
      )}
      <Stack gap="xs">
        {pending?.map((d) => (
          <Group key={d.id} justify="space-between" wrap="nowrap">
            <Text size="sm" style={{ flex: 1 }}>
              {d.question}
            </Text>
            {d.deadline && (
              <Text size="xs" c="dimmed">
                {dayjs(d.deadline).format('DD MMM')}
              </Text>
            )}
          </Group>
        ))}
      </Stack>
    </Card>
  )
}

function ChallengesCard() {
  const { person } = useAuth()
  const canSeeAll = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const { data: challenges, isLoading } = useChallenges(canSeeAll ? 'all' : 'mine', person?.id)
  const open = challenges?.filter((c) => c.status !== 'Resolved').slice(0, 4)

  return (
    <Card withBorder radius="md" p="lg">
      <Title order={4} mb="sm">
        Challenges
      </Title>
      {isLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!isLoading && open?.length === 0 && (
        <Text c="dimmed" size="sm">
          No open challenges 🎉
        </Text>
      )}
      <Stack gap="xs">
        {open?.map((c) => (
          <Group key={c.id} justify="space-between" wrap="nowrap">
            <Text size="sm" style={{ flex: 1 }}>
              {c.title}
            </Text>
            {c.priority !== 'Medium' && (
              <Badge size="xs" color={priorityColor(c.priority)} variant="light">
                {c.priority}
              </Badge>
            )}
          </Group>
        ))}
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
      <CompactCalendar />
      <DecisionsCard />
      <ChallengesCard />
      <RecentActivity />
    </Stack>
  )
}
