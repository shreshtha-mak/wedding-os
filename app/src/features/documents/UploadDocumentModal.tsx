import { useState } from 'react'
import {
  Button,
  Collapse,
  FileInput,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { IconChevronDown, IconChevronUp, IconUpload } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { useEvents } from '../../lib/queries'
import { useVendors } from '../vendors/api'
import { useExpenses } from '../budget/api'
import { useGuests } from '../guests/api'
import { useUploadDocument } from './api'

const MAX_SIZE_MB = 10

export function UploadDocumentModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { person } = useAuth()
  const { data: events } = useEvents()
  const { data: vendors } = useVendors()
  const { data: expenses } = useExpenses()
  const { data: guests } = useGuests()
  const upload = useUploadDocument()

  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [eventId, setEventId] = useState<string | null>(null)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [expenseId, setExpenseId] = useState<string | null>(null)
  const [guestId, setGuestId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleFile(f: File | null) {
    setError(null)
    if (f && f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`That file is too large — max ${MAX_SIZE_MB}MB.`)
      setFile(null)
      return
    }
    setFile(f)
    if (f && !name) setName(f.name.replace(/\.[^.]+$/, ''))
  }

  function reset() {
    setFile(null)
    setName('')
    setShowMore(false)
    setEventId(null)
    setVendorId(null)
    setExpenseId(null)
    setGuestId(null)
    setNotes('')
    setError(null)
  }

  async function handleSubmit() {
    if (!file || !name.trim() || !person) return
    setError(null)
    try {
      await upload.mutateAsync({
        file,
        weddingId: person.wedding_id,
        name: name.trim(),
        eventId,
        vendorId,
        expenseId,
        guestId,
        taskId: null,
        notes: notes.trim() || null,
        uploadedBy: person.id,
      })
      reset()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Try again.')
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Upload document" centered>
      <Stack gap="sm">
        <FileInput
          label="File"
          placeholder="Choose a file (images or PDF, up to 10MB)"
          leftSection={<IconUpload size={16} />}
          required
          value={file}
          onChange={handleFile}
          accept="image/*,.pdf,.doc,.docx"
        />
        <TextInput
          label="Name"
          required
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        {error && (
          <Text c="red" size="sm">
            {error}
          </Text>
        )}

        <UnstyledButton
          onClick={() => setShowMore((v) => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Text size="sm" c="dimmed">
            Attach to
          </Text>
          {showMore ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </UnstyledButton>

        <Collapse expanded={showMore}>
          <Stack gap="sm">
            <Select
              label="Event"
              placeholder="None"
              clearable
              data={events?.map((e) => ({ value: e.id, label: e.name })) ?? []}
              value={eventId}
              onChange={setEventId}
            />
            <Select
              label="Vendor"
              placeholder="None"
              clearable
              searchable
              data={vendors?.map((v) => ({ value: v.id, label: v.name })) ?? []}
              value={vendorId}
              onChange={setVendorId}
            />
            <Select
              label="Expense"
              placeholder="None"
              clearable
              searchable
              data={expenses?.map((e) => ({ value: e.id, label: e.name })) ?? []}
              value={expenseId}
              onChange={setExpenseId}
            />
            <Select
              label="Guest"
              placeholder="None"
              clearable
              searchable
              data={guests?.map((g) => ({ value: g.id, label: g.person.name })) ?? []}
              value={guestId}
              onChange={setGuestId}
            />
            <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} autosize minRows={2} />
          </Stack>
        </Collapse>

        <Button onClick={handleSubmit} loading={upload.isPending} disabled={!file || !name.trim()} fullWidth mt="xs">
          Upload
        </Button>
      </Stack>
    </Modal>
  )
}
