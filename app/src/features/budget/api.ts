import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type {
  BudgetCategory,
  EventRow,
  Expense,
  ExpenseInsert,
  Payment,
  PaymentInsert,
  Vendor,
} from '../../types/database'

export interface ExpenseWithRelations extends Expense {
  event: Pick<EventRow, 'id' | 'name'> | null
  category: Pick<BudgetCategory, 'id' | 'name'> | null
  vendor: Pick<Vendor, 'id' | 'name'> | null
  payments: Payment[]
}

const EXPENSE_SELECT = `
  *,
  event:events(id, name),
  category:budget_categories(id, name),
  vendor:vendors(id, name),
  payments(*)
`

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select(EXPENSE_SELECT).order('name')
      if (error) throw error
      return data as unknown as ExpenseWithRelations[]
    },
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (expense: ExpenseInsert) => {
      const { error } = await supabase.from('expenses').insert(expense)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      logActivity('expense', null, 'created', `added expense "${variables.name}"`)
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ExpenseInsert> }) => {
      const { error } = await supabase.from('expenses').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}

export function useAddPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payment: PaymentInsert & { expenseName: string }) => {
      const { expenseName: _expenseName, ...insert } = payment
      const { error } = await supabase.from('payments').insert(insert)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      logActivity(
        'payment',
        null,
        'created',
        `recorded a payment of ₹${variables.amount.toLocaleString('en-IN')} for "${variables.expenseName}"`,
      )
    },
  })
}

