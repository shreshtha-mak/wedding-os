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
import { useDeleteGuest, useUpdateAttendance, useUpdateGuest } from './api'
import type { GuestWithDetails } from './api'
import type { AttendanceStatus, DietaryRequirement, TransportRequirement } from '../../types/database'
import { ContextDocuments } from '../documents/ContextDocuments'

const DIETARY_OPTIONS: DietaryRequirement[] = [
  'None', 'Vegetarian', 'Vegan', 'Jain', 'Gluten-free', 'Allergy', 'Other',
]
const ATTENDANCE_OPTIONS: AttendanceStatus[] = ['Pending', 'Attending', 'Not attending', 'Maybe']
// "Own arrangement" and "Not needed" both count as satisfied; "Unknown"
// does not (the family hasn't determined it yet), and "Required" isn't
// satisfied until it becomes "Arranged".
const TRANSPORT_OPTIONS: TransportRequirement[] = [
  'Unknown', 'Not needed', 'Own arrangement', 'Required', 'Arranged',
]

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

function transportColor(status: TransportRequirement): string {
  switch (status) {
    case 'Arranged':
    case 'Own arrangement':
    case 'Not needed':
      return 'green'
    case 'Required':
      return 'red'
    case 'Unknown':
      return 'gray'
  }
}

function AttendanceRow({
  attendance,
}: {
  attendance: GuestWithDetails['attendance'][number]
}) {
  const updateAttendance = useUpdateAttendance()

  return (
    <Stack gap={4} py={4}>
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm" fw={500} style={{ flex: 1 }}>
          {attendance.event.name}
        </Text>
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
              transportationStatus: attendance.transportation_status,
            })
          }
          leftSection={<Badge size="xs" color={attendanceColor(attendance.status)} circle w={8} h={8} p={0} />}
        />
      </Group>
      <Group justify="flex-end" wrap="nowrap">
        <Text size="xs" c="dimmed" style={{ flex: 1 }}>
          Transport
        </Text>
        <Select
          size="xs"
          w={150}
          data={TRANSPORT_OPTIONS}
          value={attendance.transportation_status}
          allowDeselect={false}
          onChange={(v) =>
            v &&
            updateAttendance.mutate({
              id: attendance.id,
              status: attendance.status,
              transportationStatus: v as TransportRequirement,
            })
          }
          leftSection={
            <Badge size="xs" color={transportColor(attendance.transportation_status)} circle w={8} h={8} p={0} />
          }
        />
      </Group>
    </Stack>
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
  const deleteGuest = useDeleteGuest()
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

  function handleDelete() {
    if (!guest) return
    if (window.confirm(`Remove ${guest.person.name} from Guests? This can't be undone — they'll stay in People.`)) {
      deleteGuest.mutate({ id: guest.id, guestName: guest.person.name }, { onSuccess: onClose })
    }
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

        <Divider my={4} />
        <ContextDocuments guestId={guest.id} />

        <Divider my={4} />
        <Button
          onClick={handleDelete}
          loading={deleteGuest.isPending}
          color="red"
          variant="subtle"
          fullWidth
        >
          Delete guest
        </Button>
      </Stack>
    </Modal>
  )
}
