export type AttentionSeverity = 'critical' | 'warning'

export interface AttentionItem {
  id: string
  label: string
  sublabel: string
  severity: AttentionSeverity
  linkTo: string
}

export interface NeedsAttentionRaw {
  overdueTasks: { id: string; name: string; due_date: string | null }[]
  unresolvedChallenges: { id: string; title: string; priority: string }[]
  overdueDecisions: { id: string; question: string; deadline: string | null }[]
  overduePayments: { id: string; name: string; outstanding: number }[]
  guestsNeedingAccommodation: { id: string; name: string }[]
}

export function computeNeedsAttention(data: NeedsAttentionRaw): AttentionItem[] {
  const items: AttentionItem[] = []

  for (const c of data.unresolvedChallenges) {
    items.push({
      id: `challenge-${c.id}`,
      label: c.title,
      sublabel: `${c.priority} priority challenge`,
      severity: c.priority === 'Critical' ? 'critical' : 'warning',
      linkTo: '/planning',
    })
  }

  for (const t of data.overdueTasks) {
    items.push({
      id: `task-${t.id}`,
      label: t.name,
      sublabel: 'Overdue task',
      severity: 'warning',
      linkTo: '/planning',
    })
  }

  for (const d of data.overdueDecisions) {
    items.push({
      id: `decision-${d.id}`,
      label: d.question,
      sublabel: 'Overdue decision',
      severity: 'warning',
      linkTo: '/planning',
    })
  }

  for (const p of data.overduePayments) {
    items.push({
      id: `payment-${p.id}`,
      label: p.name,
      sublabel: `₹${p.outstanding.toLocaleString('en-IN')} overdue`,
      severity: 'critical',
      linkTo: '/more',
    })
  }

  for (const g of data.guestsNeedingAccommodation) {
    items.push({
      id: `guest-accom-${g.id}`,
      label: g.name,
      sublabel: 'Needs accommodation',
      severity: 'warning',
      linkTo: '/people',
    })
  }

  return items.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'critical' ? -1 : 1))
}
