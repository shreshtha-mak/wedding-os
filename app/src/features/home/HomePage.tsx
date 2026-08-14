import { Avatar, Badge, Card, Center, Group, Loader, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { IconAlertTriangle, IconSearch } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTasks } from '../tasks/api'
import { dueIndicator, dueIndicatorColor, priorityColor } from '../tasks/taskStatus'
import { useRecentActivity } from '../activity/api'
import { useDecisions } from '../decisions/api'
import { useChallenges } from '../challenges/api'
import { MonthGrid } from '../calendar/MonthGrid'
import { useWeddingReadinessData, useNeedsAttentionData } from '../readiness/api'
import { computeWeddingReadiness, readinessLevelColor, readinessLevelLabel } from '../readiness/calculate'
import { computeNeedsAttention } from '../readiness/needsAttention'
import { getCurrentEventState } from '../wedding-day/calculate'
import { WeddingDayView } from '../wedding-day/WeddingDayView'
import { useEvents, useWedding } from '../../lib/queries'

// The one deliberately expressive element on Home (design system §30): a
// serif display number rather than the same card treatment as everything
// else, so it reads as a moment rather than another dashboard widget.
function Countdown({ startDate, name }: { startDate: string | null; name: string }) {
  if (!startDate) return null
  const days = dayjs(startDate).startOf('day').diff(dayjs().startOf('day'), 'day')

  const value = days > 0 ? String(days) : days === 0 ? 'Today' : 'Underway'
  const caption = days > 0 ? (days === 1 ? 'DAY TO GO' : 'DAYS TO GO') : name.toUpperCase()

  return (
    <Stack gap={2} align="center" py="md">
      <Text size="sm" c="dimmed">
        {name}
      </Text>
      <Text style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, lineHeight: 1.1 }}>
        {value}
      </Text>
      <Text fz={11} fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
        {caption}
      </Text>
      <Text size="xs" c="dimmed" mt={4}>
        {dayjs(startDate).format('DD MMM YYYY')}
      </Text>
    </Stack>
  )
}

function ReadinessCard() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useWeddingReadinessData(true)
  const readiness = data ? computeWeddingReadiness(data) : null

  return (
    <UnstyledButton onClick={() => navigate('/readiness')}>
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed">
              Wedding Readiness
            </Text>
            {isError ? (
              <Text size="sm" c="red">
                Couldn't load
              </Text>
            ) : isLoading || !readiness ? (
              <Loader size="sm" mt={4} />
            ) : (
              <Title order={2}>{readiness.overallPercent ?? '—'}%</Title>
            )}
          </div>
          {readiness && (
            <Badge color={readinessLevelColor(readiness.level)} variant="light">
              {readinessLevelLabel(readiness.level)}
            </Badge>
          )}
        </Group>
      </Card>
    </UnstyledButton>
  )
}

function NeedsAttentionCard() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useNeedsAttentionData(true)
  const items = data ? computeNeedsAttention(data).slice(0, 5) : []

  if (!isLoading && !isError && items.length === 0) return null

  return (
    <UnstyledButton onClick={() => navigate('/readiness')} style={{ width: '100%' }}>
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="sm">
          Needs Attention
        </Title>
        {isLoading && (
          <Center py="md">
            <Loader size="sm" />
          </Center>
        )}
        {isError && (
          <Text size="sm" c="red">
            Couldn't load — check your connection.
          </Text>
        )}
        <Stack gap="xs">
          {items.map((item) => (
            <Group key={item.id} gap={6} wrap="nowrap">
              <IconAlertTriangle
                size={14}
                color={item.severity === 'critical' ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-yellow-6)'}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm">{item.label}</Text>
                <Text size="xs" c="dimmed">
                  {item.sublabel}
                </Text>
              </div>
            </Group>
          ))}
        </Stack>
      </Card>
    </UnstyledButton>
  )
}

