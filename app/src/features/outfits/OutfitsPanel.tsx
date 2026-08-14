import { useState } from 'react'
import { Center, Group, Loader, SegmentedControl, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import { useOutfits } from './api'
import { OutfitItem } from './OutfitItem'
import { AddOutfitModal } from './AddOutfitModal'
import { QuickAddButton } from '../../components/layout/QuickAddButton'
import type { OutfitWithRelations } from './api'

interface OutfitGroup {
  id: string
  label: string
  items: OutfitWithRelations[]
}

function groupBy(outfits: OutfitWithRelations[], key: 'person' | 'event'): OutfitGroup[] {
  const groups = new Map<string, OutfitGroup>()
  for (const outfit of outfits) {
    const id = outfit[key].id
    const label = outfit[key].name
    const group = groups.get(id) ?? { id, label, items: [] }
    group.items.push(outfit)
    groups.set(id, group)
  }
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label))
}

// Compact expandable group row — shows only the summary (name + counts)
// until tapped, per the spec's "show the important summary first, reveal
// detail only on tap" direction. The whole row is the tap target, not a
// small chevron icon.
function OutfitGroupRow({ group, groupMode }: { group: OutfitGroup; groupMode: 'person' | 'event' }) {
  const [expanded, setExpanded] = useState(false)
  const readyCount = group.items.filter((o) => o.is_ready).length

  const meta =
    groupMode === 'person'
      ? `${group.items.length} event${group.items.length === 1 ? '' : 's'} · ${readyCount}/${group.items.length} ready`
      : `${group.items.length} ${group.items.length === 1 ? 'person' : 'people'} · ${readyCount}/${group.items.length} ready`

  return (
    <Stack gap={0}>
      <UnstyledButton onClick={() => setExpanded((v) => !v)} style={{ width: '100%' }}>
        <Group
          justify="space-between"
          wrap="nowrap"
          py="sm"
          style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
        >
          <div>
            <Text fw={600}>{group.label}</Text>
            <Text size="xs" c="dimmed">
              {meta}
            </Text>
          </div>
          {expanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
        </Group>
      </UnstyledButton>
      {expanded && (
        <Stack gap={0} pl="sm">
          {group.items.map((o) => (
            <OutfitItem key={o.id} outfit={o} label={groupMode === 'person' ? o.event.name : o.person.name} />
          ))}
        </Stack>
      )}
    </Stack>
  )
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

      <Stack gap={0}>
        {groups.map((group) => (
          <OutfitGroupRow key={group.id} group={group} groupMode={groupMode} />
        ))}
      </Stack>

      <QuickAddButton onClick={() => setAddOpen(true)} label="Add outfit" />

      <AddOutfitModal opened={addOpen} onClose={() => setAddOpen(false)} />
    </Stack>
  )
}
