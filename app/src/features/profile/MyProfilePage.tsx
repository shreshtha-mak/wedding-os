import { useState } from 'react'
import { ActionIcon, Avatar, Badge, Button, Group, Stack, Text, TextInput, Title } from '@mantine/core'
import { IconArrowLeft } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useUpdateMyProfile } from './api'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  organiser: 'Organiser',
  restricted: 'Restricted',
}

export function MyProfilePage() {
  const navigate = useNavigate()
  const { person, refreshPerson, signOut } = useAuth()
  const updateProfile = useUpdateMyProfile()

  const [name, setName] = useState(person?.name ?? '')
  const [phone, setPhone] = useState(person?.phone ?? '')
  const [saved, setSaved] = useState(false)

  if (!person) return null

  const initials = person.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleSave() {
    if (!name.trim()) return
    setSaved(false)
    await updateProfile.mutateAsync({ name: name.trim(), phone: phone.trim() || null })
    await refreshPerson()
    setSaved(true)
  }

  return (
    <Stack p="md" pb={96} gap="md">
      <Group gap="xs">
        <ActionIcon variant="subtle" onClick={() => navigate(-1)} aria-label="Back">
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={3}>My Profile</Title>
      </Group>

      <Group>
        <Avatar radius="xl" size={56} color="rose">
          {initials}
        </Avatar>
        <div>
          <Text fw={600}>{person.name}</Text>
          {person.role_id && (
            <Badge size="xs" variant="light">
              {ROLE_LABEL[person.role_id]}
            </Badge>
          )}
        </div>
      </Group>

      <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
      <TextInput label="Phone" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />

      {person.email && (
        <TextInput label="Login email" value={person.email} disabled description="Contact an admin to change your login email." />
      )}
      {person.relationship && <TextInput label="Relationship" value={person.relationship} disabled />}

      <Button onClick={handleSave} loading={updateProfile.isPending} disabled={!name.trim()}>
        Save
      </Button>
      {saved && (
        <Text size="sm" c="green">
          Saved.
        </Text>
      )}

      <Button variant="subtle" color="red" onClick={() => signOut()} mt="md">
        Sign out
      </Button>
    </Stack>
  )
}
