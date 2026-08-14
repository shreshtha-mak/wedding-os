import { useState } from 'react'
import { Center, Loader, Stack, Text, Title } from '@mantine/core'
import { QuickAddButton } from '../../components/layout/QuickAddButton'
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

      <QuickAddButton onClick={() => setAddOpen(true)} label="Add transport request" />

      <AddTransportModal opened={addOpen} onClose={() => setAddOpen(false)} />
    </Stack>
  )
}
