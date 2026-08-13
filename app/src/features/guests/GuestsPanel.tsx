import { useState } from 'react'
import { ActionIcon, Affix, Center, Loader, Stack, Text, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { useGuests } from './api'
import { GuestItem } from './GuestItem'
import { AddGuestModal } from './AddGuestModal'

export function GuestsPanel() {
  const { person } = useAuth()
  const canManage = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const { data: guests, isLoading, isError } = useGuests()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Guests</Title>

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load guests. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && guests?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No guests added yet.</Text>
        </Center>
      )}

      {guests?.map((g) => <GuestItem key={g.id} guest={g} />)}

      {canManage && (
        <Affix position={{ bottom: 24, right: 24 }}>
          <ActionIcon size={56} radius="xl" onClick={() => setAddOpen(true)} aria-label="Add guest">
            <IconPlus size={26} />
          </ActionIcon>
        </Affix>
      )}

      {canManage && <AddGuestModal opened={addOpen} onClose={() => setAddOpen(false)} />}
    </Stack>
  )
}
