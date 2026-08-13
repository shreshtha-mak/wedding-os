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
import { useBudgetCategories } from '../../lib/queries'
import { useCreateVendor } from './api'
import type { VendorStatus } from '../../types/database'

export function AddVendorModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { person } = useAuth()
  const { data: categories } = useBudgetCategories()
  const createVendor = useCreateVendor()

  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [showMore, setShowMore] = useState(false)
  const [contactPerson, setContactPerson] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [status, setStatus] = useState<VendorStatus>('Prospect')
  const [notes, setNotes] = useState('')

  function reset() {
    setName('')
    setCategoryId(null)
    setShowMore(false)
    setContactPerson('')
    setPhone('')
    setWhatsapp('')
    setEmail('')
    setAddress('')
    setStatus('Prospect')
    setNotes('')
  }

  async function handleSubmit() {
    if (!name.trim() || !person) return
    await createVendor.mutateAsync({
      wedding_id: person.wedding_id,
      name: name.trim(),
      category_id: categoryId,
      contact_person: contactPerson.trim() || null,
      phone: phone.trim() || null,
      whatsapp: whatsapp.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      status,
      notes: notes.trim() || null,
    })
    reset()
    onClose()
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add vendor" centered>
      <Stack gap="sm">
        <TextInput
          label="Name"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Select
          label="Category"
          placeholder="e.g. Decorator, Caterer"
          clearable
          searchable
          data={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
          value={categoryId}
          onChange={setCategoryId}
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
              label="Contact person"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.currentTarget.value)}
            />
            <TextInput label="Phone" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />
            <TextInput label="WhatsApp" value={whatsapp} onChange={(e) => setWhatsapp(e.currentTarget.value)} />
            <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
            <TextInput label="Address" value={address} onChange={(e) => setAddress(e.currentTarget.value)} />
            <Select
              label="Status"
              data={['Prospect', 'Shortlisted', 'Confirmed', 'Completed', 'Cancelled']}
              value={status}
              onChange={(v) => setStatus((v as VendorStatus) ?? 'Prospect')}
              allowDeselect={false}
            />
            <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} autosize minRows={2} />
          </Stack>
        </Collapse>

        <Button onClick={handleSubmit} loading={createVendor.isPending} disabled={!name.trim()} fullWidth mt="xs">
          Add vendor
        </Button>
      </Stack>
    </Modal>
  )
}
