import { useState } from 'react'
import { Button, Modal, Select, Stack, Text, Textarea } from '@mantine/core'
import { useUpdateChallengeStatus } from './api'
import type { ChallengeWithRelations } from './api'
import type { ChallengeStatus } from '../../types/database'

const STATUSES: ChallengeStatus[] = ['Open', 'Being Resolved', 'Resolved']

export function UpdateChallengeModal({
  challenge,
  opened,
  onClose,
}: {
  challenge: ChallengeWithRelations
  opened: boolean
  onClose: () => void
}) {
  const updateStatus = useUpdateChallengeStatus()
  const [status, setStatus] = useState<ChallengeStatus>(challenge.status)
  const [resolution, setResolution] = useState(challenge.resolution ?? '')

  async function handleSubmit() {
    await updateStatus.mutateAsync({
      id: challenge.id,
      status,
      resolution: status === 'Resolved' ? resolution.trim() || null : null,
      title: challenge.title,
    })
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Update challenge" centered>
      <Stack gap="sm">
        <Text fw={500}>{challenge.title}</Text>
        <Select
          label="Status"
          data={STATUSES}
          value={status}
          onChange={(v) => setStatus((v as ChallengeStatus) ?? challenge.status)}
          allowDeselect={false}
        />
        {status === 'Resolved' && (
          <Textarea
            label="Resolution"
            placeholder="What fixed it?"
            value={resolution}
            onChange={(e) => setResolution(e.currentTarget.value)}
            autosize
            minRows={2}
          />
        )}
        <Button onClick={handleSubmit} loading={updateStatus.isPending} fullWidth mt="xs">
          Save
        </Button>
      </Stack>
    </Modal>
  )
}
