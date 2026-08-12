import { useState } from 'react'
import {
  Button,
  Collapse,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import { useCreatePerson, useRoles } from './api'
import type { RoleId } from '../../types/database'

export function AddPersonModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { person: currentPerson } = useAuth()
  const { data: roles } = useRoles()
  const createPerson = useCreatePerson()

  const [name, setName] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [relationship, setRelationship] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState<RoleId | null>(null)
  const [notes, setNotes] = useState('')

  function reset() {
    setName('')
    setShowMore(false)
    setRelationship('')
    setPhone('')
    setEmail('')
    setRoleId(null)
    setNotes('')
  }

  async function handleSubmit() {
    if (!name.trim() || !currentPerson) return
    await createPerson.mutateAsync({
      wedding_id: currentPerson.wedding_id,
      name: name.trim(),
      relationship: relationship.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      role_id: roleId,
      notes: notes.trim() || null,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add person" centered>
      <Stack gap="sm">
        <TextInput
          label="Name"
          placeholder="e.g. Nishtha"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Select
          label="Role"
          placeholder="No app access yet"
          clearable
          data={roles?.map((r) => ({ value: r.id, label: r.label })) ?? []}
          value={roleId}
          onChange={(v) => setRoleId(v as RoleId | null)}
          description="Only relevant once you link a login for them"
        />

        <UnstyledButton
          onClick={() => setShowMore((v) => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Text size="sm" c="dimmed">
            More details
          </Text>
          {showMore ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </UnstyledButton>

        <Collapse expanded={showMore}>
          <Stack gap="sm">
            <TextInput
              label="Relationship"
              placeholder="e.g. Sister of the bride"
              value={relationship}
              onChange={(e) => setRelationship(e.currentTarget.value)}
            />
            <TextInput
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.currentTarget.value)}
            />
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
            <Textarea
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
              autosize
              minRows={2}
            />
          </Stack>
        </Collapse>

        <Button
          onClick={handleSubmit}
          loading={createPerson.isPending}
          disabled={!name.trim()}
          fullWidth
          mt="xs"
        >
          Add person
        </Button>
      </Stack>
    </Modal>
  )
}
