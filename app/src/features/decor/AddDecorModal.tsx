import { useState } from 'react'
import { Button, Modal, NumberInput, Select, SegmentedControl, Stack, Textarea, TextInput } from '@mantine/core'
import { useAuth } from '../auth/AuthContext'
import { useEvents } from '../../lib/queries'
import { useVendors } from '../vendors/api'
import { useCreateDecorItem } from './api'
import type { DecorCategory, DecorContext, DecorHomeArea } from '../../types/database'

const CATEGORIES: DecorCategory[] = [
  'Mandap/Stage', 'Entrance', 'Seating', 'Lighting', 'Floral',
  'Table Settings', 'Photo Booth', 'Signage', 'Other',
]

const HOME_AREA_OPTIONS: { value: DecorHomeArea; label: string }[] = [
  { value: 'house', label: 'House Decor' },
  { value: 'garden', label: 'Garden Decor' },
]

export function AddDecorModal({
  opened,
  onClose,
  defaultEventId,
  defaultContext,
  defaultHomeArea,
}: {
  opened: boolean
  onClose: () => void
  // Set from an Event page (fixed to that event) or the Decor screen's Home
  // section (fixed to a home area) — otherwise the user picks context here.
  defaultEventId?: string
  defaultContext?: DecorContext
  defaultHomeArea?: DecorHomeArea
}) {
  const { person } = useAuth()
  const { data: events } = useEvents()
  const { data: vendors } = useVendors()
  const createDecorItem = useCreateDecorItem()

  const [context, setContext] = useState<DecorContext>(defaultContext ?? 'event')
  const [eventId, setEventId] = useState<string | null>(defaultEventId ?? null)
  const [homeArea, setHomeArea] = useState<DecorHomeArea>(defaultHomeArea ?? 'house')
  const [name, setName] = useState('')
  const [category, setCategory] = useState<DecorCategory>('Other')
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [cost, setCost] = useState<number | string>('')
  const [notes, setNotes] = useState('')

  const lockContext = !!defaultEventId || !!defaultContext

  function reset() {
    setContext(defaultContext ?? 'event')
    setEventId(defaultEventId ?? null)
    setHomeArea(defaultHomeArea ?? 'house')
    setName('')
    setCategory('Other')
    setVendorId(null)
    setCost('')
    setNotes('')
  }

  const canSubmit = !!name.trim() && (context === 'home' || !!eventId)

  async function handleSubmit() {
    if (!canSubmit || !person) return
    await createDecorItem.mutateAsync({
      wedding_id: person.wedding_id,
      context,
      event_id: context === 'event' ? eventId : null,
      home_area: context === 'home' ? homeArea : null,
      name: name.trim(),
      category,
      vendor_id: vendorId,
      cost: cost === '' ? null : Number(cost),
      notes: notes.trim() || null,
      created_by: person.id,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add decor item" centered>
      <Stack gap="sm">
        {!lockContext && (
          <SegmentedControl
            value={context}
            onChange={(v) => setContext(v as DecorContext)}
            data={[
              { label: 'Event Decor', value: 'event' },
              { label: 'Home Decor', value: 'home' },
            ]}
          />
        )}

        {context === 'event' && !defaultEventId && (
          <Select
            label="Event"
            required
            data={events?.map((e) => ({ value: e.id, label: e.name })) ?? []}
            value={eventId}
            onChange={setEventId}
          />
        )}

        {context === 'home' && !defaultHomeArea && (
          <Select
            label="Area"
            required
            data={HOME_AREA_OPTIONS}
            value={homeArea}
            allowDeselect={false}
            onChange={(v) => v && setHomeArea(v as DecorHomeArea)}
          />
        )}

        <TextInput
          label="Item"
          placeholder="e.g. Mandap floral arch"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Select
          label="Category"
          data={CATEGORIES}
          value={category}
          allowDeselect={false}
          onChange={(v) => v && setCategory(v as DecorCategory)}
        />
        <Select
          label="Vendor"
          placeholder="Optional"
          clearable
          searchable
          data={vendors?.map((v) => ({ value: v.id, label: v.name })) ?? []}
          value={vendorId}
          onChange={setVendorId}
        />
        <NumberInput label="Cost" value={cost} onChange={setCost} />
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} autosize minRows={2} />

        <Button onClick={handleSubmit} loading={createDecorItem.isPending} disabled={!canSubmit} fullWidth mt="xs">
          Add item
        </Button>
      </Stack>
    </Modal>
  )
}
