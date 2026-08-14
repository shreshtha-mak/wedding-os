import { useState } from 'react'
import {
  ActionIcon,
  Badge,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { IconExternalLink, IconFile, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { QuickAddButton } from '../../components/layout/QuickAddButton'
import { useDocuments, useDeleteDocument, getDocumentSignedUrl, isGoogleDriveUrl } from './api'
import { UploadDocumentModal } from './UploadDocumentModal'
import type { DocumentWithRelations } from './api'

function formatSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function sourceLabel(doc: DocumentWithRelations): string {
  if (doc.storage_type === 'upload') return 'Uploaded file'
  return isGoogleDriveUrl(doc.external_url ?? '') ? 'Google Drive' : 'External link'
}

function DocumentRow({ doc }: { doc: DocumentWithRelations }) {
  const deleteDocument = useDeleteDocument()
  const [opening, setOpening] = useState(false)

  const tags = [doc.event?.name, doc.vendor?.name, doc.expense?.name, doc.guest?.person.name].filter(Boolean)

  async function handleOpen() {
    if (doc.storage_type === 'external') {
      if (doc.external_url) window.open(doc.external_url, '_blank', 'noopener,noreferrer')
      return
    }
    if (!doc.storage_path) return
    setOpening(true)
    try {
      const url = await getDocumentSignedUrl(doc.storage_path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      // signed URL failed — nothing to open, silently ignore
    } finally {
      setOpening(false)
    }
  }

  function handleDelete() {
    if (window.confirm(`Delete "${doc.name}"? This can't be undone.`)) {
      deleteDocument.mutate({ id: doc.id, storagePath: doc.storage_path })
    }
  }

  return (
    <Group
      justify="space-between"
      wrap="nowrap"
      py="xs"
      style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}
    >
      <UnstyledButton onClick={handleOpen} style={{ flex: 1, minWidth: 0 }}>
        <Group gap="xs" wrap="nowrap">
          {doc.storage_type === 'external' ? (
            <IconExternalLink size={20} style={{ flexShrink: 0 }} />
          ) : (
            <IconFile size={20} style={{ flexShrink: 0 }} />
          )}
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text size="sm" fw={500} truncate>
              {doc.name} {opening && '…'}
            </Text>
            <Group gap={6} wrap="wrap">
              <Text size="xs" c="dimmed">
                {dayjs(doc.created_at).format('DD MMM YYYY')} · {sourceLabel(doc)}
                {doc.file_size ? ` · ${formatSize(doc.file_size)}` : ''}
              </Text>
              {tags.map((tag) => (
                <Badge key={tag} size="xs" color="gray" variant="light">
                  {tag}
                </Badge>
              ))}
            </Group>
          </Stack>
        </Group>
      </UnstyledButton>
      <ActionIcon variant="subtle" color="red" onClick={handleDelete} aria-label={`Delete ${doc.name}`}>
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  )
}

export function DocumentsPanel() {
  const { data: documents, isLoading, isError } = useDocuments()
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Documents</Title>

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load documents. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && documents?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No documents uploaded yet.</Text>
        </Center>
      )}

      {documents?.map((doc) => <DocumentRow key={doc.id} doc={doc} />)}

      <QuickAddButton onClick={() => setUploadOpen(true)} label="Add document" />

      <UploadDocumentModal opened={uploadOpen} onClose={() => setUploadOpen(false)} />
    </Stack>
  )
}
