import { useState } from 'react'
import {
  ActionIcon,
  Affix,
  Badge,
  Card,
  Center,
  Divider,
  Group,
  Loader,
  Select,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useVendors, useUpdateChecklistStatus } from './api'
import type { AssignmentWithChecklist, VendorWithAssignments } from './api'
import { AddVendorModal } from './AddVendorModal'
import { AddAssignmentModal } from './AddAssignmentModal'
import { AddChecklistItemModal } from './AddChecklistItemModal'
import { ContextDocuments } from '../documents/ContextDocuments'
import type { ChecklistItemStatus } from '../../types/database'

const CHECKLIST_STATUSES: ChecklistItemStatus[] = ['Not Started', 'In Progress', 'Done']

function statusColor(status: string): string {
  switch (status) {
    case 'Confirmed':
    case 'Done':
    case 'Completed':
      return 'green'
    case 'In Progress':
      return 'yellow'
    case 'Cancelled':
      return 'gray'
    default:
      return 'blue'
  }
}

function AssignmentBlock({ assignment }: { assignment: AssignmentWithChecklist }) {
  const updateChecklist = useUpdateChecklistStatus()
  const [addChecklistOpen, setAddChecklistOpen] = useState(false)

  return (
    <Stack gap={4} pl="sm" py={4} style={{ borderLeft: '2px solid var(--mantine-color-default-border)' }}>
      <Group justify="space-between" wrap="nowrap">
        <Text size="sm" fw={500}>
          {assignment.event.name}
          {assignment.responsibility && (
            <Text span size="xs" c="dimmed">
              {' '}
              — {assignment.responsibility}
            </Text>
          )}
        </Text>
        <Badge size="xs" color={statusColor(assignment.status)} variant="light">
          {assignment.status}
        </Badge>
      </Group>
      {assignment.checklist.map((item) => (
        <Group key={item.id} justify="space-between" wrap="nowrap" pl="sm">
          <Text size="xs" c={item.status === 'Done' ? 'dimmed' : undefined}>
            {item.item_name}
          </Text>
          <Select
            size="xs"
            w={110}
            data={CHECKLIST_STATUSES}
            value={item.status}
            allowDeselect={false}
            onChange={(v) => v && updateChecklist.mutate({ id: item.id, status: v as ChecklistItemStatus })}
          />
        </Group>
      ))}
      <UnstyledButton onClick={() => setAddChecklistOpen(true)} pl="sm">
        <Text size="xs" c="blue">
          + Checklist item
        </Text>
      </UnstyledButton>
      <AddChecklistItemModal
        assignmentId={assignment.id}
        opened={addChecklistOpen}
        onClose={() => setAddChecklistOpen(false)}
      />
    </Stack>
  )
}

function VendorCard({ vendor }: { vendor: VendorWithAssignments }) {
  const [addAssignmentOpen, setAddAssignmentOpen] = useState(false)

  return (
    <Card withBorder radius="md" p="md">
      <Group justify="space-between">
        <div>
          <Text fw={600}>{vendor.name}</Text>
          <Group gap={6}>
            {vendor.category && (
              <Text size="xs" c="dimmed">
                {vendor.category.name}
              </Text>
            )}
            <Badge size="xs" color={statusColor(vendor.status)} variant="light">
              {vendor.status}
            </Badge>
          </Group>
          {(vendor.contact_person || vendor.phone) && (
            <Text size="xs" c="dimmed" mt={2}>
              {[vendor.contact_person, vendor.phone].filter(Boolean).join(' · ')}
            </Text>
          )}
        </div>
        <UnstyledButton onClick={() => setAddAssignmentOpen(true)}>
          <Text size="xs" c="blue">
            + Event
          </Text>
        </UnstyledButton>
      </Group>
      <Stack gap={6} mt="sm">
        {vendor.assignments.map((a) => (
          <AssignmentBlock key={a.id} assignment={a} />
        ))}
        {vendor.assignments.length === 0 && (
          <Text size="xs" c="dimmed">
            Not assigned to any event yet.
          </Text>
        )}
      </Stack>
      <Divider my="sm" />
      <ContextDocuments vendorId={vendor.id} />
      <AddAssignmentModal vendorId={vendor.id} opened={addAssignmentOpen} onClose={() => setAddAssignmentOpen(false)} />
    </Card>
  )
}

export function VendorsPanel() {
  const { data: vendors, isLoading, isError } = useVendors()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <Stack p="md" pb={96} gap="md">
      <Title order={3}>Vendors</Title>

      {isLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {isError && (
        <Text c="red" ta="center" py="xl">
          Couldn't load vendors. Check your connection and try again.
        </Text>
      )}

      {!isLoading && !isError && vendors?.length === 0 && (
        <Center py="xl">
          <Text c="dimmed">No vendors added yet.</Text>
        </Center>
      )}

      {vendors?.map((v) => <VendorCard key={v.id} vendor={v} />)}

      <Affix position={{ bottom: 24, right: 24 }}>
        <ActionIcon size={56} radius="xl" onClick={() => setAddOpen(true)} aria-label="Add vendor">
          <IconPlus size={26} />
        </ActionIcon>
      </Affix>

      <AddVendorModal opened={addOpen} onClose={() => setAddOpen(false)} />
    </Stack>
  )
}
