import { useEffect, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import {
  useAddMenuItem,
  useArchiveMenuItem,
  useCreateMenu,
  useMenuForEvent,
  useUpdateMenuStatus,
} from './api'
import type { MenuItemCategory, MenuStatus } from '../../types/database'

const STATUSES: MenuStatus[] = ['Draft', 'Discussing', 'Finalised']
const CATEGORIES: MenuItemCategory[] = [
  'Welcome drinks', 'Starters', 'Main course', 'Sides', 'Desserts', 'Beverages',
  'Special requirements', 'Other',
]

function statusColor(status: MenuStatus): string {
  switch (status) {
    case 'Finalised':
      return 'green'
    case 'Discussing':
      return 'yellow'
    case 'Draft':
      return 'gray'
  }
}

export function MenuDetailModal({
  eventId,
  eventName,
  opened,
  onClose,
}: {
  eventId: string
  eventName: string
  opened: boolean
  onClose: () => void
}) {
  const { person } = useAuth()
  const { data: menu, isLoading, isError } = useMenuForEvent(opened ? eventId : undefined)
  const createMenu = useCreateMenu()
  const updateStatus = useUpdateMenuStatus()
  const addItem = useAddMenuItem()
  const archiveItem = useArchiveMenuItem()

  const [itemName, setItemName] = useState('')
  const [category, setCategory] = useState<MenuItemCategory>('Main course')
  const [isVegetarian, setIsVegetarian] = useState(false)

  useEffect(() => {
    // isError guards against retrying forever on a failed fetch, and
    // isPending against firing again before the first create resolves —
    // without both, a failed/slow fetch left `menu` at undefined and this
    // re-fired on every render.
    if (opened && !isLoading && !isError && !menu && person && !createMenu.isPending) {
      createMenu.mutate({ wedding_id: person.wedding_id, event_id: eventId })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, isLoading, isError, menu, person])

  async function handleAddItem() {
    if (!itemName.trim() || !menu) return
    await addItem.mutateAsync({
      item: { menu_id: menu.id, item_name: itemName.trim(), category, is_vegetarian: isVegetarian },
      eventId,
    })
    setItemName('')
    setIsVegetarian(false)
  }

  const activeItems = menu?.items.filter((i) => i.is_active) ?? []

  return (
    <Modal opened={opened} onClose={onClose} title={`${eventName} menu`} centered size="lg">
      <Stack gap="sm">
        {isError && (
          <Text c="red" size="sm" ta="center" py="md">
            Couldn't load this menu. Check your connection and try again.
          </Text>
        )}
        {!isError && (isLoading || !menu) && (
          <Center py="md">
            <Loader size="sm" />
          </Center>
        )}
        {menu && (
          <>
            <Group justify="space-between">
              <Badge color={statusColor(menu.status)} variant="light">
                {menu.status === 'Finalised' ? 'FINAL MENU' : menu.status}
              </Badge>
              <Select
                size="xs"
                w={130}
                data={STATUSES}
                value={menu.status}
                allowDeselect={false}
                onChange={(v) =>
                  v &&
                  updateStatus.mutate({ id: menu.id, status: v as MenuStatus, eventId, eventName })
                }
              />
            </Group>

            <Stack gap={4}>
              {activeItems.length === 0 && (
                <Text size="sm" c="dimmed">
                  No items yet.
                </Text>
              )}
              {activeItems.map((item) => (
                <Group key={item.id} justify="space-between" wrap="nowrap">
                  <Group gap={6} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm">{item.item_name}</Text>
                    {item.is_vegetarian && (
                      <Badge size="xs" color="green" variant="outline">
                        Veg
                      </Badge>
                    )}
                    <Text size="xs" c="dimmed">
                      {item.category}
                    </Text>
                  </Group>
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => archiveItem.mutate({ id: item.id, eventId })}
                    aria-label="Remove item"
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Group>
              ))}
            </Stack>

            <Group gap="xs" align="flex-end">
              <TextInput
                label="Add item"
                placeholder="e.g. Paneer tikka"
                style={{ flex: 1 }}
                value={itemName}
                onChange={(e) => setItemName(e.currentTarget.value)}
              />
              <Select
                w={140}
                data={CATEGORIES}
                value={category}
                onChange={(v) => setCategory((v as MenuItemCategory) ?? 'Other')}
                allowDeselect={false}
              />
            </Group>
            <Switch
              label="Vegetarian"
              checked={isVegetarian}
              onChange={(e) => setIsVegetarian(e.currentTarget.checked)}
            />
            <Button onClick={handleAddItem} loading={addItem.isPending} disabled={!itemName.trim()}>
              Add item
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  )
}
