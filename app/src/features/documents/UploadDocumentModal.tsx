import { useState } from 'react'
import {
  Button,
  Collapse,
  FileInput,
  Modal,
  Radio,
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
import { useAddDocument } from './api'

const MAX_SIZE_MB = 10

export function UploadDocumentModal({
  opened,
  onClose,
  defaultEventId,
  defaultVendorId,
  defaultExpenseId,
  defaultGuestId,
}: {
  opened: boolean
  onClose: () => void
  // Preserves context when uploading from inside a specific record's page,
  // instead of making the user re-pick what they're already looking at.
  defaultEventId?: string
  defaultVendorId?: string
  defaultExpenseId?: string
  defaultGuestId?: string
}) {
  const { person } = useAuth()
  const { data: events } = useEvents()
  const { data: vendors } = useVendors()
  const { data: expenses } = useExpenses()
  const { data: guests } = useGuests()
  const addDocument = useAddDocument()

  const hasDefaultContext = !!(defaultEventId || defaultVendorId || defaultExpenseId || defaultGuestId)

  const [storageType, setStorageType] = useState<'upload' | 'external'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [externalUrl, setExternalUrl] = useState('')
  const [name, setName] = useState('')
  const [showMore, setShowMore] = useState(hasDefaultContext)
  const [eventId, setEventId] = useState<string | null>(defaultEventId ?? null)
  const [vendorId, setVendorId] = useState<string | null>(defaultVendorId ?? null)
  const [expenseId, setExpenseId] = useState<string | null>(defaultExpenseId ?? null)
  const [guestId, setGuestId] = useState<string | null>(defaultGuestId ?? null)
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
    setStorageType('upload')
    setFile(null)
    setExternalUrl('')
    setName('')
    setShowMore(hasDefaultContext)
    setEventId(defaultEventId ?? null)
    setVendorId(defaultVendorId ?? null)
    setExpenseId(defaultExpenseId ?? null)
    setGuestId(defaultGuestId ?? null)
    setNotes('')
    setError(null)
  }

  const canSubmit =
    !!name.trim() && (storageType === 'upload' ? !!file : /^https?:\/\/.+/i.test(externalUrl.trim()))

  async function handleSubmit() {
    if (!canSubmit || !person) return
    setError(null)
    const shared = {
      weddingId: person.wedding_id,
      name: name.trim(),
      eventId,
      vendorId,
      expenseId,
      guestId,
      taskId: null,
      notes: notes.trim() || null,
      uploadedBy: person.id,
    }
    try {
      if (storageType === 'upload') {
        if (!file) return
        await addDocument.mutateAsync({ storageType: 'upload', file, ...shared })
      } else {
        await addDocument.mutateAsync({ storageType: 'external', externalUrl: externalUrl.trim(), ...shared })
      }
      reset()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Try again.')
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add document" centered>
      <Stack gap="sm">
        <TextInput
          label="Document name"
          required
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />

        <Radio.Group
          label="Storage"
          value={storageType}
          onChange={(v) => setStorageType(v as 'upload' | 'external')}
        >
          <Stack gap={4} mt={4}>
            <Radio value="upload" label="Upload file" />
            <Radio value="external" label="External link" />
          </Stack>
        </Radio.Group>

        {storageType === 'upload' ? (
          <FileInput
            label="File"
            placeholder="Choose a file (images or PDF, up to 10MB)"
            leftSection={<IconUpload size={16} />}
            required
            value={file}
            onChange={handleFile}
            accept="image/*,.pdf,.doc,.docx"
          />
        ) : (
          <TextInput
            label="External link"
            placeholder="https://drive.google.com/..."
            required
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.currentTarget.value)}
          />
        )}

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

        <Button onClick={handleSubmit} loading={addDocument.isPending} disabled={!canSubmit} fullWidth mt="xs">
          Save
        </Button>
      </Stack>
    </Modal>
  )
}
