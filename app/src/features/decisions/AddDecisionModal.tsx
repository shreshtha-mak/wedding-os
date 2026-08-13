import { useState } from 'react'
import {
  Button,
  Collapse,
  Modal,
  Select,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { useEvents, usePeople, useTaskCategories } from '../../lib/queries'
import { useCreateDecision } from './api'

export function AddDecisionModal({
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
  const createDecision = useCreateDecision()

  const [question, setQuestion] = useState('')
  const [responsiblePersonId, setResponsiblePersonId] = useState<string | null>(null)
  const [deadline, setDeadline] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(!!defaultEventId)
  const [options, setOptions] = useState<string[]>([])
  const [eventId, setEventId] = useState<string | null>(defaultEventId ?? null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  function reset() {
    setQuestion('')
    setResponsiblePersonId(null)
    setDeadline(null)
    setShowMore(!!defaultEventId)
    setOptions([])
    setEventId(defaultEventId ?? null)
    setCategoryId(null)
    setNotes('')
  }

  async function handleSubmit() {
    if (!question.trim() || !person) return
    await createDecision.mutateAsync({
      wedding_id: person.wedding_id,
      question: question.trim(),
      responsible_person_id: responsiblePersonId,
      deadline,
      options,
      event_id: eventId,
      category_id: categoryId,
      notes: notes.trim() || null,
      created_by: person.id,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add decision" centered>
      <Stack gap="sm">
        <TextInput
          label="Question"
          placeholder="e.g. Which décor option?"
          required
          autoFocus
          value={question}
          onChange={(e) => setQuestion(e.currentTarget.value)}
        />
        <Select
          label="Responsible"
          placeholder="Who's driving this"
          clearable
          searchable
          data={people?.map((p) => ({ value: p.id, label: p.name })) ?? []}
          value={responsiblePersonId}
          onChange={setResponsiblePersonId}
        />
        <DateInput
          label="Deadline"
          placeholder="Optional"
          clearable
          value={deadline}
          onChange={(v) => setDeadline(v)}
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
            <TagsInput
              label="Options"
              placeholder="Type an option and press Enter"
              value={options}
              onChange={setOptions}
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
          loading={createDecision.isPending}
          disabled={!question.trim()}
          fullWidth
          mt="xs"
        >
          Add decision
        </Button>
      </Stack>
    </Modal>
  )
}
