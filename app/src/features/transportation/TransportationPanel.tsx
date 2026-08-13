import { useState } from 'react'
import { ActionIcon, Affix, Center, Loader, Stack, Text, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useTransportation } from './api'
import { TransportItem } from './TransportItem'
import { AddTransportModal } from './AddTransportModal'

export function TransportationPanel() {
  const { data: items, isLoading, isError } = useTransportation()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Transportation</Title>

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load transportation. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && items?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No transport requests yet.</Text>
        </Center>
      )}

      {items?.map((item) => <TransportItem key={item.id} item={item} />)}

      <Affix position={{ bottom: 24, right: 24 }}>
        <ActionIcon size={56} radius="xl" onClick={() => setAddOpen(true)} aria-label="Add transport request">
          <IconPlus size={26} />
        </ActionIcon>
      </Affix>

      <AddTransportModal opened={addOpen} onClose={() => setAddOpen(false)} />
    </Stack>
  )
}
