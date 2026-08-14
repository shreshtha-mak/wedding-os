import { useState } from 'react'
import { Center, Loader, SegmentedControl, Stack, Text, Title } from '@mantine/core'
import { QuickAddButton } from '../../components/layout/QuickAddButton'
import { useAuth } from '../auth/AuthContext'
import { useTasks } from './api'
import { TaskItem } from './TaskItem'
import { AddTaskModal } from './AddTaskModal'

export function TasksPage() {
  const { person } = useAuth()
  const canSeeAll = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const [scope, setScope] = useState<'mine' | 'all'>('mine')
  const [addOpen, setAddOpen] = useState(false)

  const { data: tasks, isLoading, isError } = useTasks(scope === 'all' ? 'all' : 'mine', person?.id)

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Tasks</Title>

      {canSeeAll && (
        <SegmentedControl
          value={scope}
          onChange={(v) => setScope(v as 'mine' | 'all')}
          data={[
            { label: 'My Tasks', value: 'mine' },
            { label: 'All Tasks', value: 'all' },
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
          Couldn't load tasks. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && tasks?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">
            {scope === 'mine' ? "Nothing assigned to you yet." : 'No tasks yet — add the first one.'}
          </Text>
        </Center>
      )}

      {tasks?.map((task) => <TaskItem key={task.id} task={task} />)}

      {canSeeAll && (
        <QuickAddButton onClick={() => setAddOpen(true)} label="Add task" />
      )}

      {canSeeAll && <AddTaskModal opened={addOpen} onClose={() => setAddOpen(false)} />}
    </Stack>
  )
}
