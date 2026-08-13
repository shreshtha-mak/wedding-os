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
  UnstyledButton,
} from '@mantine/core'
import { IconPlus, IconX } from '@tabler/icons-react'
import { useAuth } from '../auth/AuthContext'
import {
  useAddMenuItem,
  useArchiveMenuItem,
  useCreateMenu,
  useCreateMenuCategory,
  useMenuCategories,
  useMenuForEvent,
  useUpdateMenuStatus,
} from './api'
import type { MenuStatus } from '../../types/database'

const STATUSES: MenuStatus[] = ['Draft', 'Discussing', 'Finalised']

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
  const { data: categories } = useMenuCategories()
  const createMenu = useCreateMenu()
  const createCategory = useCreateMenuCategory()
  const updateStatus = useUpdateMenuStatus()
  const addItem = useAddMenuItem()
  const archiveItem = useArchiveMenuItem()

  const [itemName, setItemName] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [isVegetarian, setIsVegetarian] = useState(false)
  const [addingCategory, setAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    if (!categoryId && categories && categories.length > 0) {
      setCategoryId(categories.find((c) => c.name === 'Main course')?.id ?? categories[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

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

  async function handleAddCategory() {
    if (!newCategoryName.trim() || !person) return
    const created = await createCategory.mutateAsync({ weddingId: person.wedding_id, name: newCategoryName.trim() })
    setCategoryId(created.id)
    setNewCategoryName('')
    setAddingCategory(false)
  }

  async function handleAddItem() {
    if (!itemName.trim() || !menu || !categoryId) return
    await addItem.mutateAsync({
      item: { menu_id: menu.id, item_name: itemName.trim(), category_id: categoryId, is_vegetarian: isVegetarian },
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
                      {item.category.name}
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
                data={categories?.map((c) => ({ value: c.id, label: c.name })) ?? []}
                value={categoryId}
                onChange={setCategoryId}
                allowDeselect={false}
              />
            </Group>

            {addingCategory ? (
              <Group gap="xs" align="flex-end">
                <TextInput
                  label="New category"
                  placeholder="e.g. Live counter"
                  style={{ flex: 1 }}
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.currentTarget.value)}
                />
                <Button size="sm" onClick={handleAddCategory} loading={createCategory.isPending} disabled={!newCategoryName.trim()}>
                  Add
                </Button>
              </Group>
            ) : (
              <UnstyledButton onClick={() => setAddingCategory(true)} style={{ alignSelf: 'flex-start' }}>
                <Group gap={4}>
                  <IconPlus size={14} />
                  <Text size="xs" c="dimmed">
                    New category
                  </Text>
                </Group>
              </UnstyledButton>
            )}

            <Switch
              label="Vegetarian"
              checked={isVegetarian}
              onChange={(e) => setIsVegetarian(e.currentTarget.checked)}
            />
            <Button onClick={handleAddItem} loading={addItem.isPending} disabled={!itemName.trim() || !categoryId}>
              Add item
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  )
}
