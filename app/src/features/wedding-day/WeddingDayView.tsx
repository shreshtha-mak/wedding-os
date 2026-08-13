import { Badge, Card, Center, Checkbox, Group, Loader, Stack, Text, Title } from '@mantine/core'
import dayjs from 'dayjs'
import { useAuth } from '../auth/AuthContext'
import { useTasksForEvent } from '../tasks/api'
import { TaskItem } from '../tasks/TaskItem'
import { useEventTimeline } from '../events/api'
import { useMenuForEvent } from '../menus/api'
import { useVendors } from '../vendors/api'
import { useThingsForEvent } from '../things/api'
import { useAttendanceForEvent, useMarkArrived } from '../guests/api'
import type { CurrentEventState } from './calculate'

function formatTime(time: string | null) {
  if (!time) return null
  return dayjs(`2000-01-01T${time}`).format('h:mm A')
}

function EventStatus({ eventId }: { eventId: string }) {
  const { data: menu } = useMenuForEvent(eventId)
  const { data: allVendors } = useVendors()
  const { data: things } = useThingsForEvent(eventId)

  const assignments = allVendors?.flatMap((v) =>
    v.assignments.filter((a) => a.event_id === eventId).map((a) => ({ ...a, vendorName: v.name })),
  )
  const notReadyThings = things?.filter((t) => t.status !== 'Packed' && t.status !== 'At Venue')

  return (
    <Card withBorder radius="md" p="lg">
      <Title order={4} mb="sm">
        Event Status
      </Title>
      <Stack gap={6}>
        <Group justify="space-between">
          <Text size="sm">Menu</Text>
          <Badge size="xs" color={menu?.status === 'Finalised' ? 'green' : 'gray'} variant="light">
            {menu?.status ?? 'Not started'}
          </Badge>
        </Group>
        {assignments?.map((a) => (
          <Group key={a.id} justify="space-between">
            <Text size="sm">{a.vendorName}</Text>
            <Badge size="xs" color={a.status === 'Completed' || a.status === 'Confirmed' ? 'green' : 'gray'} variant="light">
              {a.status}
            </Badge>
          </Group>
        ))}
        {notReadyThings && notReadyThings.length > 0 && (
          <>
            <Text size="xs" c="dimmed" mt={4}>
              Not ready:
            </Text>
            {notReadyThings.map((t) => (
              <Text key={t.id} size="sm" c="orange">
                {t.item_name} — {t.status}
              </Text>
            ))}
          </>
        )}
      </Stack>
    </Card>
  )
}

function YourTasks({ eventId }: { eventId: string }) {
  const { person } = useAuth()
  const { data: tasks, isLoading } = useTasksForEvent(eventId)
  const mine = tasks?.filter((t) => t.assigned_person_id === person?.id && t.status !== 'Completed')

  return (
    <Card withBorder radius="md" p="lg">
      <Title order={4} mb="sm">
        Your Tasks
      </Title>
      {isLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!isLoading && mine?.length === 0 && (
        <Text c="dimmed" size="sm">
          Nothing on your plate for this event.
        </Text>
      )}
      {mine?.map((t) => <TaskItem key={t.id} task={t} />)}
    </Card>
  )
}

function GuestArrivals({ eventId }: { eventId: string }) {
  const { data: attendance, isLoading } = useAttendanceForEvent(eventId)
  const markArrived = useMarkArrived()

  if (isLoading || !attendance || attendance.length === 0) return null

  const arrivedCount = attendance.filter((a) => a.arrived).length

  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" mb="sm">
        <Title order={4}>Guests</Title>
        <Text size="sm" c="dimmed">
          {arrivedCount}/{attendance.length} arrived
        </Text>
      </Group>
      <Stack gap={4}>
        {attendance.map((a) => (
          <Checkbox
            key={a.id}
            label={a.guestName}
            checked={a.arrived}
            onChange={(e) => markArrived.mutate({ id: a.id, arrived: e.currentTarget.checked, eventId })}
          />
        ))}
      </Stack>
    </Card>
  )
}

function WhatsNext({ eventId }: { eventId: string }) {
  const { data: timeline, isLoading } = useEventTimeline(eventId)
  const now = dayjs().format('HH:mm:ss')
  const upcoming = timeline?.filter((t) => !t.start_time || t.start_time >= now).slice(0, 4)

  return (
    <Card withBorder radius="md" p="lg">
      <Title order={4} mb="sm">
        Next
      </Title>
      {isLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!isLoading && upcoming?.length === 0 && (
        <Text c="dimmed" size="sm">
          Nothing left on the timeline.
        </Text>
      )}
      <Stack gap={4}>
        {upcoming?.map((item) => (
          <Group key={item.id} gap="sm" wrap="nowrap">
            <Text size="sm" c="dimmed" w={64}>
              {formatTime(item.start_time) ?? '—'}
            </Text>
            <Text size="sm">{item.activity}</Text>
          </Group>
        ))}
      </Stack>
    </Card>
  )
}

export function WeddingDayView({ state }: { state: CurrentEventState }) {
  const { person } = useAuth()
  const canManage = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const { event, countdownLabel } = state

  return (
    <Stack gap="md">
      <Card withBorder radius="md" p="lg" style={{ background: 'var(--mantine-color-blue-light)' }}>
        <Text size="sm" c="dimmed">
          {event.day_label}
        </Text>
        <Title order={1}>{event.name}</Title>
        <Text size="lg">{countdownLabel}</Text>
        {event.location && (
          <Text size="sm" c="dimmed">
            {event.location}
          </Text>
        )}
      </Card>

      {canManage && <EventStatus eventId={event.id} />}
      <YourTasks eventId={event.id} />
      {canManage && <GuestArrivals eventId={event.id} />}
      <WhatsNext eventId={event.id} />
    </Stack>
  )
}
