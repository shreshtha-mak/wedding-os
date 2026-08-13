import { useState } from 'react'
import { Button, Modal, Select, Stack } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useGuests } from '../guests/api'
import { useAssignGuestToRoom } from './api'

export function AssignGuestModal({
  roomId,
  opened,
  onClose,
}: {
  roomId: string | null
  opened: boolean
  onClose: () => void
}) {
  const { data: guests } = useGuests()
  const assignGuest = useAssignGuestToRoom()

  const [guestId, setGuestId] = useState<string | null>(null)
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)

  function reset() {
    setGuestId(null)
    setCheckIn(null)
    setCheckOut(null)
  }

  async function handleSubmit() {
    if (!roomId || !guestId) return
    const guest = guests?.find((g) => g.id === guestId)
    await assignGuest.mutateAsync({
      roomId,
      guestId,
      checkIn,
      checkOut,
      guestName: guest?.person.name ?? 'Guest',
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Assign guest to room" centered>
      <Stack gap="sm">
        <Select
          label="Guest"
          required
          searchable
          autoFocus
          data={guests?.map((g) => ({ value: g.id, label: g.person.name })) ?? []}
          value={guestId}
          onChange={setGuestId}
        />
        <DateInput label="Check-in" clearable value={checkIn} onChange={setCheckIn} valueFormat="DD MMM YYYY" />
        <DateInput label="Check-out" clearable value={checkOut} onChange={setCheckOut} valueFormat="DD MMM YYYY" />
        <Button onClick={handleSubmit} loading={assignGuest.isPending} disabled={!guestId} fullWidth mt="xs">
          Assign
        </Button>
      </Stack>
    </Modal>
  )
}
