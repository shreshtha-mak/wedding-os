import { Stack, Tabs, Text } from '@mantine/core'
import { useAuth } from '../auth/AuthContext'
import { VendorsPanel } from '../vendors/VendorsPanel'
import { BudgetPanel } from '../budget/BudgetPanel'
import { MenusPanel } from '../menus/MenusPanel'

export function MorePage() {
  const { person } = useAuth()
  const canView = person?.role_id === 'admin' || person?.role_id === 'organiser'

  // The bottom-nav "More" tab is already hidden for restricted users, but
  // that alone doesn't stop direct navigation to /more — this is the actual
  // guard. Without it, a restricted user would see live "Add" buttons on
  // Vendors/Budget that fail against RLS the moment they're tapped.
  if (!canView) {
    return (
      <Stack p="md" gap="md">
        <Text c="dimmed">You don't have access to this section.</Text>
      </Stack>
    )
  }

  return (
    <Tabs defaultValue="vendors" keepMounted={false}>
      <Tabs.List grow>
        <Tabs.Tab value="vendors">Vendors</Tabs.Tab>
        <Tabs.Tab value="budget">Budget</Tabs.Tab>
        <Tabs.Tab value="menus">Menus</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="vendors">
        <VendorsPanel />
      </Tabs.Panel>
      <Tabs.Panel value="budget">
        <BudgetPanel />
      </Tabs.Panel>
      <Tabs.Panel value="menus">
        <MenusPanel />
      </Tabs.Panel>
    </Tabs>
  )
}
