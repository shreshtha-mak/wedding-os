import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { supabase } from '../../lib/supabase'
import type { ReadinessRawData } from './calculate'
import type { NeedsAttentionRaw } from './needsAttention'

export function useWeddingReadinessData(enabled: boolean) {
  return useQuery({
    queryKey: ['wedding_readiness_data'],
    enabled,
    queryFn: async (): Promise<ReadinessRawData> => {
      const [
        tasksRes,
        decisionsRes,
        guestsRes,
        assignmentsRes,
        checklistRes,
        menusRes,
        transportRes,
        outfitsRes,
        thingsRes,
        decorRes,
        expensesRes,
        timelineRes,
        challengesRes,
        eventsRes,
      ] = await Promise.all([
        supabase.from('tasks').select('status'),
        supabase.from('decisions').select('status'),
        supabase.from('guests').select('id, accommodation_required'),
        supabase.from('accommodation_assignments').select('guest_id'),
        supabase.from('vendor_checklist_items').select('status'),
        supabase.from('menus').select('status'),
        supabase.from('guest_event_attendance').select('transportation_status').eq('status', 'Attending'),
        supabase.from('outfits').select('is_ready'),
        supabase.from('things_to_take').select('status'),
        supabase.from('decor_items').select('status'),
        supabase.from('expenses').select('finalised_amount, payments(amount)'),
        supabase.from('timeline_items').select('event_id'),
        supabase.from('challenges').select('id, title, priority, status'),
        supabase.from('events').select('id'),
      ])

      for (const res of [
        tasksRes, decisionsRes, guestsRes, assignmentsRes, checklistRes, menusRes,
        transportRes, outfitsRes, thingsRes, decorRes, expensesRes, timelineRes, challengesRes, eventsRes,
      ]) {
        if (res.error) throw res.error
      }

      const assignedGuestIds = new Set(assignmentsRes.data!.map((a) => a.guest_id))
      const guestsRequiringAccommodation = guestsRes.data!.filter((g) => g.accommodation_required)
      const guestsWithAccommodationAssigned = guestsRequiringAccommodation.filter((g) =>
        assignedGuestIds.has(g.id),
      ).length

      const transportSatisfied = new Set(['Not needed', 'Own arrangement', 'Arranged'])
      const transportReady = transportRes.data!.filter((t) => transportSatisfied.has(t.transportation_status)).length

      const criticalBlockers = challengesRes
        .data!.filter((c) => c.priority === 'Critical' && c.status !== 'Resolved')
        .map((c) => ({ id: c.id, label: c.title }))

      return {
        taskStatuses: tasksRes.data!.map((t) => t.status),
        decisionStatuses: decisionsRes.data!.map((d) => d.status),
        guestsRequiringAccommodation: guestsRequiringAccommodation.length,
        guestsWithAccommodationAssigned,
        vendorChecklistStatuses: checklistRes.data!.map((c) => c.status),
        menuStatuses: menusRes.data!.map((m) => m.status),
        transportReady,
        transportTotal: transportRes.data!.length,
        outfitReadyFlags: outfitsRes.data!.map((o) => o.is_ready),
        thingStatuses: thingsRes.data!.map((t) => t.status),
        decorStatuses: decorRes.data!.map((d) => d.status),
        expenseFinancials: expensesRes.data!.map((e) => ({
          finalisedAmount: e.finalised_amount,
          paid: e.payments.reduce((sum, p) => sum + p.amount, 0),
        })),
        eventIdsWithTimeline: new Set(timelineRes.data!.map((t) => t.event_id)),
        totalEventCount: eventsRes.data!.length,
        criticalBlockers,
      }
    },
  })
}

export function useNeedsAttentionData(enabled: boolean) {
  return useQuery({
    queryKey: ['needs_attention_data'],
    enabled,
    queryFn: async (): Promise<NeedsAttentionRaw> => {
      const today = dayjs().format('YYYY-MM-DD')

      const [tasksRes, challengesRes, decisionsRes, expensesRes, guestsRes, assignmentsRes, transportRes] =
        await Promise.all([
          supabase.from('tasks').select('id, name, due_date').neq('status', 'Completed').not('due_date', 'is', null).lt('due_date', today),
          supabase.from('challenges').select('id, title, priority').neq('status', 'Resolved').in('priority', ['Critical', 'High']),
          supabase.from('decisions').select('id, question, deadline').eq('status', 'Pending').not('deadline', 'is', null).lt('deadline', today),
          supabase.from('expenses').select('id, name, finalised_amount, due_date, payments(amount)').not('due_date', 'is', null).lt('due_date', today),
          supabase.from('guests').select('id, person:people(name)').eq('accommodation_required', true),
          supabase.from('accommodation_assignments').select('guest_id'),
          supabase
            .from('guest_event_attendance')
            .select('id, transportation_status, guest:guests(person:people(name)), event:events(name)')
            .eq('status', 'Attending')
            .in('transportation_status', ['Required', 'Unknown']),
        ])

      for (const res of [tasksRes, challengesRes, decisionsRes, expensesRes, guestsRes, assignmentsRes, transportRes]) {
        if (res.error) throw res.error
      }

      const assignedGuestIds = new Set(assignmentsRes.data!.map((a) => a.guest_id))

      const overduePayments = expensesRes
        .data!.map((e) => ({
          id: e.id,
          name: e.name,
          outstanding: (e.finalised_amount ?? 0) - e.payments.reduce((sum, p) => sum + p.amount, 0),
        }))
        .filter((e) => e.outstanding > 0)

      const guestsNeedingAccommodation = (guestsRes.data as unknown as { id: string; person: { name: string } }[])!
        .filter((g) => !assignedGuestIds.has(g.id))
        .map((g) => ({ id: g.id, name: g.person.name }))

      const guestsNeedingTransport = (
        transportRes.data as unknown as { id: string; guest: { person: { name: string } }; event: { name: string } }[]
      )!.map((row) => ({ id: row.id, name: row.guest.person.name, eventName: row.event.name }))

      return {
        overdueTasks: tasksRes.data!,
        unresolvedChallenges: challengesRes.data!,
        overdueDecisions: decisionsRes.data!,
        overduePayments,
        guestsNeedingAccommodation,
        guestsNeedingTransport,
      }
    },
  })
}
