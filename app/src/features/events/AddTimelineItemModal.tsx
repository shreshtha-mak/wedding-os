import { useState } from 'react'
import {
  Button,
  Collapse,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { usePeople } from '../../lib/queries'
import { useCreateTimelineItem } from './api'
import type { TimelineItemType } from '../../types/database'

const TYPES: TimelineItemType[] = [
  'Event activity', 'Vendor', 'Setup', 'Family', 'Guest', 'Food',
  'Ceremony', 'Performance', 'Photography', 'Transport', 'Packing',
  'Payment', 'Other',
]

export function AddTimelineItemModal({
  eventId,
  opened,
  onClose,
}: {
  eventId: string
  opened: boolean
  onClose: () => void
}) {
  const { person } = useAuth()
  const { data: people } = usePeople()
  const createItem = useCreateTimelineItem()

  const [activity, setActivity] = useState('')
  const [startTime, setStartTime] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [endTime, setEndTime] = useState('')
  const [type, setType] = useState<TimelineItemType>('Event activity')
  const [location, setLocation] = useState('')
  const [responsiblePersonId, setResponsiblePersonId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  function reset() {
    setActivity('')
    setStartTime('')
    setShowMore(false)
    setEndTime('')
    setType('Event activity')
    setLocation('')
    setResponsiblePersonId(null)
    setNotes('')
  }

  async function handleSubmit() {
    if (!activity.trim() || !person) return
    await createItem.mutateAsync({
      wedding_id: person.wedding_id,
      event_id: eventId,
      activity: activity.trim(),
      start_time: startTime || null,
      end_time: endTime || null,
      type,
      location: location.trim() || null,
      responsible_person_id: responsiblePersonId,
      notes: notes.trim() || null,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add timeline item" centered>
      <Stack gap="sm">
        <TextInput
          label="Activity"
          placeholder="e.g. Decorator arrives"
          required
          autoFocus
          value={activity}
          onChange={(e) => setActivity(e.currentTarget.value)}
        />
        <TimeInput label="Time" value={startTime} onChange={(e) => setStartTime(e.currentTarget.value)} />

        <UnstyledButton
          onClick={() => setShowMore((v) => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Text size="sm" c="dimmed">
            More details
          </Text>
          {showMore ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </UnstyledButton>

        <Collapse expanded={showMore}>
          <Stack gap="sm">
            <TimeInput
              label="End time"
              value={endTime}
              onChange={(e) => setEndTime(e.currentTarget.value)}
            />
            <Select
              label="Type"
              data={TYPES}
              value={type}
              onChange={(v) => setType((v as TimelineItemType) ?? 'Other')}
              allowDeselect={false}
            />
            <TextInput
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.currentTarget.value)}
            />
            <Select
              label="Responsible person"
              placeholder="None"
              clearable
              searchable
              data={people?.map((p) => ({ value: p.id, label: p.name })) ?? []}
              value={responsiblePersonId}
              onChange={setResponsiblePersonId}
            />
            <Textarea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
              autosize
              minRows={2}
            />
          </Stack>
        </Collapse>

        <Button
          onClick={handleSubmit}
          loading={createItem.isPending}
          disabled={!activity.trim()}
          fullWidth
          mt="xs"
        >
          Add to timeline
        </Button>
      </Stack>
    </Modal>
  )
}
