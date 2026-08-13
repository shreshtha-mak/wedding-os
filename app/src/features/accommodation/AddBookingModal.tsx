import { useState } from 'react'
import { Button, Modal, NumberInput, Select, Stack, Textarea, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useAuth } from '../auth/AuthContext'
import { useVendors } from '../vendors/api'
import { useCreateBooking } from './api'

export function AddBookingModal({
  locationId,
  opened,
  onClose,
}: {
  locationId: string
  opened: boolean
  onClose: () => void
}) {
  const { person } = useAuth()
  const { data: vendors } = useVendors()
  const createBooking = useCreateBooking()

  const [vendorId, setVendorId] = useState<string | null>(null)
  const [bookingReference, setBookingReference] = useState('')
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [numRooms, setNumRooms] = useState<number | string>(1)
  const [cost, setCost] = useState<number | string>('')
  const [notes, setNotes] = useState('')

  function reset() {
    setVendorId(null)
    setBookingReference('')
    setCheckIn(null)
    setCheckOut(null)
    setNumRooms(1)
    setCost('')
    setNotes('')
  }

  async function handleSubmit() {
    if (!person) return
    await createBooking.mutateAsync({
      wedding_id: person.wedding_id,
      location_id: locationId,
      vendor_id: vendorId,
      booking_reference: bookingReference.trim() || null,
      check_in: checkIn,
      check_out: checkOut,
      num_rooms: Number(numRooms) || 1,
      cost: cost === '' ? null : Number(cost),
      notes: notes.trim() || null,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add booking" centered>
      <Stack gap="sm">
        <Select
          label="Vendor"
          placeholder="Optional"
          clearable
          searchable
          data={vendors?.map((v) => ({ value: v.id, label: v.name })) ?? []}
          value={vendorId}
          onChange={setVendorId}
        />
        <TextInput
          label="Booking reference"
          placeholder="Confirmation number"
          value={bookingReference}
          onChange={(e) => setBookingReference(e.currentTarget.value)}
        />
        <DateInput label="Check-in" clearable value={checkIn} onChange={setCheckIn} valueFormat="DD MMM YYYY" />
        <DateInput label="Check-out" clearable value={checkOut} onChange={setCheckOut} valueFormat="DD MMM YYYY" />
        <NumberInput label="Number of rooms" min={1} value={numRooms} onChange={setNumRooms} />
        <NumberInput label="Cost" value={cost} onChange={setCost} />
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} autosize minRows={2} />

        <Button onClick={handleSubmit} loading={createBooking.isPending} fullWidth mt="xs">
          Add booking
        </Button>
      </Stack>
    </Modal>
  )
}
