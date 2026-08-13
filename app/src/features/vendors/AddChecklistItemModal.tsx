import { useState } from 'react'
import { Button, Modal, Stack, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useCreateChecklistItem } from './api'

export function AddChecklistItemModal({
  assignmentId,
  opened,
  onClose,
}: {
  assignmentId: string | null
  opened: boolean
  onClose: () => void
}) {
  const createItem = useCreateChecklistItem()
  const [itemName, setItemName] = useState('')
  const [dueDate, setDueDate] = useState<string | null>(null)

  async function handleSubmit() {
    if (!assignmentId || !itemName.trim()) return
    await createItem.mutateAsync({
      assignment_id: assignmentId,
      item_name: itemName.trim(),
      due_date: dueDate,
    })
    setItemName('')
    setDueDate(null)
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add checklist item" centered>
      <Stack gap="sm">
        <TextInput
          label="Item"
          placeholder="e.g. Stage"
          required
          autoFocus
          value={itemName}
          onChange={(e) => setItemName(e.currentTarget.value)}
        />
        <DateInput label="Due date" clearable value={dueDate} onChange={setDueDate} valueFormat="DD MMM YYYY" />
        <Button onClick={handleSubmit} loading={createItem.isPending} disabled={!itemName.trim()} fullWidth mt="xs">
          Add item
        </Button>
      </Stack>
    </Modal>
  )
}
