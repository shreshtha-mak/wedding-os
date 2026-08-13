import { useState } from 'react'
import {
  ActionIcon,
  Badge,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconArrowLeft, IconPlus } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useEvents } from '../../lib/queries'
import { useTasksForEvent } from '../tasks/api'
import { TaskItem } from '../tasks/TaskItem'
import { AddTaskModal } from '../tasks/AddTaskModal'
import { useEventTimeline } from './api'
import { AddTimelineItemModal } from './AddTimelineItemModal'
import { computeEventReadiness, readinessColor } from './readiness'

function formatTime(time: string | null) {
  if (!time) return null
  return dayjs(`2000-01-01T${time}`).format('h:mm A')
}

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { person } = useAuth()
  const canManage = person?.role_id === 'admin' || person?.role_id === 'organiser'

  const { data: events, isLoading: eventsLoading } = useEvents()
  const event = events?.find((e) => e.id === eventId)

  const { data: tasks, isLoading: tasksLoading } = useTasksForEvent(eventId)
  const { data: timeline, isLoading: timelineLoading } = useEventTimeline(eventId)

  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [addTimelineOpen, setAddTimelineOpen] = useState(false)

  if (eventsLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    )
  }

  if (!event) {
    return (
      <Stack p="md" gap="md">
        <Text c="dimmed">Event not found.</Text>
      </Stack>
    )
  }

  const readiness = canManage ? computeEventReadiness(tasks ?? []) : null

  return (
    <Stack p="md" pb={96} gap="md">
      <Group gap="xs">
        <ActionIcon variant="subtle" onClick={() => navigate('/events')} aria-label="Back to events">
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={3}>{event.name}</Title>
      </Group>

      <Card withBorder radius="md" p="lg">
        <Text size="sm" c="dimmed">
          {event.day_label} · {dayjs(event.event_date).format('DD MMM YYYY')}
          {formatTime(event.start_time) ? ` · ${formatTime(event.start_time)}` : ''}
        </Text>
        {event.location && <Text size="sm">{event.location}</Text>}
        {readiness && (
          <Badge mt="sm" color={readinessColor(readiness.percent)} variant="light">
            {readiness.percent === null
              ? 'No tasks yet'
              : `${readiness.percent}% ready (${readiness.completed}/${readiness.total} tasks)`}
          </Badge>
        )}
      </Card>

      <Group justify="space-between">
        <Title order={4}>Tasks</Title>
        <ActionIcon variant="subtle" onClick={() => setAddTaskOpen(true)} aria-label="Add task">
          <IconPlus size={20} />
        </ActionIcon>
      </Group>
      {tasksLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!tasksLoading && tasks?.length === 0 && (
        <Text c="dimmed" size="sm">
          No tasks for this event yet.
        </Text>
      )}
      {tasks?.map((task) => <TaskItem key={task.id} task={task} />)}

      <Group justify="space-between" mt="md">
        <Title order={4}>Timeline</Title>
        {canManage && (
          <ActionIcon variant="subtle" onClick={() => setAddTimelineOpen(true)} aria-label="Add timeline item">
            <IconPlus size={20} />
          </ActionIcon>
        )}
      </Group>
      {timelineLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!timelineLoading && timeline?.length === 0 && (
        <Text c="dimmed" size="sm">
          No timeline items yet.
        </Text>
      )}
      <Stack gap={4}>
        {timeline?.map((item) => (
          <Group
            key={item.id}
            wrap="nowrap"
            gap="sm"
            py={6}
            style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
          >
            <Text size="sm" c="dimmed" w={72}>
              {formatTime(item.start_time) ?? '—'}
            </Text>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm">{item.activity}</Text>
              {(item.location || item.responsible_person) && (
                <Text size="xs" c="dimmed">
                  {[item.location, item.responsible_person?.name].filter(Boolean).join(' · ')}
                </Text>
              )}
            </div>
          </Group>
        ))}
      </Stack>

      <AddTaskModal opened={addTaskOpen} onClose={() => setAddTaskOpen(false)} defaultEventId={event.id} />
      {canManage && (
        <AddTimelineItemModal
          eventId={event.id}
          opened={addTimelineOpen}
          onClose={() => setAddTimelineOpen(false)}
        />
      )}
    </Stack>
  )
}
