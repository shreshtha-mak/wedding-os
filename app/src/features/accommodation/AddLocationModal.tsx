import { useState } from 'react'
import {
  Button,
  Collapse,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { useCreateLocation } from './api'

export function AddLocationModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { person } = useAuth()
  const createLocation = useCreateLocation()

  const [name, setName] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [type, setType] = useState('')
  const [address, setAddress] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [checkInTime, setCheckInTime] = useState('')
  const [checkOutTime, setCheckOutTime] = useState('')
  const [notes, setNotes] = useState('')

  function reset() {
    setName('')
    setShowMore(false)
    setType('')
    setAddress('')
    setContactPerson('')
    setPhone('')
    setCheckInTime('')
    setCheckOutTime('')
    setNotes('')
  }

  async function handleSubmit() {
    if (!name.trim() || !person) return
    await createLocation.mutateAsync({
      wedding_id: person.wedding_id,
      name: name.trim(),
      type: type.trim() || null,
      address: address.trim() || null,
      contact_person: contactPerson.trim() || null,
      phone: phone.trim() || null,
      check_in_time: checkInTime || null,
      check_out_time: checkOutTime || null,
      notes: notes.trim() || null,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add accommodation location" centered>
      <Stack gap="sm">
        <TextInput
          label="Name"
          placeholder="e.g. Taj Hotel"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <TextInput
          label="Type"
          placeholder="e.g. Hotel, Family home"
          value={type}
          onChange={(e) => setType(e.currentTarget.value)}
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
            <TextInput label="Address" value={address} onChange={(e) => setAddress(e.currentTarget.value)} />
            <TextInput
              label="Contact person"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.currentTarget.value)}
            />
            <TextInput label="Phone" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />
            <TimeInput
              label="Check-in time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.currentTarget.value)}
            />
            <TimeInput
              label="Check-out time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.currentTarget.value)}
            />
            <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} autosize minRows={2} />
          </Stack>
        </Collapse>

        <Button onClick={handleSubmit} loading={createLocation.isPending} disabled={!name.trim()} fullWidth mt="xs">
          Add location
        </Button>
      </Stack>
    </Modal>
  )
}
