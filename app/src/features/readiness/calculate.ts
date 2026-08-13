// Wedding-level readiness — the weighted model from the spec's readiness
// table, adapted to the entities this build actually has.
//
// N/A categories (no data yet) are excluded from the weighted average
// rather than counted as 0% — an empty category isn't "unready," it's just
// not started, and shouldn't drag down a score that has nothing to do with
// it yet (spec: "items marked N/A must be excluded from the calculation").

export interface CategoryReadiness {
  key: string
  label: string
  weight: number
  percent: number | null // null = no data yet (excluded from the average)
  readyCount: number
  totalCount: number
}

export type ReadinessLevel = 'healthy' | 'needs_attention' | 'at_risk' | 'blocked'

export interface Blocker {
  id: string
  label: string
}

export interface WeddingReadiness {
  overallPercent: number | null
  level: ReadinessLevel
  categories: CategoryReadiness[]
  blockers: Blocker[]
}

function categoryPercent(ready: number, total: number): number | null {
  if (total === 0) return null
  return Math.round((ready / total) * 100)
}

export interface ReadinessRawData {
  taskStatuses: string[]
  decisionStatuses: string[]
  guestsRequiringAccommodation: number
  guestsWithAccommodationAssigned: number
  vendorChecklistStatuses: string[]
  menuStatuses: string[]
  // Per attending guest per event, not the standalone operational
  // transportation log — "Own arrangement"/"Not needed"/"Arranged" all
  // count as satisfied, "Required"/"Unknown" do not.
  transportReady: number
  transportTotal: number
  outfitReadyFlags: boolean[]
  thingStatuses: string[]
  decorStatuses: string[]
  expenseFinancials: { finalisedAmount: number | null; paid: number }[]
  eventIdsWithTimeline: Set<string>
  totalEventCount: number
  criticalBlockers: Blocker[]
}

export function computeWeddingReadiness(data: ReadinessRawData): WeddingReadiness {
  const categories: CategoryReadiness[] = [
    {
      key: 'vendors',
      label: 'Vendors',
      weight: 12,
      readyCount: data.vendorChecklistStatuses.filter((s) => s === 'Done').length,
      totalCount: data.vendorChecklistStatuses.length,
      percent: null,
    },
    {
      key: 'decor',
      label: 'Decor',
      weight: 12,
      readyCount: data.decorStatuses.filter((s) => s === 'Done').length,
      totalCount: data.decorStatuses.length,
      percent: null,
    },
    {
      key: 'decisions',
      label: 'Decisions',
      weight: 12,
      readyCount: data.decisionStatuses.filter((s) => s === 'Decided').length,
      totalCount: data.decisionStatuses.length,
      percent: null,
    },
    {
      key: 'guests',
      label: 'Guests',
      weight: 12,
      readyCount: data.guestsWithAccommodationAssigned,
      totalCount: data.guestsRequiringAccommodation,
      percent: null,
    },
    {
      key: 'menu',
      label: 'Menu',
      weight: 12,
      readyCount: data.menuStatuses.filter((s) => s === 'Finalised').length,
      totalCount: data.menuStatuses.length,
      percent: null,
    },
    {
      key: 'accommodation',
      label: 'Accommodation',
      weight: 10,
      readyCount: data.guestsWithAccommodationAssigned,
      totalCount: data.guestsRequiringAccommodation,
      percent: null,
    },
    {
      key: 'transportation',
      label: 'Transportation',
      weight: 8,
      readyCount: data.transportReady,
      totalCount: data.transportTotal,
      percent: null,
    },
    {
      key: 'tasks',
      label: 'Tasks',
      weight: 6,
      readyCount: data.taskStatuses.filter((s) => s === 'Completed').length,
      totalCount: data.taskStatuses.length,
      percent: null,
    },
    {
      key: 'outfits',
      label: 'Outfits',
      weight: 6,
      readyCount: data.outfitReadyFlags.filter(Boolean).length,
      totalCount: data.outfitReadyFlags.length,
      percent: null,
    },
    {
      key: 'things',
      label: 'Things to Take',
      weight: 5,
      readyCount: data.thingStatuses.filter((s) => s === 'Packed' || s === 'At Venue').length,
      totalCount: data.thingStatuses.length,
      percent: null,
    },
    {
      key: 'finances',
      label: 'Finances',
      weight: 3,
      readyCount: data.expenseFinancials.filter((e) => e.finalisedAmount != null && e.paid >= e.finalisedAmount).length,
      totalCount: data.expenseFinancials.filter((e) => e.finalisedAmount != null).length,
      percent: null,
    },
    {
      key: 'timeline',
      label: 'Timeline',
      weight: 2,
      readyCount: data.eventIdsWithTimeline.size,
      totalCount: data.totalEventCount,
      percent: null,
    },
  ]

  for (const category of categories) {
    category.percent = categoryPercent(category.readyCount, category.totalCount)
  }

  const scored = categories.filter((c) => c.percent !== null)
  const totalWeight = scored.reduce((sum, c) => sum + c.weight, 0)
  const overallPercent =
    totalWeight === 0
      ? null
      : Math.round(scored.reduce((sum, c) => sum + c.weight * (c.percent as number), 0) / totalWeight)

  let level: ReadinessLevel
  if (data.criticalBlockers.length > 0) level = 'blocked'
  else if (overallPercent === null || overallPercent < 50) level = 'at_risk'
  else if (overallPercent < 80) level = 'needs_attention'
  else level = 'healthy'

  return { overallPercent, level, categories, blockers: data.criticalBlockers }
}

export function readinessLevelColor(level: ReadinessLevel): string {
  switch (level) {
    case 'healthy':
      return 'green'
    case 'needs_attention':
      return 'yellow'
    case 'at_risk':
      return 'orange'
    case 'blocked':
      return 'red'
  }
}

export function readinessLevelLabel(level: ReadinessLevel): string {
  switch (level) {
    case 'healthy':
      return 'On track'
    case 'needs_attention':
      return 'Needs attention'
    case 'at_risk':
      return 'At risk'
    case 'blocked':
      return 'Blocked'
  }
}
