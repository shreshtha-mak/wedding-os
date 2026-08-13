import { useState } from 'react'
import {
  Button,
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
import { DateInput, TimeInput } from '@mantine/dates'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { useEvents, usePeople } from '../../lib/queries'
import { useCreateTransportation } from './api'

export function AddTransportModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { person } = useAuth()
  const { data: people } = usePeople()
  const { data: events } = useEvents()
  const createTransport = useCreateTransportation()

  const [pickupLocation, setPickupLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [personId, setPersonId] = useState<string | null>(null)
  const [groupLabel, setGroupLabel] = useState('')
  const [eventId, setEventId] = useState<string | null>(null)
  const [transportDate, setTransportDate] = useState<string | null>(null)
  const [transportTime, setTransportTime] = useState('')
  const [responsiblePersonId, setResponsiblePersonId] = useState<string | null>(null)
  const [numPassengers, setNumPassengers] = useState<number | string>(1)
  const [notes, setNotes] = useState('')

  function reset() {
    setPickupLocation('')
    setDestination('')
    setShowMore(false)
    setPersonId(null)
    setGroupLabel('')
    setEventId(null)
    setTransportDate(null)
    setTransportTime('')
    setResponsiblePersonId(null)
    setNumPassengers(1)
    setNotes('')
  }

  async function handleSubmit() {
    if (!person) return
    await createTransport.mutateAsync({
      wedding_id: person.wedding_id,
      pickup_location: pickupLocation.trim() || null,
      destination: destination.trim() || null,
      person_id: personId,
      group_label: groupLabel.trim() || null,
      event_id: eventId,
      transport_date: transportDate,
      transport_time: transportTime || null,
      responsible_person_id: responsiblePersonId,
      num_passengers: Number(numPassengers) || 1,
      notes: notes.trim() || null,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add transport request" centered>
      <Stack gap="sm">
        <TextInput
          label="Pickup location"
          required
          autoFocus
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.currentTarget.value)}
        />
        <TextInput
          label="Destination"
          required
          value={destination}
          onChange={(e) => setDestination(e.currentTarget.value)}
        />
        <Select
          label="Person"
          placeholder="Optional — leave blank for a group"
          clearable
          searchable
          data={people?.map((p) => ({ value: p.id, label: p.name })) ?? []}
          value={personId}
          onChange={setPersonId}
        />
        {!personId && (
          <TextInput
            label="Group"
            placeholder="e.g. Sharma family"
            value={groupLabel}
            onChange={(e) => setGroupLabel(e.currentTarget.value)}
          />
        )}

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
            <DateInput label="Date" clearable value={transportDate} onChange={setTransportDate} valueFormat="DD MMM YYYY" />
            <TimeInput label="Time" value={transportTime} onChange={(e) => setTransportTime(e.currentTarget.value)} />
            <Select
              label="Responsible family member"
              placeholder="Optional"
              clearable
              searchable
              data={people?.map((p) => ({ value: p.id, label: p.name })) ?? []}
              value={responsiblePersonId}
              onChange={setResponsiblePersonId}
            />
            <NumberInput label="Passengers" min={1} value={numPassengers} onChange={setNumPassengers} />
            <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} autosize minRows={2} />
          </Stack>
        </Collapse>

        <Button
          onClick={handleSubmit}
          loading={createTransport.isPending}
          disabled={!pickupLocation.trim() || !destination.trim()}
          fullWidth
          mt="xs"
        >
          Add transport request
        </Button>
      </Stack>
    </Modal>
  )
}
