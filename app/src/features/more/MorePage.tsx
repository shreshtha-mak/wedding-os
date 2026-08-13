import { Tabs } from '@mantine/core'
import { VendorsPanel } from '../vendors/VendorsPanel'
import { BudgetPanel } from '../budget/BudgetPanel'
import { MenusPanel } from '../menus/MenusPanel'

export function MorePage() {
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
