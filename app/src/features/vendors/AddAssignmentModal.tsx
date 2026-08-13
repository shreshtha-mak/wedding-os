import { useState } from 'react'
import { Button, Modal, Select, Stack, TextInput } from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import { useEvents } from '../../lib/queries'
import { useCreateAssignment } from './api'

export function AddAssignmentModal({
  vendorId,
  opened,
  onClose,
}: {
  vendorId: string | null
  opened: boolean
  onClose: () => void
}) {
  const { data: events } = useEvents()
  const createAssignment = useCreateAssignment()

  const [eventId, setEventId] = useState<string | null>(null)
  const [responsibility, setResponsibility] = useState('')
  const [setupTime, setSetupTime] = useState('')

  async function handleSubmit() {
    if (!vendorId || !eventId) return
    await createAssignment.mutateAsync({
      vendor_id: vendorId,
      event_id: eventId,
      responsibility: responsibility.trim() || null,
      setup_time: setupTime || null,
    })
    setEventId(null)
    setResponsibility('')
    setSetupTime('')
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Assign vendor to event" centered>
      <Stack gap="sm">
        <Select
          label="Event"
          required
          autoFocus
          data={events?.map((e) => ({ value: e.id, label: e.name })) ?? []}
          value={eventId}
          onChange={setEventId}
        />
        <TextInput
          label="Responsibility"
          placeholder="e.g. Stage + entry décor"
          value={responsibility}
          onChange={(e) => setResponsibility(e.currentTarget.value)}
        />
        <TimeInput label="Setup time" value={setupTime} onChange={(e) => setSetupTime(e.currentTarget.value)} />
        <Button onClick={handleSubmit} loading={createAssignment.isPending} disabled={!eventId} fullWidth mt="xs">
          Assign
        </Button>
      </Stack>
    </Modal>
  )
}
