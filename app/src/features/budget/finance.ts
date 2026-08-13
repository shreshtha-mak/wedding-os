import type { Expense, Payment } from '../../types/database'

export type PaymentStatus = 'Not Finalised' | 'Unpaid' | 'Partially Paid' | 'Paid'

export interface ExpenseFinancials {
  paidAmount: number
  outstandingAmount: number
  paymentStatus: PaymentStatus
}

// Outstanding is always derived, never stored (spec: "do not ask users to
// manually maintain the outstanding amount if it can be derived") — one
// expense can have many payments, so this sums them rather than trusting a
// cached total.
export function computeExpenseFinancials(
  expense: Pick<Expense, 'finalised_amount'>,
  payments: Pick<Payment, 'amount'>[],
): ExpenseFinancials {
  const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0)

  if (expense.finalised_amount == null) {
    return { paidAmount, outstandingAmount: 0, paymentStatus: 'Not Finalised' }
  }

  const outstandingAmount = expense.finalised_amount - paidAmount
  const paymentStatus: PaymentStatus =
    paidAmount <= 0 ? 'Unpaid' : outstandingAmount > 0 ? 'Partially Paid' : 'Paid'

  return { paidAmount, outstandingAmount, paymentStatus }
}

export interface BudgetSummary {
  totalBudgeted: number
  totalQuoted: number
  totalFinalised: number
  totalPaid: number
  totalOutstanding: number
}

export function computeBudgetSummary(
  expenses: { budgeted_amount: number | null; quoted_amount: number | null; finalised_amount: number | null; payments: Pick<Payment, 'amount'>[] }[],
): BudgetSummary {
  let totalBudgeted = 0
  let totalQuoted = 0
  let totalFinalised = 0
  let totalPaid = 0
  let totalOutstanding = 0

  for (const expense of expenses) {
    totalBudgeted += expense.budgeted_amount ?? 0
    totalQuoted += expense.quoted_amount ?? 0
    totalFinalised += expense.finalised_amount ?? 0
    const { paidAmount, outstandingAmount } = computeExpenseFinancials(expense, expense.payments)
    totalPaid += paidAmount
    totalOutstanding += Math.max(outstandingAmount, 0)
  }

  return { totalBudgeted, totalQuoted, totalFinalised, totalPaid, totalOutstanding }
}
