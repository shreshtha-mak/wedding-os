import { useState } from 'react'
import {
  Button,
  Checkbox,
  Collapse,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { useEvents, usePeople } from '../../lib/queries'
import { useCreateThing } from './api'

export function AddThingModal({
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
  const createThing = useCreateThing()

  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState<number | string>(1)
  const [responsiblePersonId, setResponsiblePersonId] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(!!defaultEventId)
  const [eventId, setEventId] = useState<string | null>(defaultEventId ?? null)
  const [purchaseRequired, setPurchaseRequired] = useState(false)
  const [cost, setCost] = useState<number | string>('')
  const [whereStored, setWhereStored] = useState('')
  const [notes, setNotes] = useState('')

  function reset() {
    setItemName('')
    setQuantity(1)
    setResponsiblePersonId(null)
    setShowMore(!!defaultEventId)
    setEventId(defaultEventId ?? null)
    setPurchaseRequired(false)
    setCost('')
    setWhereStored('')
    setNotes('')
  }

  async function handleSubmit() {
    if (!itemName.trim() || !person) return
    await createThing.mutateAsync({
      wedding_id: person.wedding_id,
      item_name: itemName.trim(),
      quantity: Number(quantity) || 1,
      responsible_person_id: responsiblePersonId,
      event_id: eventId,
      purchase_required: purchaseRequired,
      cost: cost === '' ? null : Number(cost),
      where_stored: whereStored.trim() || null,
      notes: notes.trim() || null,
      created_by: person.id,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add thing to take" centered>
      <Stack gap="sm">
        <TextInput
          label="Item"
          placeholder="e.g. Mehendi cones"
          required
          autoFocus
          value={itemName}
          onChange={(e) => setItemName(e.currentTarget.value)}
        />
        <NumberInput label="Quantity" min={1} value={quantity} onChange={setQuantity} />
        <Select
          label="Responsible"
          placeholder="Optional"
          clearable
          searchable
          data={people?.map((p) => ({ value: p.id, label: p.name })) ?? []}
          value={responsiblePersonId}
          onChange={setResponsiblePersonId}
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
            <Select
              label="Event"
              placeholder="None"
              clearable
              data={events?.map((e) => ({ value: e.id, label: e.name })) ?? []}
              value={eventId}
              onChange={setEventId}
            />
            <Checkbox
              label="Needs to be purchased"
              checked={purchaseRequired}
              onChange={(e) => setPurchaseRequired(e.currentTarget.checked)}
            />
            <NumberInput label="Cost" value={cost} onChange={setCost} />
            <TextInput
              label="Where stored"
              value={whereStored}
              onChange={(e) => setWhereStored(e.currentTarget.value)}
            />
            <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} autosize minRows={2} />
          </Stack>
        </Collapse>

        <Button
          onClick={handleSubmit}
          loading={createThing.isPending}
          disabled={!itemName.trim()}
          fullWidth
          mt="xs"
        >
          Add item
        </Button>
      </Stack>
    </Modal>
  )
}
