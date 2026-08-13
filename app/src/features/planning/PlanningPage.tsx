import { Tabs } from '@mantine/core'
import { TasksPage } from '../tasks/TasksPage'
import { DecisionsPanel } from '../decisions/DecisionsPanel'
import { ChallengesPanel } from '../challenges/ChallengesPanel'
import { ThingsPanel } from '../things/ThingsPanel'
import { CalendarPanel } from '../calendar/CalendarPanel'

export function PlanningPage() {
  return (
    <Tabs defaultValue="tasks" keepMounted={false}>
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
