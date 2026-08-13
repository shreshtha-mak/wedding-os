import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { logActivity } from '../activity/api'
import type { EventRow, Expense, Task, Vendor, WeddingDocument } from '../../types/database'

export interface DocumentWithRelations extends WeddingDocument {
  event: Pick<EventRow, 'id' | 'name'> | null
  vendor: Pick<Vendor, 'id' | 'name'> | null
  expense: Pick<Expense, 'id' | 'name'> | null
  guest: { id: string; person: { name: string } } | null
  task: Pick<Task, 'id' | 'name'> | null
}

const DOCUMENT_SELECT = `
  *,
  event:events(id, name),
  vendor:vendors(id, name),
  expense:expenses(id, name),
  guest:guests(id, person:people(name)),
  task:tasks(id, name)
`

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(DOCUMENT_SELECT)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as DocumentWithRelations[]
    },
  })
}

export type ContextFilter =
  | { eventId: string; vendorId?: never; expenseId?: never; guestId?: never }
  | { vendorId: string; eventId?: never; expenseId?: never; guestId?: never }
  | { expenseId: string; eventId?: never; vendorId?: never; guestId?: never }
  | { guestId: string; eventId?: never; vendorId?: never; expenseId?: never }

export function useDocumentsFor(filter: ContextFilter) {
  const [column, value] = filter.eventId
    ? ['event_id', filter.eventId]
    : filter.vendorId
      ? ['vendor_id', filter.vendorId]
      : filter.expenseId
        ? ['expense_id', filter.expenseId]
        : ['guest_id', filter.guestId as string]

  return useQuery({
    queryKey: ['documents', column, value],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(DOCUMENT_SELECT)
        .eq(column, value)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as DocumentWithRelations[]
    },
  })
}

interface UploadDocumentInput {
  file: File
  weddingId: string
  name: string
  eventId: string | null
  vendorId: string | null
  expenseId: string | null
  guestId: string | null
  taskId: string | null
  notes: string | null
  uploadedBy: string
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UploadDocumentInput) => {
      const safeName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `${input.weddingId}/${crypto.randomUUID()}-${safeName}`

      const { error: uploadError } = await supabase.storage.from('documents').upload(storagePath, input.file)
      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('documents').insert({
        wedding_id: input.weddingId,
        name: input.name,
        storage_path: storagePath,
        file_type: input.file.type || null,
        file_size: input.file.size,
        event_id: input.eventId,
        vendor_id: input.vendorId,
        expense_id: input.expenseId,
        guest_id: input.guestId,
        task_id: input.taskId,
        uploaded_by: input.uploadedBy,
        notes: input.notes,
      })
      if (insertError) {
        // Don't leave an orphaned file in storage if the metadata insert fails.
        await supabase.storage.from('documents').remove([storagePath])
        throw insertError
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      logActivity('document', null, 'uploaded', `uploaded "${variables.name}"`)
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      const { error: storageError } = await supabase.storage.from('documents').remove([storagePath])
      if (storageError) throw storageError
      const { error: dbError } = await supabase.from('documents').delete().eq('id', id)
      if (dbError) throw dbError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

// Bucket is private — every view/download goes through a short-lived signed
// URL generated on demand, never a permanent public link.
export async function getDocumentSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(storagePath, 60)
  if (error) throw error
  return data.signedUrl
}
