import { useState } from 'react'
import {
  Button,
  Checkbox,
  Modal,
  MultiSelect,
  SegmentedControl,
  Select,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core'
import { useAuth } from '../auth/AuthContext'
import { usePeople, useEvents } from '../../lib/queries'
import { useCreateGuest, useGuests } from './api'
import type { DietaryRequirement } from '../../types/database'

const DIETARY_OPTIONS: DietaryRequirement[] = [
  'None', 'Vegetarian', 'Vegan', 'Jain', 'Gluten-free', 'Allergy', 'Other',
]

export function AddGuestModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { person } = useAuth()
  const { data: people } = usePeople()
  const { data: events } = useEvents()
  const { data: existingGuests } = useGuests()
  const createGuest = useCreateGuest()

  const [mode, setMode] = useState<'new' | 'existing'>('new')
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [phone, setPhone] = useState('')
  const [existingPersonId, setExistingPersonId] = useState<string | null>(null)
  const [familyGroup, setFamilyGroup] = useState('')
  const [dietary, setDietary] = useState<string[]>([])
  const [accommodationRequired, setAccommodationRequired] = useState(false)
  const [notes, setNotes] = useState('')

  const guestPersonIds = new Set(existingGuests?.map((g) => g.person_id))
  const availablePeople = people?.filter((p) => !guestPersonIds.has(p.id))

  function reset() {
    setMode('new')
    setName('')
    setRelationship('')
    setPhone('')
    setExistingPersonId(null)
    setFamilyGroup('')
    setDietary([])
    setAccommodationRequired(false)
    setNotes('')
  }

  async function handleSubmit() {
    if (!person || !events) return
    const eventIds = events.map((e) => e.id)
    const shared = {
      weddingId: person.wedding_id,
      familyGroup: familyGroup.trim() || null,
      dietaryRequirements: dietary,
      accommodationRequired,
      notes: notes.trim() || null,
      eventIds,
    }

    if (mode === 'new') {
      if (!name.trim()) return
      await createGuest.mutateAsync({
        mode: 'new',
        name: name.trim(),
        relationship: relationship.trim() || null,
        phone: phone.trim() || null,
        ...shared,
      })
    } else {
      if (!existingPersonId) return
      await createGuest.mutateAsync({ mode: 'existing', personId: existingPersonId, ...shared })
    }
    reset()
    onClose()
  }

  const canSubmit = mode === 'new' ? !!name.trim() : !!existingPersonId

  return (
    <Modal opened={opened} onClose={onClose} title="Add guest" centered>
      <Stack gap="sm">
        <SegmentedControl
          value={mode}
          onChange={(v) => setMode(v as 'new' | 'existing')}
          data={[
            { label: 'New person', value: 'new' },
            { label: 'Existing person', value: 'existing' },
          ]}
        />

        {mode === 'new' ? (
          <>
            <TextInput
              label="Name"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <TextInput
              label="Relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.currentTarget.value)}
            />
            <TextInput label="Phone" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />
          </>
        ) : (
          <Select
            label="Person"
            placeholder="Search People"
            required
            searchable
            data={availablePeople?.map((p) => ({ value: p.id, label: p.name })) ?? []}
            value={existingPersonId}
            onChange={setExistingPersonId}
          />
        )}

        <TextInput
          label="Family / group"
          placeholder="e.g. Sharma family"
          value={familyGroup}
          onChange={(e) => setFamilyGroup(e.currentTarget.value)}
        />
        <MultiSelect label="Dietary requirements" data={DIETARY_OPTIONS} value={dietary} onChange={setDietary} />
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

        <Button onClick={handleSubmit} loading={createGuest.isPending} disabled={!canSubmit} fullWidth mt="xs">
          Add guest
        </Button>
      </Stack>
    </Modal>
  )
}
