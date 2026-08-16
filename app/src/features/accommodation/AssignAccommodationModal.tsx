import { useState } from 'react'
import { Button, Modal, Select, Stack } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useAssignGuestsToRoom } from './api'
import type { LocationWithRooms } from './api'

// The room-first flow (Accommodation → room → "+ Assign") already existed.
// This is the reverse: pick the room for a specific, already-known person
// — reached by tapping them directly instead of hunting for their name in
// a room's guest picker.
export function AssignAccommodationModal({
  guest,
  locations,
  opened,
  onClose,
}: {
  guest: { id: string; name: string } | null
  locations: LocationWithRooms[]
  opened: boolean
  onClose: () => void
}) {
  const assignGuests = useAssignGuestsToRoom()
  const [roomId, setRoomId] = useState<string | null>(null)
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)

  const roomOptions = locations.flatMap((location) =>
    location.rooms
      .map((room) => ({ room, remaining: room.capacity - room.assignments.length }))
      .filter(({ remaining }) => remaining > 0)
      .map(({ room, remaining }) => ({
        value: room.id,
        label: `${location.name} — ${room.room_name} (${remaining} free)`,
      })),
  )

  function reset() {
    setRoomId(null)
    setCheckIn(null)
    setCheckOut(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit() {
    if (!guest || !roomId) return
    await assignGuests.mutateAsync({
      roomId,
      guestIds: [guest.id],
      checkIn,
      checkOut,
      guestNames: [guest.name],
    })
    handleClose()
  }

  return (
    <Modal opened={opened} onClose={handleClose} title={`Assign accommodation for ${guest?.name ?? ''}`} centered>
      <Stack gap="sm">
        <Select
          label="Room"
          placeholder={roomOptions.length > 0 ? 'Choose a room' : 'No rooms with free beds yet'}
          required
          searchable
          autoFocus
          disabled={roomOptions.length === 0}
          data={roomOptions}
          value={roomId}
          onChange={setRoomId}
        />
        <DateInput label="Check-in" clearable value={checkIn} onChange={setCheckIn} valueFormat="DD MMM YYYY" />
        <DateInput label="Check-out" clearable value={checkOut} onChange={setCheckOut} valueFormat="DD MMM YYYY" />
        <Button onClick={handleSubmit} loading={assignGuests.isPending} disabled={!roomId} fullWidth mt="xs">
          Assign
        </Button>
      </Stack>
    </Modal>
  )
}
