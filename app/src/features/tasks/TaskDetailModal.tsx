import { useState } from 'react'
import { Button, Modal, Select, Stack, Textarea, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useAuth } from '../auth/AuthContext'
import { useEvents, usePeople, useTaskCategories } from '../../lib/queries'
import { useUpdateTask } from './api'
import type { TaskWithRelations } from './api'
import type { TaskPriority, TaskStatus } from '../../types/database'

const STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'Blocked', 'Completed']
const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical']

export function TaskDetailModal({
  task,
  opened,
  onClose,
}: {
  task: TaskWithRelations
  opened: boolean
  onClose: () => void
}) {
  const { person } = useAuth()
  const canManage = person?.role_id === 'admin' || person?.role_id === 'organiser'
  const { data: people } = usePeople()
  const { data: events } = useEvents()
  const { data: categories } = useTaskCategories()
  const updateTask = useUpdateTask()

  const [editedId, setEditedId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [assignedPersonId, setAssignedPersonId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [priority, setPriority] = useState<TaskPriority>('Medium')
  const [status, setStatus] = useState<TaskStatus>('Not Started')
  const [eventId, setEventId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  // Sync local form state whenever a (new) task is opened — same pattern
  // as GuestDetailModal/OutfitDetailModal.
  if (task.id !== editedId) {
    setEditedId(task.id)
    setName(task.name)
    setDescription(task.description ?? '')
    setAssignedPersonId(task.assigned_person_id)
    setDueDate(task.due_date)
    setPriority(task.priority)
    setStatus(task.status)
    setEventId(task.event_id)
    setCategoryId(task.category_id)
    setNotes(task.notes ?? '')
  }

  async function handleSave() {
    if (!name.trim() || !person) return
    await updateTask.mutateAsync({
      id: task.id,
      updates: {
        name: name.trim(),
        description: description.trim() || null,
        assigned_person_id: assignedPersonId,
        due_date: dueDate,
        priority,
        status,
        event_id: eventId,
        category_id: categoryId,
        notes: notes.trim() || null,
      },
      completedBy: person.id,
      becameCompleted: status === 'Completed' && task.status !== 'Completed',
      taskName: name.trim(),
    })
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Edit task" centered size="lg">
      <Stack gap="sm">
        <TextInput label="Task" required value={name} onChange={(e) => setName(e.currentTarget.value)} />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Select
          label="Status"
          data={STATUSES}
          value={status}
          allowDeselect={false}
          onChange={(v) => setStatus((v as TaskStatus) ?? status)}
        />
        <Select
          label="Priority"
          data={PRIORITIES}
          value={priority}
          allowDeselect={false}
          onChange={(v) => setPriority((v as TaskPriority) ?? priority)}
        />
        {canManage && (
          <Select
            label="Assign to"
            placeholder="Anyone"
            clearable
            searchable
            data={people?.map((p) => ({ value: p.id, label: p.name })) ?? []}
            value={assignedPersonId}
            onChange={setAssignedPersonId}
          />
        )}
        <DateInput
          label="Due date"
          placeholder="Optional"
          clearable
          value={dueDate}
          onChange={setDueDate}
          valueFormat="DD MMM YYYY"
        />
        <Select
          label="Event"
          placeholder="None"
          clearable
          data={events?.map((e) => ({ value: e.id, label: e.name })) ?? []}
          value={eventId}
          onChange={setEventId}
        />
        <Select
          label="Category"
          placeholder="None"
          clearable
          searchable
          data={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
          value={categoryId}
          onChange={setCategoryId}
        />
        <Textarea
          label="Updates / notes"
          placeholder="Track progress here as the task moves along"
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          autosize
          minRows={3}
        />
        <Button onClick={handleSave} loading={updateTask.isPending} disabled={!name.trim()} fullWidth mt="xs">
          Save
        </Button>
      </Stack>
    </Modal>
  )
}
