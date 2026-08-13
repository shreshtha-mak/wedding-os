import { useState } from 'react'
import {
  ActionIcon,
  Affix,
  Badge,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { IconPlus, IconX } from '@tabler/icons-react'
import { useAccommodationLocations, useRemoveAssignment } from './api'
import { useGuests } from '../guests/api'
import { AddLocationModal } from './AddLocationModal'
import { AddRoomModal } from './AddRoomModal'
import { AssignGuestModal } from './AssignGuestModal'
import type { RoomWithAssignments } from './api'

function RoomRow({ room }: { room: RoomWithAssignments }) {
  const [assignOpen, setAssignOpen] = useState(false)
  const removeAssignment = useRemoveAssignment()
  const occupied = room.assignments.length
  const full = occupied >= room.capacity

  return (
    <>
      <Stack gap={4} py={6} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
        <Group justify="space-between" wrap="nowrap">
          <Text size="sm" fw={500}>
            {room.room_name}
          </Text>
          <Group gap={6}>
            <Badge size="xs" color={full ? 'gray' : 'green'} variant="light">
              {occupied}/{room.capacity} beds
            </Badge>
            {!full && (
              <UnstyledButton onClick={() => setAssignOpen(true)}>
                <Text size="xs" c="blue">
                  + Assign
                </Text>
              </UnstyledButton>
            )}
          </Group>
        </Group>
        {room.assignments.map((a) => (
          <Group key={a.id} justify="space-between" wrap="nowrap" pl="sm">
            <Text size="xs" c="dimmed">
              {a.guest.person.name}
            </Text>
            <ActionIcon size="xs" variant="subtle" onClick={() => removeAssignment.mutate(a.id)} aria-label="Remove">
              <IconX size={12} />
            </ActionIcon>
          </Group>
        ))}
      </Stack>
      <AssignGuestModal roomId={room.id} opened={assignOpen} onClose={() => setAssignOpen(false)} />
    </>
  )
}

export function AccommodationPanel() {
  const { data: locations, isLoading, isError } = useAccommodationLocations()
  const { data: guests } = useGuests()
  const [addLocationOpen, setAddLocationOpen] = useState(false)
  const [addRoomFor, setAddRoomFor] = useState<string | null>(null)

  const assignedGuestIds = new Set(
    locations?.flatMap((l) => l.rooms.flatMap((r) => r.assignments.map((a) => a.guest.id))),
  )
  const needsAccommodation = guests?.filter((g) => g.accommodation_required && !assignedGuestIds.has(g.id))

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Accommodation</Title>

      {needsAccommodation && needsAccommodation.length > 0 && (
        <Card withBorder radius="md" p="md" style={{ borderColor: 'var(--mantine-color-orange-5)' }}>
          <Text size="sm" fw={500} c="orange">
            Needs accommodation
          </Text>
          <Stack gap={2} mt={4}>
            {needsAccommodation.map((g) => (
              <Text key={g.id} size="sm">
                {g.person.name}
              </Text>
            ))}
          </Stack>
        </Card>
      )}

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load accommodation. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && locations?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No accommodation locations added yet.</Text>
        </Center>
      )}

      {locations?.map((location) => (
        <Card key={location.id} withBorder radius="md" p="md">
          <Group justify="space-between">
            <div>
              <Text fw={600}>{location.name}</Text>
              {location.address && (
                <Text size="xs" c="dimmed">
                  {location.address}
                </Text>
              )}
            </div>
            <UnstyledButton onClick={() => setAddRoomFor(location.id)}>
              <Text size="xs" c="blue">
                + Room
              </Text>
            </UnstyledButton>
          </Group>
          <Stack gap={0} mt="sm">
            {location.rooms.map((room) => (
              <RoomRow key={room.id} room={room} />
            ))}
            {location.rooms.length === 0 && (
              <Text size="xs" c="dimmed">
                No rooms yet.
              </Text>
            )}
          </Stack>
        </Card>
      ))}

      <Affix position={{ bottom: 24, right: 24 }}>
        <ActionIcon size={56} radius="xl" onClick={() => setAddLocationOpen(true)} aria-label="Add location">
          <IconPlus size={26} />
        </ActionIcon>
      </Affix>

      <AddLocationModal opened={addLocationOpen} onClose={() => setAddLocationOpen(false)} />
      {addRoomFor && (
        <AddRoomModal locationId={addRoomFor} opened={!!addRoomFor} onClose={() => setAddRoomFor(null)} />
      )}
    </Stack>
  )
}
