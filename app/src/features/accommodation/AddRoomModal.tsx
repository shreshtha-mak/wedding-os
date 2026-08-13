import { useState } from 'react'
import { Button, Modal, NumberInput, Stack, TextInput } from '@mantine/core'
import { useCreateRoom } from './api'

export function AddRoomModal({
  locationId,
  opened,
  onClose,
}: {
  locationId: string
  opened: boolean
  onClose: () => void
}) {
  const createRoom = useCreateRoom()
  const [roomName, setRoomName] = useState('')
  const [capacity, setCapacity] = useState<number | string>(2)

  async function handleSubmit() {
    if (!roomName.trim()) return
    await createRoom.mutateAsync({
      location_id: locationId,
      room_name: roomName.trim(),
      capacity: Number(capacity) || 1,
    })
    setRoomName('')
    setCapacity(2)
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
        <Button onClick={handleSubmit} loading={createRoom.isPending} disabled={!roomName.trim()} fullWidth mt="xs">
          Add room
        </Button>
      </Stack>
    </Modal>
  )
}
