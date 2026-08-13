import { useState } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  MultiSelect,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core'
import { useUpdateAttendance, useUpdateGuest } from './api'
import type { GuestWithDetails } from './api'
import type { AttendanceStatus, DietaryRequirement } from '../../types/database'

const DIETARY_OPTIONS: DietaryRequirement[] = [
  'None', 'Vegetarian', 'Vegan', 'Jain', 'Gluten-free', 'Allergy', 'Other',
]
const ATTENDANCE_OPTIONS: AttendanceStatus[] = ['Pending', 'Attending', 'Not attending', 'Maybe']

function attendanceColor(status: AttendanceStatus): string {
  switch (status) {
    case 'Attending':
      return 'green'
    case 'Not attending':
      return 'gray'
    case 'Maybe':
      return 'yellow'
    case 'Pending':
      return 'blue'
  }
}

function AttendanceRow({
  attendance,
}: {
  attendance: GuestWithDetails['attendance'][number]
}) {
  const updateAttendance = useUpdateAttendance()

  return (
    <Group justify="space-between" wrap="nowrap" py={4}>
      <Text size="sm" style={{ flex: 1 }}>
        {attendance.event.name}
      </Text>
      <Checkbox
        label="Transport"
        size="xs"
        checked={attendance.transportation_required}
        onChange={(e) =>
          updateAttendance.mutate({
            id: attendance.id,
            status: attendance.status,
            transportationRequired: e.currentTarget.checked,
          })
        }
      />
      <Select
        size="xs"
        w={130}
        data={ATTENDANCE_OPTIONS}
        value={attendance.status}
        allowDeselect={false}
        onChange={(v) =>
          v &&
          updateAttendance.mutate({
            id: attendance.id,
            status: v as AttendanceStatus,
            transportationRequired: attendance.transportation_required,
          })
        }
        leftSection={<Badge size="xs" color={attendanceColor(attendance.status)} circle w={8} h={8} p={0} />}
      />
    </Group>
  )
}

export function GuestDetailModal({
  guest,
  opened,
  onClose,
}: {
  guest: GuestWithDetails | null
  opened: boolean
  onClose: () => void
}) {
  const updateGuest = useUpdateGuest()
  const [familyGroup, setFamilyGroup] = useState('')
  const [dietary, setDietary] = useState<string[]>([])
  const [accommodationRequired, setAccommodationRequired] = useState(false)
  const [notes, setNotes] = useState('')
  const [editedGuestId, setEditedGuestId] = useState<string | null>(null)

  // Sync local form state whenever a (new) guest is opened.
  if (guest && guest.id !== editedGuestId) {
    setEditedGuestId(guest.id)
    setFamilyGroup(guest.family_group ?? '')
    setDietary(guest.dietary_requirements)
    setAccommodationRequired(guest.accommodation_required)
    setNotes(guest.notes ?? '')
  }

  if (!guest) return null

  async function handleSave() {
    if (!guest) return
    await updateGuest.mutateAsync({
      id: guest.id,
      familyGroup: familyGroup.trim() || null,
      dietaryRequirements: dietary,
      accommodationRequired,
      notes: notes.trim() || null,
    })
  }

  return (
    <Modal opened={opened} onClose={onClose} title={guest.person.name} centered size="lg">
      <Stack gap="sm">
        <Group gap="xs">
          {guest.person.relationship && <Text size="sm" c="dimmed">{guest.person.relationship}</Text>}
          {guest.person.phone && <Text size="sm" c="dimmed">· {guest.person.phone}</Text>}
        </Group>

        <TextInput
          label="Family / group"
          value={familyGroup}
          onChange={(e) => setFamilyGroup(e.currentTarget.value)}
        />
        <MultiSelect
          label="Dietary requirements"
          data={DIETARY_OPTIONS}
          value={dietary}
          onChange={setDietary}
        />
        <Checkbox
          label="Accommodation required"
          checked={accommodationRequired}
          onChange={(e) => setAccommodationRequired(e.currentTarget.checked)}
        />
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Button onClick={handleSave} loading={updateGuest.isPending} fullWidth>
          Save
        </Button>

        <Divider label="Event attendance" labelPosition="left" mt="sm" />
        <Stack gap={2}>
          {guest.attendance.map((a) => (
            <AttendanceRow key={a.id} attendance={a} />
          ))}
        </Stack>
      </Stack>
    </Modal>
  )
}
