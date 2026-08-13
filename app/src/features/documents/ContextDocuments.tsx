import { useState } from 'react'
import { ActionIcon, Center, Group, Loader, Stack, Text, Title, UnstyledButton } from '@mantine/core'
import { IconFile, IconPlus } from '@tabler/icons-react'
import { useDocumentsFor, getDocumentSignedUrl } from './api'
import type { ContextFilter } from './api'
import { UploadDocumentModal } from './UploadDocumentModal'

type Props = ContextFilter

function DocRow({ id, name, storagePath }: { id: string; name: string; storagePath: string }) {
  const [opening, setOpening] = useState(false)

  async function handleOpen() {
    setOpening(true)
    try {
      const url = await getDocumentSignedUrl(storagePath)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      // signed URL failed — nothing to open, silently ignore
    } finally {
      setOpening(false)
    }
  }

  return (
    <UnstyledButton key={id} onClick={handleOpen}>
      <Group gap={6} wrap="nowrap">
        <IconFile size={16} />
        <Text size="sm">
          {name} {opening && '…'}
        </Text>
      </Group>
    </UnstyledButton>
  )
}

// Compact "Documents" section reused across Event/Vendor/Expense/Guest
// detail views — same underlying documents table and Upload flow as the
// standalone Documents tab, just pre-filtered and pre-filled to whichever
// record it's embedded in (spec: "Documents can be accessed from Event
// Detail, Vendor Detail, Expense Detail, Guest Detail").
export function ContextDocuments(props: Props) {
  const { data: documents, isLoading, isError } = useDocumentsFor(props)
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Title order={4}>Documents</Title>
        <ActionIcon variant="subtle" onClick={() => setUploadOpen(true)} aria-label="Upload document">
          <IconPlus size={18} />
        </ActionIcon>
      </Group>
      {isLoading && (
        <Center py="xs">
          <Loader size="sm" />
        </Center>
      )}
      {isError && (
        <Text size="sm" c="red">
          Couldn't load documents.
        </Text>
      )}
      {!isLoading && !isError && documents?.length === 0 && (
        <Text size="sm" c="dimmed">
          No documents yet.
        </Text>
      )}
      {documents?.map((d) => <DocRow key={d.id} id={d.id} name={d.name} storagePath={d.storage_path} />)}
      <UploadDocumentModal
        opened={uploadOpen}
        onClose={() => setUploadOpen(false)}
        defaultEventId={props.eventId}
        defaultVendorId={props.vendorId}
        defaultExpenseId={props.expenseId}
        defaultGuestId={props.guestId}
      />
    </Stack>
  )
}
