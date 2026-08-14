import { useState } from 'react'
import { Center, Loader, SegmentedControl, Stack, Text, Title } from '@mantine/core'
import { QuickAddButton } from '../../components/layout/QuickAddButton'
import { useAuth } from '../auth/AuthContext'
import { useDecisions } from './api'
import { DecisionItem } from './DecisionItem'
import { AddDecisionModal } from './AddDecisionModal'

export function DecisionsPanel() {
  const { person } = useAuth()
  const canManage = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const [scope, setScope] = useState<'mine' | 'all'>('mine')
  const [addOpen, setAddOpen] = useState(false)

  const { data: decisions, isLoading, isError } = useDecisions(
    scope === 'all' ? 'all' : 'mine',
    person?.id,
  )

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Decisions</Title>

      {canManage && (
        <SegmentedControl
          value={scope}
          onChange={(v) => setScope(v as 'mine' | 'all')}
          data={[
            { label: "I'm responsible", value: 'mine' },
            { label: 'All Decisions', value: 'all' },
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
          Couldn't load decisions. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && decisions?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No decisions pending.</Text>
        </Center>
      )}

      {decisions?.map((d) => <DecisionItem key={d.id} decision={d} />)}

      {canManage && (
        <QuickAddButton onClick={() => setAddOpen(true)} label="Add decision" />
      )}

      {canManage && <AddDecisionModal opened={addOpen} onClose={() => setAddOpen(false)} />}
    </Stack>
  )
}
