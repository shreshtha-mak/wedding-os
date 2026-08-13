import { useState } from 'react'
import { Button, Modal, Select, Stack, TextInput } from '@mantine/core'
import { TimeInput } from '@mantine/dates'
import { useVendors, useCreateAssignment } from './api'

export function AssignVendorToEventModal({
  eventId,
  opened,
  onClose,
}: {
  eventId: string
  opened: boolean
  onClose: () => void
}) {
  const { data: vendors } = useVendors()
  const createAssignment = useCreateAssignment()

  const [vendorId, setVendorId] = useState<string | null>(null)
  const [responsibility, setResponsibility] = useState('')
  const [setupTime, setSetupTime] = useState('')

  async function handleSubmit() {
    if (!vendorId) return
    await createAssignment.mutateAsync({
      vendor_id: vendorId,
      event_id: eventId,
      responsibility: responsibility.trim() || null,
      setup_time: setupTime || null,
    })
    setVendorId(null)
    setResponsibility('')
    setSetupTime('')
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Assign vendor" centered>
      <Stack gap="sm">
        <Select
          label="Vendor"
          required
          searchable
          autoFocus
          data={vendors?.map((v) => ({ value: v.id, label: v.name })) ?? []}
          value={vendorId}
          onChange={setVendorId}
        />
        <TextInput
          label="Responsibility"
          placeholder="e.g. Stage + entry décor"
          value={responsibility}
          onChange={(e) => setResponsibility(e.currentTarget.value)}
        />
        <TimeInput label="Setup time" value={setupTime} onChange={(e) => setSetupTime(e.currentTarget.value)} />
        <Button onClick={handleSubmit} loading={createAssignment.isPending} disabled={!vendorId} fullWidth mt="xs">
          Assign
        </Button>
      </Stack>
    </Modal>
  )
}
