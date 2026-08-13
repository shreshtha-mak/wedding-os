import { useState } from 'react'
import { Button, Modal, NumberInput, Select, Stack, TextInput } from '@mantine/core'
import { useCreateRoom } from './api'
import type { BookingWithVendor } from './api'

export function AddRoomModal({
  locationId,
  bookings,
  opened,
  onClose,
}: {
  locationId: string
  bookings: BookingWithVendor[]
  opened: boolean
  onClose: () => void
}) {
  const createRoom = useCreateRoom()
  const [roomName, setRoomName] = useState('')
  const [capacity, setCapacity] = useState<number | string>(2)
  const [bookingId, setBookingId] = useState<string | null>(null)

  function reset() {
    setRoomName('')
    setCapacity(2)
    setBookingId(null)
  }

  async function handleSubmit() {
    if (!roomName.trim()) return
    await createRoom.mutateAsync({
      location_id: locationId,
      room_name: roomName.trim(),
      capacity: Number(capacity) || 1,
      booking_id: bookingId,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add room" centered>
      <Stack gap="sm">
        <TextInput
          label="Room name/number"
          required
          autoFocus
          value={roomName}
          onChange={(e) => setRoomName(e.currentTarget.value)}
        />
        <NumberInput label="Beds / capacity" min={1} value={capacity} onChange={setCapacity} />
        {bookings.length > 0 && (
          <Select
            label="Booking"
            placeholder="Optional"
            clearable
            data={bookings.map((b) => ({
              value: b.id,
              label: b.booking_reference || b.vendor?.name || 'Booking',
            }))}
            value={bookingId}
            onChange={setBookingId}
          />
        )}
        <Button onClick={handleSubmit} loading={createRoom.isPending} disabled={!roomName.trim()} fullWidth mt="xs">
          Add room
        </Button>
      </Stack>
    </Modal>
  )
}
