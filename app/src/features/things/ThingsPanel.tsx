import { useState } from 'react'
import { ActionIcon, Affix, Center, Loader, SegmentedControl, Stack, Text, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { useThings } from './api'
import { ThingItem } from './ThingItem'
import { AddThingModal } from './AddThingModal'

export function ThingsPanel() {
  const { person } = useAuth()
  const canManage = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const [scope, setScope] = useState<'mine' | 'all'>('mine')
  const [addOpen, setAddOpen] = useState(false)

  const { data: things, isLoading, isError } = useThings(scope === 'all' ? 'all' : 'mine', person?.id)

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Things to Take</Title>

      <SegmentedControl
        value={scope}
        onChange={(v) => setScope(v as 'mine' | 'all')}
        data={[
          { label: "I'm responsible", value: 'mine' },
          { label: 'All items', value: 'all' },
        ]}
      />

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load items. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && things?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">Nothing on the list yet.</Text>
        </Center>
      )}

      {things?.map((t) => <ThingItem key={t.id} thing={t} />)}

      {canManage && (
        <Affix position={{ bottom: 24, right: 24 }}>
          <ActionIcon size={56} radius="xl" onClick={() => setAddOpen(true)} aria-label="Add thing to take">
            <IconPlus size={26} />
          </ActionIcon>
        </Affix>
      )}

      {canManage && <AddThingModal opened={addOpen} onClose={() => setAddOpen(false)} />}
    </Stack>
  )
}
