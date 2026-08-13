import { useState } from 'react'
import { Badge, Button, Group, Modal, NumberInput, Select, Stack, Text, Textarea, TextInput } from '@mantine/core'
import { useUpdateOutfit } from './api'
import type { OutfitWithRelations } from './api'
import type { OutfitComponentStatus } from '../../types/database'

const STATUSES: OutfitComponentStatus[] = ['Idea', 'To Buy', 'In Making', 'In Alteration', 'Ready']

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
  const [outfitStatus, setOutfitStatus] = useState<OutfitComponentStatus>('Idea')
  const [shoesStatus, setShoesStatus] = useState<OutfitComponentStatus>('Idea')
  const [jewelleryStatus, setJewelleryStatus] = useState<OutfitComponentStatus>('Idea')
  const [accessoriesStatus, setAccessoriesStatus] = useState<OutfitComponentStatus>('Idea')
  const [description, setDescription] = useState('')
  const [vendorTailor, setVendorTailor] = useState('')
  const [cost, setCost] = useState<number | string>('')
  const [notes, setNotes] = useState('')

  if (outfit && outfit.id !== editedId) {
    setEditedId(outfit.id)
    setOutfitStatus(outfit.outfit_status)
    setShoesStatus(outfit.shoes_status)
    setJewelleryStatus(outfit.jewellery_status)
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
        outfit_status: outfitStatus,
        shoes_status: shoesStatus,
        jewellery_status: jewelleryStatus,
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
        <Group grow>
          <Select
            label="Outfit"
            data={STATUSES}
            value={outfitStatus}
            onChange={(v) => setOutfitStatus((v as OutfitComponentStatus) ?? outfitStatus)}
            allowDeselect={false}
          />
          <Select
            label="Shoes"
            data={STATUSES}
            value={shoesStatus}
            onChange={(v) => setShoesStatus((v as OutfitComponentStatus) ?? shoesStatus)}
            allowDeselect={false}
          />
        </Group>
        <Group grow>
          <Select
            label="Jewellery"
            data={STATUSES}
            value={jewelleryStatus}
            onChange={(v) => setJewelleryStatus((v as OutfitComponentStatus) ?? jewelleryStatus)}
            allowDeselect={false}
          />
          <Select
            label="Accessories"
            data={STATUSES}
            value={accessoriesStatus}
            onChange={(v) => setAccessoriesStatus((v as OutfitComponentStatus) ?? accessoriesStatus)}
            allowDeselect={false}
          />
        </Group>
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
