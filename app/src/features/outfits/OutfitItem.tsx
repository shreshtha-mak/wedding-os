import { useState } from 'react'
import { Badge, Group, Text, UnstyledButton } from '@mantine/core'
import type { OutfitWithRelations } from './api'
import { OutfitDetailModal } from './OutfitDetailModal'

function readyCount(outfit: OutfitWithRelations): number {
  return [outfit.outfit_status, outfit.shoes_status, outfit.jewellery_status, outfit.accessories_status].filter(
    (s) => s === 'Ready',
  ).length
}

export function OutfitItem({
  outfit,
  label,
}: {
  outfit: OutfitWithRelations
  label: string
}) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <>
      <UnstyledButton onClick={() => setDetailOpen(true)} style={{ width: '100%' }}>
        <Group
          justify="space-between"
          wrap="nowrap"
          py="xs"
          style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
        >
          <Text size="sm" style={{ flex: 1 }}>
            {label}
          </Text>
          {outfit.is_ready ? (
            <Badge size="xs" color="green" variant="light">
              Ready
            </Badge>
          ) : (
            <Badge size="xs" color="yellow" variant="light">
              {readyCount(outfit)}/4 ready
            </Badge>
          )}
        </Group>
      </UnstyledButton>
      <OutfitDetailModal outfit={outfit} opened={detailOpen} onClose={() => setDetailOpen(false)} />
    </>
  )
}
