import { useState } from 'react'
import { Button, Modal, NumberInput, Select, Stack, Textarea, TextInput } from '@mantine/core'
import { useAuth } from '../auth/AuthContext'
import { useVendors } from '../vendors/api'
import { useCreateDecorItem } from './api'
import type { DecorCategory } from '../../types/database'

const CATEGORIES: DecorCategory[] = [
  'Mandap/Stage', 'Entrance', 'Seating', 'Lighting', 'Floral',
  'Table Settings', 'Photo Booth', 'Signage', 'Other',
]

export function AddDecorModal({
  opened,
  onClose,
  defaultEventId,
}: {
  opened: boolean
  onClose: () => void
  defaultEventId?: string
}) {
  const { person } = useAuth()
  const { data: vendors } = useVendors()
  const createDecorItem = useCreateDecorItem()

  const [name, setName] = useState('')
  const [category, setCategory] = useState<DecorCategory>('Other')
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [cost, setCost] = useState<number | string>('')
  const [notes, setNotes] = useState('')

  function reset() {
    setName('')
    setCategory('Other')
    setVendorId(null)
    setCost('')
    setNotes('')
  }

  async function handleSubmit() {
    if (!name.trim() || !person) return
    await createDecorItem.mutateAsync({
      wedding_id: person.wedding_id,
      event_id: defaultEventId ?? null,
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

        <Button
          onClick={handleSubmit}
          loading={createDecorItem.isPending}
          disabled={!name.trim()}
          fullWidth
          mt="xs"
        >
          Add item
        </Button>
      </Stack>
    </Modal>
  )
}
