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
import { DateInput } from '@mantine/dates'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { useCreateTask } from './api'
import { useEvents, usePeople, useTaskCategories } from '../../lib/queries'
import type { TaskPriority } from '../../types/database'

export function AddTaskModal({
  opened,
  onClose,
  defaultEventId,
}: {
  opened: boolean
  onClose: () => void
  // Preserves context when adding a task from inside an event's page,
  // instead of making the user re-pick the event they're already looking at.
  defaultEventId?: string
}) {
  const { person } = useAuth()
  const { data: people } = usePeople()
  const { data: events } = useEvents()
  const { data: categories } = useTaskCategories()
  const createTask = useCreateTask()

  const [name, setName] = useState('')
  const [assignedPersonId, setAssignedPersonId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(!!defaultEventId)
  const [description, setDescription] = useState('')
  const [eventId, setEventId] = useState<string | null>(defaultEventId ?? null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [priority, setPriority] = useState<TaskPriority>('Medium')

  function reset() {
    setName('')
    setAssignedPersonId(null)
    setDueDate(null)
    setShowMore(!!defaultEventId)
    setDescription('')
    setEventId(defaultEventId ?? null)
    setCategoryId(null)
    setPriority('Medium')
  }

  async function handleSubmit() {
    if (!name.trim() || !person) return
    await createTask.mutateAsync({
      wedding_id: person.wedding_id,
      name: name.trim(),
      assigned_person_id: assignedPersonId,
      due_date: dueDate,
      description: description.trim() || null,
      event_id: eventId,
      category_id: categoryId,
      priority,
      created_by: person.id,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add task" centered>
      <Stack gap="sm">
        <TextInput
          label="Task"
          placeholder="e.g. Pick up flowers"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Select
          label="Assign to"
          placeholder="Anyone"
          clearable
          searchable
          data={people?.map((p) => ({ value: p.id, label: p.name })) ?? []}
          value={assignedPersonId}
          onChange={setAssignedPersonId}
        />
        <DateInput
          label="Due date"
          placeholder="Optional"
          clearable
          value={dueDate}
          onChange={(v) => setDueDate(v)}
          valueFormat="DD MMM YYYY"
        />

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
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              autosize
              minRows={2}
            />
            <Select
              label="Event"
              placeholder="None"
              clearable
              data={events?.map((e) => ({ value: e.id, label: e.name })) ?? []}
              value={eventId}
              onChange={setEventId}
            />
            <Select
              label="Category"
              placeholder="None"
              clearable
              searchable
              data={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
              value={categoryId}
              onChange={setCategoryId}
            />
            <Select
              label="Priority"
              data={['Low', 'Medium', 'High', 'Critical']}
              value={priority}
              onChange={(v) => setPriority((v as TaskPriority) ?? 'Medium')}
              allowDeselect={false}
            />
          </Stack>
        </Collapse>

        <Button
          onClick={handleSubmit}
          loading={createTask.isPending}
          disabled={!name.trim()}
          fullWidth
          mt="xs"
        >
          Add task
        </Button>
      </Stack>
    </Modal>
  )
}
