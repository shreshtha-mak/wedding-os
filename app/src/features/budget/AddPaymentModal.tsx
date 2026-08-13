import { useState } from 'react'
import { Button, Modal, NumberInput, Select, Stack, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { usePeople } from '../../lib/queries'
import { useAddPayment } from './api'

export function AddPaymentModal({
  expenseId,
  expenseName,
  opened,
  onClose,
}: {
  expenseId: string | null
  expenseName: string
  opened: boolean
  onClose: () => void
}) {
  const { data: people } = usePeople()
  const addPayment = useAddPayment()

  const [amount, setAmount] = useState<number | string>('')
  const [paymentDate, setPaymentDate] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paidByPersonId, setPaidByPersonId] = useState<string | null>(null)
  const [referenceNumber, setReferenceNumber] = useState('')

  async function handleSubmit() {
    if (!expenseId || !amount) return
    await addPayment.mutateAsync({
      expense_id: expenseId,
      amount: Number(amount),
      payment_date: paymentDate ?? undefined,
      payment_method: paymentMethod.trim() || null,
      paid_by_person_id: paidByPersonId,
      reference_number: referenceNumber.trim() || null,
      expenseName,
    })
    setAmount('')
    setPaymentDate(null)
    setPaymentMethod('')
    setPaidByPersonId(null)
    setReferenceNumber('')
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add payment" centered>
      <Stack gap="sm">
        <NumberInput label="Amount" required autoFocus value={amount} onChange={setAmount} />
        <DateInput label="Date" clearable value={paymentDate} onChange={setPaymentDate} valueFormat="DD MMM YYYY" />
        <TextInput
          label="Payment method"
          placeholder="e.g. Bank transfer, Cash"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.currentTarget.value)}
        />
        <Select
          label="Paid by"
          placeholder="Optional"
          clearable
          searchable
          data={people?.map((p) => ({ value: p.id, label: p.name })) ?? []}
          value={paidByPersonId}
          onChange={setPaidByPersonId}
        />
        <TextInput
          label="Reference number"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.currentTarget.value)}
        />
        <Button onClick={handleSubmit} loading={addPayment.isPending} disabled={!amount} fullWidth mt="xs">
          Add payment
        </Button>
      </Stack>
    </Modal>
  )
}
