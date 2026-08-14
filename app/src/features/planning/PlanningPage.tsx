import { Tabs } from '@mantine/core'
import { useSearchParams } from 'react-router-dom'
import { TasksPage } from '../tasks/TasksPage'
import { DecisionsPanel } from '../decisions/DecisionsPanel'
import { ChallengesPanel } from '../challenges/ChallengesPanel'
import { ThingsPanel } from '../things/ThingsPanel'
import { CalendarPanel } from '../calendar/CalendarPanel'

const TAB_VALUES = ['tasks', 'decisions', 'challenges', 'things', 'calendar']

export function PlanningPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = tabParam && TAB_VALUES.includes(tabParam) ? tabParam : 'tasks'

  return (
    <Tabs
      value={activeTab}
      onChange={(v) => v && setSearchParams(v === 'tasks' ? {} : { tab: v })}
      keepMounted={false}
    >
      <Tabs.List grow>
        <Tabs.Tab value="tasks">Tasks</Tabs.Tab>
        <Tabs.Tab value="decisions">Decisions</Tabs.Tab>
        <Tabs.Tab value="challenges">Challenges</Tabs.Tab>
        <Tabs.Tab value="things">Things</Tabs.Tab>
        <Tabs.Tab value="calendar">Calendar</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="tasks">
        <TasksPage />
      </Tabs.Panel>
      <Tabs.Panel value="decisions">
        <DecisionsPanel />
      </Tabs.Panel>
      <Tabs.Panel value="challenges">
        <ChallengesPanel />
      </Tabs.Panel>
      <Tabs.Panel value="things">
        <ThingsPanel />
      </Tabs.Panel>
      <Tabs.Panel value="calendar">
        <CalendarPanel />
      </Tabs.Panel>
    </Tabs>
  )
}
