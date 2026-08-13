import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type { Menu, MenuCategory, MenuInsert, MenuItem, MenuItemInsert, MenuStatus } from '../../types/database'

export interface MenuWithItems extends Menu {
  items: (MenuItem & { category: Pick<MenuCategory, 'id' | 'name'> })[]
}

export function useMenuCategories() {
  return useQuery({
    queryKey: ['menu_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')
      if (error) throw error
      return data as MenuCategory[]
    },
  })
}

export function useCreateMenuCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ weddingId, name }: { weddingId: string; name: string }) => {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert({ wedding_id: weddingId, name })
        .select('id')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu_categories'] })
    },
  })
}

export function useMenuForEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['menus', 'event', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menus')
        .select('*, items:menu_items(*, category:menu_categories(id, name))')
        .eq('event_id', eventId as string)
        .maybeSingle()
      if (error) throw error
      return data as unknown as MenuWithItems | null
    },
  })
}

export function useCreateMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (menu: MenuInsert) => {
      const { error } = await supabase.from('menus').insert(menu)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menus', 'event', variables.event_id] })
    },
  })
}

export function useUpdateMenuStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: MenuStatus
      eventId: string
      eventName: string
    }) => {
      const { error } = await supabase.from('menus').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menus', 'event', variables.eventId] })
      if (variables.status === 'Finalised') {
        logActivity('menu', variables.id, 'finalised', `finalised the menu for ${variables.eventName}`)
      }
    },
  })
}

export function useAddMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ item, eventId }: { item: MenuItemInsert; eventId: string }) => {
      const { error } = await supabase.from('menu_items').insert(item)
      if (error) throw error
      return { eventId }
    },
    onSuccess: ({ eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['menus', 'event', eventId] })
    },
  })
}

export function useArchiveMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; eventId: string }) => {
      const { error } = await supabase.from('menu_items').update({ is_active: false }).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menus', 'event', variables.eventId] })
    },
  })
}
