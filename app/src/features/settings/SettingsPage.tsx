import { useState } from 'react'
import { ActionIcon, Button, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { IconArrowLeft } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useWedding } from '../../lib/queries'
import { usePeopleAdmin } from '../people/api'
import { useUpdatePersonRole, useUpdateWedding } from './api'
import type { RoleId } from '../../types/database'

const ROLE_OPTIONS: { value: RoleId; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'organiser', label: 'Organiser' },
  { value: 'restricted', label: 'Restricted' },
]

function WeddingSettings() {
  const { data: wedding } = useWedding()
  const updateWedding = useUpdateWedding()

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [loadedId, setLoadedId] = useState<string | null>(null)

  if (wedding && wedding.id !== loadedId) {
    setLoadedId(wedding.id)
    setName(wedding.name)
    setStartDate(wedding.start_date)
    setEndDate(wedding.end_date)
  }

  async function handleSave() {
    if (!wedding || !name.trim()) return
    await updateWedding.mutateAsync({
      id: wedding.id,
      updates: { name: name.trim(), start_date: startDate, end_date: endDate },
    })
  }

  return (
    <Stack gap="sm">
      <Title order={4}>Wedding</Title>
      <TextInput label="Wedding name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
      <Group grow>
        <DateInput label="Start date" value={startDate} onChange={setStartDate} valueFormat="DD MMM YYYY" />
        <DateInput label="End date" value={endDate} onChange={setEndDate} valueFormat="DD MMM YYYY" />
      </Group>
      <Button onClick={handleSave} loading={updateWedding.isPending} disabled={!name.trim()} style={{ alignSelf: 'flex-start' }}>
        Save
      </Button>
    </Stack>
  )
}

function RoleManagement() {
  const { data: people } = usePeopleAdmin()
  const updateRole = useUpdatePersonRole()

  return (
    <Stack gap="sm">
      <Title order={4}>People &amp; roles</Title>
      <Text size="sm" c="dimmed">
        Role controls what someone can access — it's separate from what they're responsible for.
      </Text>
      <Stack gap={6}>
        {people?.map((p) => (
          <Group key={p.id} justify="space-between" wrap="nowrap">
            <div style={{ minWidth: 0 }}>
              <Text size="sm" fw={500} truncate>
                {p.name}
              </Text>
              {!p.has_login && (
                <Text size="xs" c="dimmed">
                  No login
                </Text>
              )}
            </div>
            <Select
              size="xs"
              w={140}
              placeholder="No role"
              clearable
              data={ROLE_OPTIONS}
              value={p.role_id}
              onChange={(v) => updateRole.mutate({ personId: p.id, roleId: v as RoleId | null })}
            />
          </Group>
        ))}
      </Stack>
    </Stack>
  )
}

export function SettingsPage() {
  const navigate = useNavigate()
  const { person } = useAuth()
  const isAdmin = person?.role_id === 'admin'

  if (!isAdmin) {
    return (
      <Stack p="md" gap="md">
        <Text c="dimmed">You don't have access to this section.</Text>
      </Stack>
    )
  }

  return (
    <Stack p="md" pb={96} gap="xl">
      <Group gap="xs">
        <ActionIcon variant="subtle" onClick={() => navigate(-1)} aria-label="Back">
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={3}>Settings</Title>
      </Group>

      <WeddingSettings />
      <RoleManagement />
    </Stack>
  )
}
