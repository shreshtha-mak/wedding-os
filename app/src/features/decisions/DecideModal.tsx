import { useState } from 'react'
import { Button, Modal, MultiSelect, Select, Stack, Text } from '@mantine/core'
import { usePeople } from '../../lib/queries'
import { useMarkDecided } from './api'
import type { DecisionWithRelations } from './api'

export function DecideModal({
  decision,
  opened,
  onClose,
}: {
  decision: DecisionWithRelations
  opened: boolean
  onClose: () => void
}) {
  const { data: people } = usePeople()
  const markDecided = useMarkDecided()

  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [decidedBy, setDecidedBy] = useState<string[]>([])

  function reset() {
    setSelectedOption(null)
    setDecidedBy([])
  }

  async function handleSubmit() {
    if (!selectedOption) return
    await markDecided.mutateAsync({
      id: decision.id,
      selectedOption,
      decidedByPersonIds: decidedBy,
      question: decision.question,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Mark as decided" centered>
      <Stack gap="sm">
        <Text fw={500}>{decision.question}</Text>
        {decision.options.length > 0 ? (
          <Select
            label="Selected option"
            required
            data={decision.options}
            value={selectedOption}
            onChange={setSelectedOption}
          />
        ) : (
          <Select
            label="Final decision"
            placeholder="Type the decision"
            searchable
            data={selectedOption ? [selectedOption] : []}
            value={selectedOption}
            onChange={setSelectedOption}
            onSearchChange={setSelectedOption}
          />
        )}
        <MultiSelect
          label="Decided by"
          placeholder="Who decided"
          searchable
          clearable
          data={people?.map((p) => ({ value: p.id, label: p.name })) ?? []}
          value={decidedBy}
          onChange={setDecidedBy}
        />
        <Button onClick={handleSubmit} loading={markDecided.isPending} disabled={!selectedOption} fullWidth mt="xs">
          Mark decided
        </Button>
      </Stack>
    </Modal>
  )
}
