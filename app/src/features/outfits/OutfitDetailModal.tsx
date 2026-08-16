import { useState } from 'react'
import { Badge, Button, Group, Modal, NumberInput, Select, Stack, Text, Textarea, TextInput } from '@mantine/core'
import { useUpdateOutfit } from './api'
import type { OutfitWithRelations } from './api'
import type { OutfitComponentStatus } from '../../types/database'

const STATUSES: OutfitComponentStatus[] = ['Idea', 'To Buy', 'In Making', 'In Alteration', 'Ready']

// Name + status side by side for one outfit component (the outfit itself,
// shoes, jewellery, or accessories) — previously only the status showed,
// with no way to say what the item actually is (e.g. "Red lehenga from
// XYZ" vs. just "Ready").
function ComponentField({
  label,
  placeholder,
  name,
  onNameChange,
  status,
  onStatusChange,
}: {
  label: string
  placeholder: string
  name: string
  onNameChange: (value: string) => void
  status: OutfitComponentStatus
  onStatusChange: (value: OutfitComponentStatus) => void
}) {
  return (
    <Group gap={6} wrap="nowrap" align="flex-end">
      <TextInput
        label={label}
        placeholder={placeholder}
        value={name}
        onChange={(e) => onNameChange(e.currentTarget.value)}
        style={{ flex: 1 }}
      />
      <Select
        label="Status"
        data={STATUSES}
        value={status}
        onChange={(v) => onStatusChange((v as OutfitComponentStatus) ?? status)}
        allowDeselect={false}
        w={140}
      />
    </Group>
  )
}

export function OutfitDetailModal({
  outfit,
  opened,
  onClose,
}: {
  outfit: OutfitWithRelations | null
  opened: boolean
  onClose: () => void
}) {
  const updateOutfit = useUpdateOutfit()

  const [editedId, setEditedId] = useState<string | null>(null)
  const [outfitName, setOutfitName] = useState('')
  const [outfitStatus, setOutfitStatus] = useState<OutfitComponentStatus>('Idea')
  const [shoesName, setShoesName] = useState('')
  const [shoesStatus, setShoesStatus] = useState<OutfitComponentStatus>('Idea')
  const [jewelleryName, setJewelleryName] = useState('')
  const [jewelleryStatus, setJewelleryStatus] = useState<OutfitComponentStatus>('Idea')
  const [accessoriesName, setAccessoriesName] = useState('')
  const [accessoriesStatus, setAccessoriesStatus] = useState<OutfitComponentStatus>('Idea')
  const [description, setDescription] = useState('')
  const [vendorTailor, setVendorTailor] = useState('')
  const [cost, setCost] = useState<number | string>('')
  const [notes, setNotes] = useState('')

  if (outfit && outfit.id !== editedId) {
    setEditedId(outfit.id)
    setOutfitName(outfit.outfit_name ?? '')
    setOutfitStatus(outfit.outfit_status)
    setShoesName(outfit.shoes_name ?? '')
    setShoesStatus(outfit.shoes_status)
    setJewelleryName(outfit.jewellery_name ?? '')
    setJewelleryStatus(outfit.jewellery_status)
    setAccessoriesName(outfit.accessories_name ?? '')
    setAccessoriesStatus(outfit.accessories_status)
    setDescription(outfit.description ?? '')
    setVendorTailor(outfit.vendor_tailor ?? '')
    setCost(outfit.cost ?? '')
    setNotes(outfit.notes ?? '')
  }

  if (!outfit) return null

  const willBeReady =
    outfitStatus === 'Ready' && shoesStatus === 'Ready' && jewelleryStatus === 'Ready' && accessoriesStatus === 'Ready'

  async function handleSave() {
    if (!outfit) return
    await updateOutfit.mutateAsync({
      id: outfit.id,
      updates: {
        outfit_name: outfitName.trim() || null,
        outfit_status: outfitStatus,
        shoes_name: shoesName.trim() || null,
        shoes_status: shoesStatus,
        jewellery_name: jewelleryName.trim() || null,
        jewellery_status: jewelleryStatus,
        accessories_name: accessoriesName.trim() || null,
        accessories_status: accessoriesStatus,
        description: description.trim() || null,
        vendor_tailor: vendorTailor.trim() || null,
        cost: cost === '' ? null : Number(cost),
        notes: notes.trim() || null,
      },
      personName: outfit.person.name,
      eventName: outfit.event.name,
      becameReady: willBeReady && !outfit.is_ready,
    })
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`${outfit.person.name} — ${outfit.event.name}`}
      centered
      size="lg"
    >
      <Stack gap="sm">
        {outfit.is_ready && (
          <Badge color="green" variant="light" w="fit-content">
            Ready
          </Badge>
        )}
        <ComponentField
          label="Outfit"
          placeholder="e.g. Red lehenga from XYZ"
          name={outfitName}
          onNameChange={setOutfitName}
          status={outfitStatus}
          onStatusChange={setOutfitStatus}
        />
        <ComponentField
          label="Shoes"
          placeholder="e.g. Gold heels"
          name={shoesName}
          onNameChange={setShoesName}
          status={shoesStatus}
          onStatusChange={setShoesStatus}
        />
        <ComponentField
          label="Jewellery"
          placeholder="e.g. Kundan necklace set"
          name={jewelleryName}
          onNameChange={setJewelleryName}
          status={jewelleryStatus}
          onStatusChange={setJewelleryStatus}
        />
        <ComponentField
          label="Accessories"
          placeholder="e.g. Clutch, dupatta pins"
          name={accessoriesName}
          onNameChange={setAccessoriesName}
          status={accessoriesStatus}
          onStatusChange={setAccessoriesStatus}
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Group grow>
          <TextInput
            label="Vendor / tailor"
            value={vendorTailor}
            onChange={(e) => setVendorTailor(e.currentTarget.value)}
          />
          <NumberInput label="Cost" value={cost} onChange={setCost} />
        </Group>
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} autosize minRows={2} />
        {outfit.responsible_person && (
          <Text size="xs" c="dimmed">
            Tracked by {outfit.responsible_person.name}
          </Text>
        )}
        <Button onClick={handleSave} loading={updateOutfit.isPending} fullWidth>
          Save
        </Button>
      </Stack>
    </Modal>
  )
}
