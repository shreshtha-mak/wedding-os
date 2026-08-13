import { useState } from 'react'
import { Button, Modal, MultiSelect, Stack } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useGuests } from '../guests/api'
import { useAssignGuestsToRoom } from './api'

export function AssignGuestModal({
  roomId,
  remainingCapacity,
  opened,
  onClose,
}: {
  roomId: string | null
  remainingCapacity: number
  opened: boolean
  onClose: () => void
}) {
  const { data: guests } = useGuests()
  const assignGuests = useAssignGuestsToRoom()

  const [guestIds, setGuestIds] = useState<string[]>([])
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)

  function reset() {
    setGuestIds([])
    setCheckIn(null)
    setCheckOut(null)
  }

  async function handleSubmit() {
    if (!roomId || guestIds.length === 0) return
    const guestNames = guestIds.map((id) => guests?.find((g) => g.id === id)?.person.name ?? 'Guest')
    await assignGuests.mutateAsync({ roomId, guestIds, checkIn, checkOut, guestNames })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Assign guests to room" centered>
      <Stack gap="sm">
        <MultiSelect
          label="Guests"
          description={`Up to ${remainingCapacity} more can be assigned to this room`}
          required
          searchable
          autoFocus
          maxValues={remainingCapacity}
          data={guests?.map((g) => ({ value: g.id, label: g.person.name })) ?? []}
          value={guestIds}
          onChange={setGuestIds}
        />
        <DateInput label="Check-in" clearable value={checkIn} onChange={setCheckIn} valueFormat="DD MMM YYYY" />
        <DateInput label="Check-out" clearable value={checkOut} onChange={setCheckOut} valueFormat="DD MMM YYYY" />
        <Button
          onClick={handleSubmit}
          loading={assignGuests.isPending}
          disabled={guestIds.length === 0}
          fullWidth
          mt="xs"
        >
          Assign
        </Button>
      </Stack>
    </Modal>
  )
}
