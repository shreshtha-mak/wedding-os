import { useState } from 'react'
import { Center, Loader, SegmentedControl, Stack, Text, Title } from '@mantine/core'
import { QuickAddButton } from '../../components/layout/QuickAddButton'
import { useAuth } from '../auth/AuthContext'
import { useChallenges } from './api'
import { ChallengeItem } from './ChallengeItem'
import { AddChallengeModal } from './AddChallengeModal'

export function ChallengesPanel() {
  const { person } = useAuth()
  const canManage = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const [scope, setScope] = useState<'mine' | 'all'>('mine')
  const [addOpen, setAddOpen] = useState(false)

  const { data: challenges, isLoading, isError } = useChallenges(
    scope === 'all' ? 'all' : 'mine',
    person?.id,
  )

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Challenges</Title>

      {canManage && (
        <SegmentedControl
          value={scope}
          onChange={(v) => setScope(v as 'mine' | 'all')}
          data={[
            { label: "I own", value: 'mine' },
            { label: 'All Challenges', value: 'all' },
          ]}
        />
      )}

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load challenges. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && challenges?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No open challenges 🎉</Text>
        </Center>
      )}

      {challenges?.map((c) => <ChallengeItem key={c.id} challenge={c} />)}

      {canManage && (
        <QuickAddButton onClick={() => setAddOpen(true)} label="Add challenge" />
      )}

      {canManage && <AddChallengeModal opened={addOpen} onClose={() => setAddOpen(false)} />}
    </Stack>
  )
}
