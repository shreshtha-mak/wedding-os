import { Badge, Card, Center, Group, Loader, Stack, Text, Title } from '@mantine/core'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useEvents } from '../../lib/queries'
import { useTaskStatusesByEvent } from './api'
import { computeEventReadiness, readinessColor } from './readiness'

export function EventsPage() {
  const { person } = useAuth()
  const canSeeReadiness = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const navigate = useNavigate()
  const { data: events, isLoading, isError } = useEvents()
  const { data: statuses } = useTaskStatusesByEvent()

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Events</Title>

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load events. Check your connection and try again.
        </Text>
      )}

      {events?.map((event) => {
        const eventTaskStatuses = statuses?.filter((s) => s.event_id === event.id) ?? []
        const readiness = computeEventReadiness(eventTaskStatuses)

        return (
          <Card
            key={event.id}
            withBorder
            radius="md"
            p="lg"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/events/${event.id}`)}
          >
            <Group justify="space-between" wrap="nowrap">
              <div style={{ minWidth: 0 }}>
                <Text fw={600}>{event.name}</Text>
                <Text size="sm" c="dimmed">
                  {event.day_label} · {dayjs(event.event_date).format('DD MMM')}
                  {event.start_time ? ` · ${dayjs(`2000-01-01T${event.start_time}`).format('h:mm A')}` : ''}
                </Text>
                {event.location && (
                  <Text size="xs" c="dimmed">
                    {event.location}
                  </Text>
                )}
              </div>
              {canSeeReadiness && (
                <Badge color={readinessColor(readiness.percent)} variant="light">
                  {readiness.percent === null ? 'No tasks yet' : `${readiness.percent}% ready`}
                </Badge>
              )}
            </Group>
          </Card>
        )
      })}
    </Stack>
  )
}
