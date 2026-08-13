import { useState } from 'react'
import {
  Button,
  Collapse,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { useBudgetCategories, useEvents } from '../../lib/queries'
import { useVendors } from '../vendors/api'
import { useCreateExpense } from './api'

export function AddExpenseModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { person } = useAuth()
  const { data: categories } = useBudgetCategories()
  const { data: events } = useEvents()
  const { data: vendors } = useVendors()
  const createExpense = useCreateExpense()

  const [name, setName] = useState('')
  const [budgetedAmount, setBudgetedAmount] = useState<number | string>('')
  const [showMore, setShowMore] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string | null>(null)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [quotedAmount, setQuotedAmount] = useState<number | string>('')
  const [finalisedAmount, setFinalisedAmount] = useState<number | string>('')
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  function reset() {
    setName('')
    setBudgetedAmount('')
    setShowMore(false)
    setCategoryId(null)
    setEventId(null)
    setVendorId(null)
    setQuotedAmount('')
    setFinalisedAmount('')
    setDueDate(null)
    setNotes('')
  }

  async function handleSubmit() {
    if (!name.trim() || !person) return
    await createExpense.mutateAsync({
      wedding_id: person.wedding_id,
      name: name.trim(),
      budgeted_amount: budgetedAmount === '' ? null : Number(budgetedAmount),
      category_id: categoryId,
      event_id: eventId,
      vendor_id: vendorId,
      quoted_amount: quotedAmount === '' ? null : Number(quotedAmount),
      finalised_amount: finalisedAmount === '' ? null : Number(finalisedAmount),
      due_date: dueDate,
      notes: notes.trim() || null,
      created_by: person.id,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add expense" centered>
      <Stack gap="sm">
        <TextInput
          label="Expense"
          placeholder="e.g. Decorator"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <NumberInput label="Budgeted amount" value={budgetedAmount} onChange={setBudgetedAmount} />

        <UnstyledButton
          onClick={() => setShowMore((v) => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Text size="sm" c="dimmed">
            More details
          </Text>
          {showMore ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </UnstyledButton>

        <Collapse expanded={showMore}>
          <Stack gap="sm">
            <Select
              label="Category"
              placeholder="None"
              clearable
              searchable
              data={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
              value={categoryId}
              onChange={setCategoryId}
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
              label="Vendor"
              placeholder="None"
              clearable
              searchable
              data={vendors?.map((v) => ({ value: v.id, label: v.name })) ?? []}
              value={vendorId}
              onChange={setVendorId}
            />
            <NumberInput label="Quoted amount" value={quotedAmount} onChange={setQuotedAmount} />
            <NumberInput label="Finalised amount" value={finalisedAmount} onChange={setFinalisedAmount} />
            <DateInput label="Due date" clearable value={dueDate} onChange={setDueDate} valueFormat="DD MMM YYYY" />
            <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} autosize minRows={2} />
          </Stack>
        </Collapse>

        <Button onClick={handleSubmit} loading={createExpense.isPending} disabled={!name.trim()} fullWidth mt="xs">
          Add expense
        </Button>
      </Stack>
    </Modal>
  )
}
