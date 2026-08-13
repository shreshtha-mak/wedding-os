import { useState } from 'react'
import {
  ActionIcon,
  Affix,
  Center,
  Loader,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useOutfits } from './api'
import { OutfitItem } from './OutfitItem'
import { AddOutfitModal } from './AddOutfitModal'
import type { OutfitWithRelations } from './api'

function groupBy(outfits: OutfitWithRelations[], key: 'person' | 'event') {
  const groups = new Map<string, { label: string; items: OutfitWithRelations[] }>()
  for (const outfit of outfits) {
    const id = outfit[key].id
    const label = outfit[key].name
    const group = groups.get(id) ?? { label, items: [] }
    group.items.push(outfit)
    groups.set(id, group)
  }
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label))
}

export function OutfitsPanel() {
  const { data: outfits, isLoading, isError } = useOutfits()
  const [groupMode, setGroupMode] = useState<'person' | 'event'>('person')
  const [addOpen, setAddOpen] = useState(false)

  const groups = outfits ? groupBy(outfits, groupMode) : []

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Outfits</Title>

      <SegmentedControl
        value={groupMode}
        onChange={(v) => setGroupMode(v as 'person' | 'event')}
        data={[
          { label: 'By Person', value: 'person' },
          { label: 'By Event', value: 'event' },
        ]}
      />

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load outfits. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && groups.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No outfits tracked yet.</Text>
        </Center>
      )}

      <Stack gap="md">
        {groups.map((group) => (
          <Stack key={group.label} gap={2}>
            <Text size="sm" fw={600} c="dimmed">
              {group.label}
            </Text>
            {group.items.map((o) => (
              <OutfitItem key={o.id} outfit={o} label={groupMode === 'person' ? o.event.name : o.person.name} />
            ))}
          </Stack>
        ))}
      </Stack>

      <Affix position={{ bottom: 24, right: 24 }}>
        <ActionIcon size={56} radius="xl" onClick={() => setAddOpen(true)} aria-label="Add outfit">
          <IconPlus size={26} />
        </ActionIcon>
      </Affix>

      <AddOutfitModal opened={addOpen} onClose={() => setAddOpen(false)} />
    </Stack>
  )
}