function UpcomingEvents() {
  const navigate = useNavigate()
  const { data: events, isLoading } = useEvents()
  const upcoming = events?.filter((e) => !dayjs(e.event_date).isBefore(dayjs(), 'day')).slice(0, 3)

  return (
    <Card withBorder radius="md" p="lg">
      <UnstyledButton onClick={() => navigate('/events')} style={{ width: '100%' }}>
        <Title order={4} mb="sm">
          Upcoming Events
        </Title>
      </UnstyledButton>
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

// "My Things" — broader than just tasks: pulls together everything
// personally assigned to the current user across modules (spec: "What
// specifically needs my attention?" — distinct from any module's own full
// list).
function MyThings() {
  const navigate = useNavigate()
  const { person } = useAuth()
  const { data: tasks, isLoading: tasksLoading, isError: tasksError } = useTasks('mine', person?.id)
  const { data: decisions, isLoading: decisionsLoading, isError: decisionsError } = useDecisions('mine', person?.id)
  const { data: challenges, isLoading: challengesLoading, isError: challengesError } = useChallenges('mine', person?.id)

  // Deliberately Tasks/Decisions/Challenges only — Outfits and Things to
  // Take are important planning modules but not part of "what's mine" in
  // the sense this card means (per the screen spec: "do NOT create
  // separate My Outfits or My Vendors sections").
  const isLoading = tasksLoading || decisionsLoading || challengesLoading
  const isError = tasksError || decisionsError || challengesError

  const pendingTasks = (tasks ?? []).filter((t) => t.status !== 'Completed')
  const pendingDecisions = (decisions ?? []).filter((d) => d.status === 'Pending')
  const openChallenges = (challenges ?? []).filter((c) => c.status !== 'Resolved')

  const total = pendingTasks.length + pendingDecisions.length + openChallenges.length

  return (
    <UnstyledButton onClick={() => navigate('/planning')} style={{ width: '100%' }}>
      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="sm">
          My Things
        </Title>
        {isLoading && (
          <Center py="md">
            <Loader size="sm" />
          </Center>
        )}
        {isError && (
          <Text size="sm" c="red">
            Couldn't load everything — check your connection.
          </Text>
        )}
        {!isLoading && !isError && total === 0 && (
          <Text c="dimmed" size="sm">
            Nothing pending — you're all caught up.
          </Text>
        )}
        <Stack gap="xs">
          {pendingTasks.slice(0, 4).map((t) => {
          const indicator = dueIndicator(t)
          return (
            <Group key={t.id} justify="space-between" wrap="nowrap">
              <Text size="sm" style={{ flex: 1 }}>
                {t.name}
              </Text>
              {indicator && (
                <Badge size="xs" color={dueIndicatorColor(indicator)} variant="light">
                  {indicator}
                </Badge>
              )}
            </Group>
          )
        })}
        {pendingDecisions.slice(0, 2).map((d) => (
          <Group key={d.id} justify="space-between" wrap="nowrap">
            <Text size="sm" style={{ flex: 1 }}>
              {d.question}
            </Text>
            <Badge size="xs" color="blue" variant="light">
              Decision
            </Badge>
          </Group>
        ))}
        {openChallenges.slice(0, 2).map((c) => (
          <Group key={c.id} justify="space-between" wrap="nowrap">
            <Text size="sm" style={{ flex: 1 }}>
              {c.title}
            </Text>
            <Badge size="xs" color={priorityColor(c.priority)} variant="light">
              {c.priority}
            </Badge>
          </Group>
        ))}
        </Stack>
      </Card>
    </UnstyledButton>
  )
}

function DecisionsCard() {
  const navigate = useNavigate()
  const { person } = useAuth()
  const canSeeAll = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const { data: decisions, isLoading } = useDecisions(canSeeAll ? 'all' : 'mine', person?.id)
  const pending = decisions?.filter((d) => d.status === 'Pending').slice(0, 4)

  return (
    <UnstyledButton onClick={() => navigate('/planning?tab=decisions')} style={{ width: '100%' }}>
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
    </UnstyledButton>
  )
}

function ChallengesCard() {
  const navigate = useNavigate()
  const { person } = useAuth()
  const canSeeAll = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const { data: challenges, isLoading } = useChallenges(canSeeAll ? 'all' : 'mine', person?.id)
  const open = challenges?.filter((c) => c.status !== 'Resolved').slice(0, 4)

  return (
    <UnstyledButton onClick={() => navigate('/planning?tab=challenges')} style={{ width: '100%' }}>
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
    </UnstyledButton>
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
  const navigate = useNavigate()
  const { person } = useAuth()
  const { data: wedding } = useWedding()
  const { data: events } = useEvents()
  const canSeeReadiness = person?.role_id === 'admin' || person?.role_id === 'organiser'

  // Automatic — no manual "enter wedding day mode" toggle (spec: "the user
  // should not need to manually switch modes"). Whenever today is an event
  // day, Home's hierarchy flips from planning-mode to what's-happening-now.
  const currentEventState = events ? getCurrentEventState(events) : null

  return (
    <Stack p="md" pb={96} gap="md">
      <Group justify="space-between">
        <Title order={2}>Hi {person?.name?.split(' ')[0] ?? ''}</Title>
        <Group gap="md">
          <UnstyledButton onClick={() => navigate('/search')} aria-label="Search">
            <IconSearch size={22} />
          </UnstyledButton>
          <UnstyledButton onClick={() => navigate('/profile')} aria-label="My Profile">
            <Avatar radius="xl" size={30} color="accent">
              {person?.name?.[0]?.toUpperCase() ?? '?'}
            </Avatar>
          </UnstyledButton>
        </Group>
      </Group>

      {currentEventState ? (
        <WeddingDayView state={currentEventState} />
      ) : (
        <>
          {wedding && <Countdown startDate={wedding.start_date} name={wedding.name} />}
          {canSeeReadiness && <ReadinessCard />}
          {canSeeReadiness && <NeedsAttentionCard />}
          <MyThings />
          <UpcomingEvents />
          <MonthGrid />
          <DecisionsCard />
          <ChallengesCard />
        </>
      )}
      <RecentActivity />
    </Stack>
  )
}
