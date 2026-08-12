import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { EventRow, Person, TaskCategory, Wedding } from '../types/database'

export function useWedding() {
  return useQuery({
    queryKey: ['wedding'],
    queryFn: async () => {
      const { data, error } = await supabase.from('weddings').select('*').single()
      if (error) throw error
      return data as Wedding
    },
  })
}

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('people')
        .select('*')
        .eq('active', true)
        .order('name')
      if (error) throw error
      return data as Person[]
    },
  })
}

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').order('event_date')
      if (error) throw error
      return data as EventRow[]
    },
  })
}

export function useTaskCategories() {
  return useQuery({
    queryKey: ['task_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')
      if (error) throw error
      return data as TaskCategory[]
    },
  })
}
