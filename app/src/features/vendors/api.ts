import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type {
  BudgetCategory,
  ChecklistItemStatus,
  EventRow,
  Vendor,
  VendorChecklistItem,
  VendorChecklistItemInsert,
  VendorEventAssignment,
  VendorEventAssignmentInsert,
  VendorInsert,
} from '../../types/database'

export interface VendorWithCategory extends Vendor {
  category: Pick<BudgetCategory, 'id' | 'name'> | null
}

export interface AssignmentWithChecklist extends VendorEventAssignment {
  event: Pick<EventRow, 'id' | 'name'>
  checklist: VendorChecklistItem[]
}

export interface VendorWithAssignments extends VendorWithCategory {
  assignments: AssignmentWithChecklist[]
}

const VENDOR_SELECT = `
  *,
  category:budget_categories(id, name),
  assignments:vendor_event_assignments(*, event:events(id, name), checklist:vendor_checklist_items(*))
`

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('vendors').select(VENDOR_SELECT).order('name')
      if (error) throw error
      return data as unknown as VendorWithAssignments[]
    },
  })
}

export function useCreateVendor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vendor: VendorInsert) => {
      const { error } = await supabase.from('vendors').insert(vendor)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      logActivity('vendor', null, 'created', `added vendor "${variables.name}"`)
    },
  })
}

export function useCreateAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (assignment: VendorEventAssignmentInsert) => {
      const { error } = await supabase.from('vendor_event_assignments').insert(assignment)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    },
  })
}

export function useCreateChecklistItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item: VendorChecklistItemInsert) => {
      const { error } = await supabase.from('vendor_checklist_items').insert(item)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    },
  })
}

export function useUpdateChecklistStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ChecklistItemStatus }) => {
      const { error } = await supabase.from('vendor_checklist_items').update({ status }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    },
  })
}
