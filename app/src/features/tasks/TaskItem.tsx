import { Badge, Checkbox, Group, Stack, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { useAuth } from '../auth/AuthContext'
import { useCompleteTask } from './api'
import { dueIndicator, dueIndicatorColor, priorityColor } from './taskStatus'
import type { TaskWithRelations } from './api'

export function TaskItem({ task }: { task: TaskWithRelations }) {
  const { person } = useAuth()
  const completeTask = useCompleteTask()
  const indicator = dueIndicator(task)
  const isCompleted = task.status === 'Completed'

  return (
    <Group
      wrap="nowrap"
      align="flex-start"
      py="xs"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <Checkbox
        mt={2}
        checked={isCompleted}
        disabled={isCompleted || completeTask.isPending}
        onChange={() => {
          if (person) completeTask.mutate({ id: task.id, completedBy: person.id, taskName: task.name })
        }}
        aria-label={`Complete ${task.name}`}
      />
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text td={isCompleted ? 'line-through' : undefined} c={isCompleted ? 'dimmed' : undefined} fw={500}>
          {task.name}
        </Text>
        <Group gap={6} wrap="wrap">
          {indicator && (
            <Badge size="xs" color={dueIndicatorColor(indicator)} variant="light">
              {indicator}
            </Badge>
          )}
          {task.priority !== 'Medium' && (
            <Badge size="xs" color={priorityColor(task.priority)} variant="outline">
              {task.priority}
            </Badge>
          )}
          {task.assigned_person && (
            <Text size="xs" c="dimmed">
              {task.assigned_person.name}
            </Text>
          )}
          {task.due_date && !indicator && (
            <Text size="xs" c="dimmed">
              {dayjs(task.due_date).format('DD MMM')}
            </Text>
          )}
          {task.event && (
            <Text size="xs" c="dimmed">
              · {task.event.name}
            </Text>
          )}
        </Group>
      </Stack>
    </Group>
  )
}
