import { useState } from 'react'
import { Badge, Button, Divider, Group, Modal, NumberInput, Stack, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { useUpdateExpense } from './api'
import type { ExpenseWithRelations } from './api'
import { computeExpenseFinancials } from './finance'
import { AddPaymentModal } from './AddPaymentModal'
import { ContextDocuments } from '../documents/ContextDocuments'

function statusColor(status: string): string {
  switch (status) {
    case 'Paid':
      return 'green'
    case 'Partially Paid':
      return 'yellow'
    case 'Unpaid':
      return 'red'
    default:
      return 'gray'
  }
}

export function ExpenseDetailModal({
  expense,
  opened,
  onClose,
}: {
  expense: ExpenseWithRelations | null
  opened: boolean
  onClose: () => void
}) {
  const updateExpense = useUpdateExpense()
  const [addPaymentOpen, setAddPaymentOpen] = useState(false)
  const [editedId, setEditedId] = useState<string | null>(null)
  const [budgeted, setBudgeted] = useState<number | string>('')
  const [quoted, setQuoted] = useState<number | string>('')
  const [finalised, setFinalised] = useState<number | string>('')

  if (expense && expense.id !== editedId) {
    setEditedId(expense.id)
    setBudgeted(expense.budgeted_amount ?? '')
    setQuoted(expense.quoted_amount ?? '')
    setFinalised(expense.finalised_amount ?? '')
  }

  if (!expense) return null

  const financials = computeExpenseFinancials(
    { finalised_amount: finalised === '' ? null : Number(finalised) },
    expense.payments,
  )

  async function handleSave() {
    if (!expense) return
    await updateExpense.mutateAsync({
      id: expense.id,
      updates: {
        budgeted_amount: budgeted === '' ? null : Number(budgeted),
        quoted_amount: quoted === '' ? null : Number(quoted),
        finalised_amount: finalised === '' ? null : Number(finalised),
      },
    })
  }

  return (
    <Modal opened={opened} onClose={onClose} title={expense.name} centered size="lg">
      <Stack gap="sm">
        <Group gap={6}>
          {expense.category && <Text size="sm" c="dimmed">{expense.category.name}</Text>}
          {expense.event && <Text size="sm" c="dimmed">· {expense.event.name}</Text>}
          {expense.vendor && <Text size="sm" c="dimmed">· {expense.vendor.name}</Text>}
        </Group>

        <Group grow>
          <NumberInput label="Budgeted" value={budgeted} onChange={setBudgeted} />
          <NumberInput label="Quoted" value={quoted} onChange={setQuoted} />
          <NumberInput label="Finalised" value={finalised} onChange={setFinalised} />
        </Group>
        <Button onClick={handleSave} loading={updateExpense.isPending} size="xs" variant="light">
          Save amounts
        </Button>

        <Group justify="space-between" mt="xs">
          <Badge color={statusColor(financials.paymentStatus)} variant="light">
            {financials.paymentStatus}
          </Badge>
          <Text size="sm">
            Paid ₹{financials.paidAmount.toLocaleString('en-IN')} · Outstanding ₹
            {Math.max(financials.outstandingAmount, 0).toLocaleString('en-IN')}
          </Text>
        </Group>

        <Divider label="Payments" labelPosition="left" />
        <Stack gap={4}>
          {expense.payments.length === 0 && (
            <Text size="sm" c="dimmed">
              No payments recorded yet.
            </Text>
          )}
          {expense.payments.map((p) => (
            <Group key={p.id} justify="space-between">
              <Text size="sm">₹{p.amount.toLocaleString('en-IN')}</Text>
              <Text size="xs" c="dimmed">
                {dayjs(p.payment_date).format('DD MMM YYYY')}
                {p.payment_method ? ` · ${p.payment_method}` : ''}
              </Text>
            </Group>
          ))}
        </Stack>
        <Button variant="light" onClick={() => setAddPaymentOpen(true)}>
          Add payment
        </Button>

        <Divider my={4} />
        <ContextDocuments expenseId={expense.id} />

        <AddPaymentModal
          expenseId={expense.id}
          expenseName={expense.name}
          opened={addPaymentOpen}
          onClose={() => setAddPaymentOpen(false)}
        />
      </Stack>
    </Modal>
  )
}
