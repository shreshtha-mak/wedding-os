import { useState } from 'react'
import {
  ActionIcon,
  Alert,
  Badge,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { IconAlertTriangle, IconArrowLeft, IconPlus } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useEvents } from '../../lib/queries'
import { useTasksForEvent } from '../tasks/api'
import { TaskItem } from '../tasks/TaskItem'
import { AddTaskModal } from '../tasks/AddTaskModal'
import { useDecisionsForEvent } from '../decisions/api'
import { DecisionItem } from '../decisions/DecisionItem'
import { AddDecisionModal } from '../decisions/AddDecisionModal'
import { useChallengesForEvent } from '../challenges/api'
import { ChallengeItem } from '../challenges/ChallengeItem'
import { AddChallengeModal } from '../challenges/AddChallengeModal'
import { useOutfitsForEvent } from '../outfits/api'
import { OutfitItem } from '../outfits/OutfitItem'
import { AddOutfitModal } from '../outfits/AddOutfitModal'
import { useThingsForEvent } from '../things/api'
import { ThingItem } from '../things/ThingItem'
import { AddThingModal } from '../things/AddThingModal'
import { useVendors } from '../vendors/api'
import { AssignVendorToEventModal } from '../vendors/AssignVendorToEventModal'
import { useMenuForEvent } from '../menus/api'
import { MenuDetailModal } from '../menus/MenuDetailModal'
import { useDecorForEvent } from '../decor/api'
import { DecorItemRow } from '../decor/DecorItemRow'
import { AddDecorModal } from '../decor/AddDecorModal'
import { useEventTimeline } from './api'
import { AddTimelineItemModal } from './AddTimelineItemModal'
import { computeEventReadiness, readinessColor } from './readiness'
import { ContextDocuments } from '../documents/ContextDocuments'

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

  const { data: tasks, isLoading: tasksLoading, isError: tasksError } = useTasksForEvent(eventId)
  const { data: timeline, isLoading: timelineLoading, isError: timelineError } = useEventTimeline(eventId)
  const { data: decisions, isLoading: decisionsLoading, isError: decisionsError } = useDecisionsForEvent(eventId)
  const { data: challenges, isLoading: challengesLoading, isError: challengesError } = useChallengesForEvent(eventId)
  const { data: outfits, isLoading: outfitsLoading, isError: outfitsError } = useOutfitsForEvent(eventId)
  const { data: things, isLoading: thingsLoading, isError: thingsError } = useThingsForEvent(eventId)
  const { data: allVendors, isLoading: vendorsLoading, isError: vendorsError } = useVendors()
  const { data: menu } = useMenuForEvent(canManage ? eventId : undefined)
  const { data: decorItems, isLoading: decorLoading, isError: decorError } = useDecorForEvent(
    canManage ? eventId : undefined,
  )

  const hasLoadError =
    tasksError ||
    timelineError ||
    decisionsError ||
    challengesError ||
    outfitsError ||
    thingsError ||
    vendorsError ||
    decorError

  const [addTaskOpen, setAddTaskOpen] = useState(false)
  const [addTimelineOpen, setAddTimelineOpen] = useState(false)
  const [addDecisionOpen, setAddDecisionOpen] = useState(false)
  const [addChallengeOpen, setAddChallengeOpen] = useState(false)
  const [addOutfitOpen, setAddOutfitOpen] = useState(false)
  const [addThingOpen, setAddThingOpen] = useState(false)
  const [addVendorOpen, setAddVendorOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [addDecorOpen, setAddDecorOpen] = useState(false)

  const eventVendorAssignments = allVendors
    ?.flatMap((v) => v.assignments.filter((a) => a.event_id === eventId).map((a) => ({ ...a, vendorName: v.name })))

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

      {hasLoadError && (
        <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
          Some information on this page couldn't load. Check your connection and try again.
        </Alert>
      )}

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
        {canManage && (
          <ActionIcon variant="subtle" onClick={() => setAddTaskOpen(true)} aria-label="Add task">
            <IconPlus size={20} />
          </ActionIcon>
        )}
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
        <Title order={4}>Decisions</Title>
        {canManage && (
          <ActionIcon variant="subtle" onClick={() => setAddDecisionOpen(true)} aria-label="Add decision">
            <IconPlus size={20} />
          </ActionIcon>
        )}
      </Group>
      {decisionsLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!decisionsLoading && decisions?.length === 0 && (
        <Text c="dimmed" size="sm">
          No decisions for this event yet.
        </Text>
      )}
      {decisions?.map((d) => <DecisionItem key={d.id} decision={d} />)}

      <Group justify="space-between" mt="md">
        <Title order={4}>Challenges</Title>
        {canManage && (
          <ActionIcon variant="subtle" onClick={() => setAddChallengeOpen(true)} aria-label="Add challenge">
            <IconPlus size={20} />
          </ActionIcon>
        )}
      </Group>
      {challengesLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!challengesLoading && challenges?.length === 0 && (
        <Text c="dimmed" size="sm">
          No open challenges 🎉
        </Text>
      )}
      {challenges?.map((c) => <ChallengeItem key={c.id} challenge={c} />)}

      <Group justify="space-between" mt="md">
        <Title order={4}>
          Outfits
          {outfits && outfits.length > 0 && (
            <Text span size="sm" c="dimmed">
              {' '}
              ({outfits.filter((o) => o.is_ready).length}/{outfits.length} ready)
            </Text>
          )}
        </Title>
        <ActionIcon variant="subtle" onClick={() => setAddOutfitOpen(true)} aria-label="Add outfit">
          <IconPlus size={20} />
        </ActionIcon>
      </Group>
      {outfitsLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!outfitsLoading && outfits?.length === 0 && (
        <Text c="dimmed" size="sm">
          No outfits tracked for this event yet.
        </Text>
      )}
      {outfits?.map((o) => <OutfitItem key={o.id} outfit={o} label={o.person.name} />)}

      <Group justify="space-between" mt="md">
        <Title order={4}>Things to Take</Title>
        {canManage && (
          <ActionIcon variant="subtle" onClick={() => setAddThingOpen(true)} aria-label="Add thing to take">
            <IconPlus size={20} />
          </ActionIcon>
        )}
      </Group>
      {thingsLoading && (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      )}
      {!thingsLoading && things?.length === 0 && (
        <Text c="dimmed" size="sm">
          Nothing on the list for this event yet.
        </Text>
      )}
      {things?.map((t) => <ThingItem key={t.id} thing={t} />)}

      {canManage && (
        <>
          <Group justify="space-between" mt="md">
            <Title order={4}>Menu</Title>
          </Group>
          <UnstyledButton onClick={() => setMenuOpen(true)}>
            <Badge
              color={menu?.status === 'Finalised' ? 'green' : menu?.status === 'Discussing' ? 'yellow' : 'gray'}
              variant="light"
            >
              {menu?.status ?? 'Not started'}
            </Badge>
          </UnstyledButton>

          <Group justify="space-between" mt="md">
            <Title order={4}>Vendors</Title>
            <ActionIcon variant="subtle" onClick={() => setAddVendorOpen(true)} aria-label="Assign vendor">
              <IconPlus size={20} />
            </ActionIcon>
          </Group>
          {vendorsLoading && (
            <Center py="md">
              <Loader size="sm" />
            </Center>
          )}
          {!vendorsLoading && eventVendorAssignments?.length === 0 && (
            <Text c="dimmed" size="sm">
              No vendors assigned to this event yet.
            </Text>
          )}
          {eventVendorAssignments?.map((a) => (
            <Group key={a.id} justify="space-between" wrap="nowrap" py={6}>
              <Text size="sm">
                {a.vendorName}
                {a.responsibility && (
                  <Text span size="xs" c="dimmed">
                    {' '}
                    — {a.responsibility}
                  </Text>
                )}
              </Text>
              <Badge size="xs" color={a.status === 'Completed' ? 'green' : a.status === 'Confirmed' ? 'blue' : 'gray'} variant="light">
                {a.status}
              </Badge>
            </Group>
          ))}

          <Group justify="space-between" mt="md">
            <Title order={4}>Decor</Title>
            <ActionIcon variant="subtle" onClick={() => setAddDecorOpen(true)} aria-label="Add decor item">
              <IconPlus size={20} />
            </ActionIcon>
          </Group>
          {decorLoading && (
            <Center py="md">
              <Loader size="sm" />
            </Center>
          )}
          {!decorLoading && decorItems?.length === 0 && (
            <Text c="dimmed" size="sm">
              No decor items for this event yet.
            </Text>
          )}
          {decorItems?.map((item) => <DecorItemRow key={item.id} item={item} />)}
        </>
      )}

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

      <ContextDocuments eventId={event.id} />

      {canManage && (
        <AddTaskModal opened={addTaskOpen} onClose={() => setAddTaskOpen(false)} defaultEventId={event.id} />
      )}
      {canManage && (
        <AddDecisionModal
          opened={addDecisionOpen}
          onClose={() => setAddDecisionOpen(false)}
          defaultEventId={event.id}
        />
      )}
      <AddOutfitModal opened={addOutfitOpen} onClose={() => setAddOutfitOpen(false)} defaultEventId={event.id} />
      {canManage && (
        <AddThingModal opened={addThingOpen} onClose={() => setAddThingOpen(false)} defaultEventId={event.id} />
      )}
      {canManage && (
        <AddChallengeModal
          opened={addChallengeOpen}
          onClose={() => setAddChallengeOpen(false)}
          defaultEventId={event.id}
        />
      )}
      {canManage && (
        <AddTimelineItemModal
          eventId={event.id}
          eventName={event.name}
          opened={addTimelineOpen}
          onClose={() => setAddTimelineOpen(false)}
        />
      )}
      {canManage && (
        <AssignVendorToEventModal
          eventId={event.id}
          opened={addVendorOpen}
          onClose={() => setAddVendorOpen(false)}
        />
      )}
      {canManage && (
        <MenuDetailModal
          eventId={event.id}
          eventName={event.name}
          opened={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      )}
      {canManage && (
        <AddDecorModal opened={addDecorOpen} onClose={() => setAddDecorOpen(false)} defaultEventId={event.id} />
      )}
    </Stack>
  )
}
