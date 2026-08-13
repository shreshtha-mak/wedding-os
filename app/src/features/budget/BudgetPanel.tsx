import { useState } from 'react'
import {
  ActionIcon,
  Affix,
  Badge,
  Card,
  Center,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useExpenses } from './api'
import { computeBudgetSummary, computeExpenseFinancials } from './finance'
import { AddExpenseModal } from './AddExpenseModal'
import { ExpenseDetailModal } from './ExpenseDetailModal'
import type { ExpenseWithRelations } from './api'

function fmt(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <Card withBorder radius="md" p="sm">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={600}>{value}</Text>
    </Card>
  )
}

function ExpenseRow({ expense, onOpen }: { expense: ExpenseWithRelations; onOpen: () => void }) {
  const { paymentStatus } = computeExpenseFinancials(expense, expense.payments)
  const color =
    paymentStatus === 'Paid' ? 'green' : paymentStatus === 'Partially Paid' ? 'yellow' : paymentStatus === 'Unpaid' ? 'red' : 'gray'

  return (
    <UnstyledButton onClick={onOpen} style={{ width: '100%' }}>
      <Group
        justify="space-between"
        wrap="nowrap"
        py="xs"
        style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
      >
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500}>
            {expense.name}
          </Text>
          <Text size="xs" c="dimmed">
            {[expense.category?.name, expense.event?.name].filter(Boolean).join(' · ')}
          </Text>
        </Stack>
        <Stack gap={2} align="flex-end">
          <Text size="sm">{expense.finalised_amount != null ? fmt(expense.finalised_amount) : '—'}</Text>
          <Badge size="xs" color={color} variant="light">
            {paymentStatus}
          </Badge>
        </Stack>
      </Group>
    </UnstyledButton>
  )
}

export function BudgetPanel() {
  const { data: expenses, isLoading, isError } = useExpenses()
  const [addOpen, setAddOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<ExpenseWithRelations | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const summary = expenses ? computeBudgetSummary(expenses) : null

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Budget</Title>

      {summary && (
        <SimpleGrid cols={2} spacing="xs">
          <SummaryTile label="Budgeted" value={fmt(summary.totalBudgeted)} />
          <SummaryTile label="Finalised" value={fmt(summary.totalFinalised)} />
          <SummaryTile label="Paid" value={fmt(summary.totalPaid)} />
          <SummaryTile label="Outstanding" value={fmt(summary.totalOutstanding)} />
          <SummaryTile label="Remaining budget" value={fmt(summary.totalBudgeted - summary.totalFinalised)} />
          <SummaryTile label="Quoted" value={fmt(summary.totalQuoted)} />
        </SimpleGrid>
      )}

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load expenses. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && expenses?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No expenses added yet.</Text>
        </Center>
      )}

      {expenses?.map((e) => (
        <ExpenseRow
          key={e.id}
          expense={e}
          onOpen={() => {
            setSelectedExpense(e)
            setDetailOpen(true)
          }}
        />
      ))}

      <Affix position={{ bottom: 24, right: 24 }}>
        <ActionIcon size={56} radius="xl" onClick={() => setAddOpen(true)} aria-label="Add expense">
          <IconPlus size={26} />
        </ActionIcon>
      </Affix>

      <AddExpenseModal opened={addOpen} onClose={() => setAddOpen(false)} />
      <ExpenseDetailModal
        expense={selectedExpense}
        opened={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </Stack>
  )
}
