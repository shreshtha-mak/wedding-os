import { useState } from 'react'
import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Modal,
  MultiSelect,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { IconPlus, IconX } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { usePeople, useEvents } from '../../lib/queries'
import { useCreateFamilyGuests, useCreateGuest, useGuests } from './api'
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
  const createFamilyGuests = useCreateFamilyGuests()

  // Guests are invited as a family far more often than one at a time, so
  // that's the default/primary path — adding a single person is still one
  // tap away via the "Individual" option.
  const [addMode, setAddMode] = useState<'family' | 'individual'>('family')

  const [familyGroupName, setFamilyGroupName] = useState('')
  const [familyNames, setFamilyNames] = useState<string[]>(['', ''])

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
    setAddMode('family')
    setFamilyGroupName('')
    setFamilyNames(['', ''])
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

  function updateFamilyName(index: number, value: string) {
    setFamilyNames((prev) => prev.map((n, i) => (i === index ? value : n)))
  }

  function removeFamilyNameRow(index: number) {
    setFamilyNames((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!person || !events) return
    const eventIds = events.map((e) => e.id)
    const shared = {
      weddingId: person.wedding_id,
      dietaryRequirements: dietary,
      accommodationRequired,
      notes: notes.trim() || null,
      eventIds,
    }

    if (addMode === 'family') {
      const names = familyNames.map((n) => n.trim()).filter(Boolean)
      if (!familyGroupName.trim() || names.length === 0) return
      await createFamilyGuests.mutateAsync({
        familyGroup: familyGroupName.trim(),
        names,
        ...shared,
      })
    } else if (mode === 'new') {
      if (!name.trim()) return
      await createGuest.mutateAsync({
        mode: 'new',
        name: name.trim(),
        relationship: relationship.trim() || null,
        phone: phone.trim() || null,
        familyGroup: familyGroup.trim() || null,
        ...shared,
      })
    } else {
      if (!existingPersonId) return
      await createGuest.mutateAsync({
        mode: 'existing',
        personId: existingPersonId,
        familyGroup: familyGroup.trim() || null,
        ...shared,
      })
    }
    reset()
    onClose()
  }

  const canSubmit =
    addMode === 'family'
      ? !!familyGroupName.trim() && familyNames.some((n) => n.trim())
      : mode === 'new'
        ? !!name.trim()
        : !!existingPersonId

  const isPending = createGuest.isPending || createFamilyGuests.isPending

  return (
    <Modal opened={opened} onClose={onClose} title="Add guests" centered>
      <Stack gap="sm">
        <SegmentedControl
          value={addMode}
          onChange={(v) => setAddMode(v as 'family' | 'individual')}
          data={[
            { label: 'Family group', value: 'family' },
            { label: 'Individual', value: 'individual' },
          ]}
        />

        {addMode === 'family' ? (
          <>
            <TextInput
              label="Family / group name"
              placeholder="e.g. Sharma family"
              required
              autoFocus
              value={familyGroupName}
              onChange={(e) => setFamilyGroupName(e.currentTarget.value)}
            />
            <Stack gap={6}>
              <Text size="sm" fw={500}>
                People in this family
              </Text>
              {familyNames.map((n, i) => (
                <Group key={i} gap={6} wrap="nowrap">
                  <TextInput
                    placeholder={`Name ${i + 1}`}
                    value={n}
                    onChange={(e) => updateFamilyName(i, e.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                  {familyNames.length > 1 && (
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => removeFamilyNameRow(i)}
                      aria-label={`Remove name ${i + 1}`}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  )}
                </Group>
              ))}
              <UnstyledButton
                onClick={() => setFamilyNames((prev) => [...prev, ''])}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <IconPlus size={14} />
                <Text size="sm" c="accent">
                  Add another person
                </Text>
              </UnstyledButton>
            </Stack>
          </>
        ) : (
          <>
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
          </>
        )}

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

        <Button onClick={handleSubmit} loading={isPending} disabled={!canSubmit} fullWidth mt="xs">
          {addMode === 'family' ? 'Add family' : 'Add guest'}
        </Button>
      </Stack>
    </Modal>
  )
}
