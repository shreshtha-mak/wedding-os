import { useState } from 'react'
import { Alert, Button, Modal, Stack, Text, TextInput } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { useLinkUserAccount } from './api'
import type { PersonWithAccount } from './api'

export function LinkAccountModal({
  person,
  onClose,
}: {
  person: PersonWithAccount | null
  onClose: () => void
}) {
  const linkAccount = useLinkUserAccount()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setEmail('')
    setError(null)
    onClose()
  }

  async function handleSubmit() {
    if (!person || !email.trim()) return
    setError(null)
    try {
      await linkAccount.mutateAsync({ personId: person.id, email: email.trim(), personName: person.name })
      handleClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not link that account.')
    }
  }

  return (
    <Modal opened={!!person} onClose={handleClose} title={`Link login for ${person?.name ?? ''}`} centered>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          First create their login in the Supabase dashboard (Authentication → Users → Add user),
          then enter the same email here to link it to {person?.name}.
        </Text>
        <TextInput
          label="Login email"
          type="email"
          placeholder="them@example.com"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}
        <Button onClick={handleSubmit} loading={linkAccount.isPending} disabled={!email.trim()} fullWidth mt="xs">
          Link account
        </Button>
      </Stack>
    </Modal>
  )
}
