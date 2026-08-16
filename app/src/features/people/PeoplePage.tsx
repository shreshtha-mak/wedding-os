import { useMemo, useState } from 'react'
import {
  Badge,
  Center,
  Group,
  Loader,
  SegmentedControl,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { IconUserPlus } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { QuickAddButton } from '../../components/layout/QuickAddButton'
import { usePeopleAdmin } from './api'
import type { PersonWithAccount } from './api'
import { AddPersonModal } from './AddPersonModal'
import { LinkAccountModal } from './LinkAccountModal'
import type { RoleId } from '../../types/database'

const ROLE_COLOR: Record<RoleId, string> = {
  admin: 'red',
  organiser: 'blue',
  restricted: 'gray',
}

function PersonRow({
  p,
  isAdmin,
  onLink,
}: {
  p: PersonWithAccount
  isAdmin: boolean
  onLink: (p: PersonWithAccount) => void
}) {
  return (
    <Group
      justify="space-between"
      wrap="nowrap"
      py="xs"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <div style={{ minWidth: 0 }}>
        <Text fw={500} c={p.active ? undefined : 'dimmed'}>
          {p.name}
        </Text>
        <Group gap={6}>
          {p.relationship && (
            <Text size="xs" c="dimmed">
              {p.relationship}
            </Text>
          )}
          {p.category === 'guest' && (
            <Badge size="xs" color="grape" variant="light">
              Guest
            </Badge>
          )}
          {p.role_id && (
            <Badge size="xs" color={ROLE_COLOR[p.role_id]} variant="light">
              {p.role_id}
            </Badge>
          )}
          {p.has_login ? (
            <Badge size="xs" color="green" variant="outline">
              Has login
            </Badge>
          ) : (
            <Badge size="xs" color="gray" variant="outline">
              No login
            </Badge>
          )}
        </Group>
      </div>
      {isAdmin && !p.has_login && (
        <UnstyledButton onClick={() => onLink(p)} aria-label={`Link login for ${p.name}`}>
          <IconUserPlus size={20} />
        </UnstyledButton>
      )}
    </Group>
  )
}

type CategoryFilter = 'family' | 'guest' | 'all'

export function PeoplePage() {
  const { person } = useAuth()
  const isAdmin = person?.role_id === 'admin'
  const { data: people, isLoading, isError } = usePeopleAdmin()
  const [addOpen, setAddOpen] = useState(false)
  const [linkTarget, setLinkTarget] = useState<PersonWithAccount | null>(null)
  // Family and Guests are now kept visibly separate here (a person can
  // still be both — this is just which list they surface in by default),
  // instead of one undifferentiated roster.
  const [filter, setFilter] = useState<CategoryFilter>('family')

  const filtered = useMemo(
    () => (filter === 'all' ? people : people?.filter((p) => p.category === filter)),
    [people, filter],
  )

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Family</Title>

      <SegmentedControl
        value={filter}
        onChange={(v) => setFilter(v as CategoryFilter)}
        data={[
          { label: 'Family', value: 'family' },
          { label: 'Guests', value: 'guest' },
          { label: 'All', value: 'all' },
        ]}
      />

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load people. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && people?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No one added yet.</Text>
        </Center>
      )}

      {!isLoading && !isError && people && people.length > 0 && filtered?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">{filter === 'guest' ? 'No guests added here yet.' : 'No family members yet.'}</Text>
        </Center>
      )}

      {filtered?.map((p) => <PersonRow key={p.id} p={p} isAdmin={isAdmin} onLink={setLinkTarget} />)}

      {isAdmin && (
        <QuickAddButton onClick={() => setAddOpen(true)} label="Add person" />
      )}

      <AddPersonModal opened={addOpen} onClose={() => setAddOpen(false)} />
      <LinkAccountModal person={linkTarget} onClose={() => setLinkTarget(null)} />
    </Stack>
  )
}
