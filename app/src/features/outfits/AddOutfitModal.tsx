import { useState } from 'react'
import { Button, Modal, Select, Stack } from '@mantine/core'
import { useAuth } from '../auth/AuthContext'
import { usePeople, useEvents } from '../../lib/queries'
import { useCreateOutfit } from './api'

export function AddOutfitModal({
  opened,
  onClose,
  defaultEventId,
  defaultPersonId,
}: {
  opened: boolean
  onClose: () => void
  defaultEventId?: string
  defaultPersonId?: string
}) {
  const { person } = useAuth()
  const canManage = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const { data: people } = usePeople()
  const { data: events } = useEvents()
  const createOutfit = useCreateOutfit()

  const [personId, setPersonId] = useState<string | null>(defaultPersonId ?? null)
  const [eventId, setEventId] = useState<string | null>(defaultEventId ?? null)
  const [responsiblePersonId, setResponsiblePersonId] = useState<string | null>(null)

  async function handleSubmit() {
    if (!personId || !eventId || !person) return
    await createOutfit.mutateAsync({
      wedding_id: person.wedding_id,
      person_id: personId,
      event_id: eventId,
      // Restricted users can only ever create outfits they're marked
      // responsible for — RLS requires it, so set it silently rather than
      // exposing a field they could only ever set to one value.
      responsible_person_id: canManage ? responsiblePersonId : person.id,
    })
    setPersonId(defaultPersonId ?? null)
    setEventId(defaultEventId ?? null)
    setResponsiblePersonId(null)
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add outfit" centered>
      <Stack gap="sm">
        <Select
          label="Person"
          required
          searchable
          data={people?.map((p) => ({ value: p.id, label: p.name })) ?? []}
          value={personId}
          onChange={setPersonId}
        />
        <Select
          label="Event"
          required
          data={events?.map((e) => ({ value: e.id, label: e.name })) ?? []}
          value={eventId}
          onChange={setEventId}
        />
        {canManage && (
          <Select
            label="Responsible for tracking"
            placeholder="Optional"
            clearable
            searchable
            data={people?.map((p) => ({ value: p.id, label: p.name })) ?? []}
            value={responsiblePersonId}
            onChange={setResponsiblePersonId}
          />
        )}
        <Button
          onClick={handleSubmit}
          loading={createOutfit.isPending}
          disabled={!personId || !eventId}
          fullWidth
          mt="xs"
        >
          Add outfit
        </Button>
      </Stack>
    </Modal>
  )
}
