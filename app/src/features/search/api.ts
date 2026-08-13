import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export interface SearchResult {
  id: string
  type: string
  label: string
  linkTo: string
}

// Every query below goes through the same RLS policies as the rest of the
// app, so a restricted user searching "budget" simply gets zero expense
// results back — permissions are enforced by the same mechanism everywhere,
// not re-implemented here (spec: "search results must respect permissions").
export function useSearch(term: string) {
  const pattern = `%${term}%`
  return useQuery({
    queryKey: ['search', term],
    enabled: term.trim().length >= 2,
    queryFn: async () => {
      const [
        tasks,
        decisions,
        challenges,
        people,
        vendors,
        things,
        events,
        accommodation,
        transportation,
        menuItems,
        expenses,
        documents,
        timelineItems,
        outfits,
        decor,
      ] = await Promise.all([
        supabase.from('tasks').select('id, name').ilike('name', pattern).limit(10),
        supabase.from('decisions').select('id, question').ilike('question', pattern).limit(10),
        supabase.from('challenges').select('id, title').ilike('title', pattern).limit(10),
        supabase.from('people').select('id, name').ilike('name', pattern).limit(10),
        supabase.from('vendors').select('id, name').ilike('name', pattern).limit(10),
        supabase.from('things_to_take').select('id, item_name').ilike('item_name', pattern).limit(10),
        supabase.from('events').select('id, name').ilike('name', pattern).limit(10),
        supabase.from('accommodation_locations').select('id, name').ilike('name', pattern).limit(10),
        supabase
          .from('transportation')
          .select('id, group_label, pickup_location, destination')
          .or(`group_label.ilike.${pattern},pickup_location.ilike.${pattern},destination.ilike.${pattern}`)
          .limit(10),
        supabase.from('menu_items').select('id, item_name').ilike('item_name', pattern).limit(10),
        supabase.from('expenses').select('id, name').ilike('name', pattern).limit(10),
        supabase.from('documents').select('id, name').ilike('name', pattern).limit(10),
        supabase.from('timeline_items').select('id, activity').ilike('activity', pattern).limit(10),
        supabase
          .from('outfits')
          .select('id, description, person:people(name), event:events(name)')
          .ilike('description', pattern)
          .limit(10),
        supabase.from('decor_items').select('id, name').ilike('name', pattern).limit(10),
      ])

      const results: SearchResult[] = []
      tasks.data?.forEach((t) => results.push({ id: t.id, type: 'Task', label: t.name, linkTo: '/planning' }))
      decisions.data?.forEach((d) =>
        results.push({ id: d.id, type: 'Decision', label: d.question, linkTo: '/planning' }),
      )
      challenges.data?.forEach((c) =>
        results.push({ id: c.id, type: 'Challenge', label: c.title, linkTo: '/planning' }),
      )
      people.data?.forEach((p) => results.push({ id: p.id, type: 'Person', label: p.name, linkTo: '/people' }))
      vendors.data?.forEach((v) => results.push({ id: v.id, type: 'Vendor', label: v.name, linkTo: '/more' }))
      things.data?.forEach((t) =>
        results.push({ id: t.id, type: 'Thing to Take', label: t.item_name, linkTo: '/planning' }),
      )
      events.data?.forEach((e) =>
        results.push({ id: e.id, type: 'Event', label: e.name, linkTo: `/events/${e.id}` }),
      )
      accommodation.data?.forEach((a) =>
        results.push({ id: a.id, type: 'Accommodation', label: a.name, linkTo: '/people' }),
      )
      transportation.data?.forEach((t) =>
        results.push({
          id: t.id,
          type: 'Transportation',
          label: t.group_label || [t.pickup_location, t.destination].filter(Boolean).join(' → ') || 'Transport',
          linkTo: '/people',
        }),
      )
      menuItems.data?.forEach((m) =>
        results.push({ id: m.id, type: 'Menu', label: m.item_name, linkTo: '/more' }),
      )
      expenses.data?.forEach((e) => results.push({ id: e.id, type: 'Finance', label: e.name, linkTo: '/more' }))
      documents.data?.forEach((d) =>
        results.push({ id: d.id, type: 'Document', label: d.name, linkTo: '/more' }),
      )
      timelineItems.data?.forEach((t) =>
        results.push({ id: t.id, type: 'Timeline', label: t.activity, linkTo: '/events' }),
      )
      ;(outfits.data as unknown as { id: string; description: string; person: { name: string }; event: { name: string } }[])?.forEach(
        (o) =>
          results.push({
            id: o.id,
            type: 'Outfit',
            label: `${o.description} — ${o.person.name}, ${o.event.name}`,
            linkTo: '/people',
          }),
      )
      decor.data?.forEach((d) => results.push({ id: d.id, type: 'Decor', label: d.name, linkTo: '/events' }))

      return results
    },
  })
}
