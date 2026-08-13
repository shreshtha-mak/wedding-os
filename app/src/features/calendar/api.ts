import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export type CalendarItemType = 'event' | 'task' | 'decision'

export interface CalendarItem {
  id: string
  date: string
  type: CalendarItemType
  label: string
  sublabel: string | null
  linkTo: string
}

// Combines Events + Task due dates + Decision deadlines (spec's Calendar
// categories not yet buildable — Vendor appointments/Fittings/Payments —
// will fold in here once those modules exist, without callers changing).
export function useCalendarItems() {
  return useQuery({
    queryKey: ['calendar_items'],
    queryFn: async () => {
      const [events, tasks, decisions] = await Promise.all([
        supabase.from('events').select('id, name, event_date, location'),
        supabase.from('tasks').select('id, name, due_date, status').not('due_date', 'is', null),
        supabase.from('decisions').select('id, question, deadline, status').not('deadline', 'is', null),
      ])

      if (events.error) throw events.error
      if (tasks.error) throw tasks.error
      if (decisions.error) throw decisions.error

      const items: CalendarItem[] = [
        ...events.data.map((e) => ({
          id: e.id,
          date: e.event_date,
          type: 'event' as const,
          label: e.name,
          sublabel: e.location,
          linkTo: `/events/${e.id}`,
        })),
        ...tasks.data
          .filter((t) => t.status !== 'Completed')
          .map((t) => ({
            id: t.id,
            date: t.due_date as string,
            type: 'task' as const,
            label: t.name,
            sublabel: 'Task due',
            linkTo: `/planning`,
          })),
        ...decisions.data
          .filter((d) => d.status !== 'Decided')
          .map((d) => ({
            id: d.id,
            date: d.deadline as string,
            type: 'decision' as const,
            label: d.question,
            sublabel: 'Decision due',
            linkTo: `/planning`,
          })),
      ]

      return items.sort((a, b) => a.date.localeCompare(b.date))
    },
  })
}
