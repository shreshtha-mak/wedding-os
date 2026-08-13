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
import { useEvents, usePeople, useTaskCategories } from '../../lib/queries'
import { useCreateChallenge } from './api'
import type { TaskPriority } from '../../types/database'

export function AddChallengeModal({
  opened,
  onClose,
  defaultEventId,
}: {
  opened: boolean
  onClose: () => void
  defaultEventId?: string
}) {
  const { person } = useAuth()
  const { data: people } = usePeople()
  const { data: events } = useEvents()
  const { data: categories } = useTaskCategories()
  const createChallenge = useCreateChallenge()

  const [title, setTitle] = useState('')
  const [ownerPersonId, setOwnerPersonId] = useState<string | null>(null)
  const [priority, setPriority] = useState<TaskPriority>('Medium')
  const [showMore, setShowMore] = useState(!!defaultEventId)
  const [description, setDescription] = useState('')
  const [eventId, setEventId] = useState<string | null>(defaultEventId ?? null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [deadline, setDeadline] = useState<string | null>(null)

  function reset() {
    setTitle('')
    setOwnerPersonId(null)
    setPriority('Medium')
    setShowMore(!!defaultEventId)
    setDescription('')
    setEventId(defaultEventId ?? null)
    setCategoryId(null)
    setDeadline(null)
  }

  async function handleSubmit() {
    if (!title.trim() || !person) return
    await createChallenge.mutateAsync({
      wedding_id: person.wedding_id,
      title: title.trim(),
      owner_person_id: ownerPersonId,
      priority,
      description: description.trim() || null,
      event_id: eventId,
      category_id: categoryId,
      deadline,
      created_by: person.id,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add challenge" centered>
      <Stack gap="sm">
        <TextInput
          label="What's the problem?"
          placeholder="e.g. Decorator can't provide enough chairs"
          required
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
        <Select
          label="Owner"
          placeholder="Who's handling this"
          clearable
          searchable
          data={people?.map((p) => ({ value: p.id, label: p.name })) ?? []}
          value={ownerPersonId}
          onChange={setOwnerPersonId}
        />
        <Select
          label="Priority"
          data={['Low', 'Medium', 'High', 'Critical']}
          value={priority}
          onChange={(v) => setPriority((v as TaskPriority) ?? 'Medium')}
          allowDeselect={false}
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
            <DateInput
              label="Deadline"
              placeholder="Optional"
              clearable
              value={deadline}
              onChange={(v) => setDeadline(v)}
              valueFormat="DD MMM YYYY"
            />
          </Stack>
        </Collapse>

        <Button
          onClick={handleSubmit}
          loading={createChallenge.isPending}
          disabled={!title.trim()}
          fullWidth
          mt="xs"
        >
          Add challenge
        </Button>
      </Stack>
    </Modal>
  )
}
