import { Tabs } from '@mantine/core'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useEvents } from '../../lib/queries'
import { PeoplePage } from './PeoplePage'
import { GuestsPanel } from '../guests/GuestsPanel'
import { OutfitsPanel } from '../outfits/OutfitsPanel'
import { AccommodationPanel } from '../accommodation/AccommodationPanel'
import { TransportationPanel } from '../transportation/TransportationPanel'

export function PeopleHubPage() {
  const { person } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: events } = useEvents()

  // Guests/Accommodation/Transportation all carry more personal/logistics
  // data than the rest of the hub and aren't in the restricted-user
  // "should see" list in the spec — hide the tabs entirely rather than
  // showing an always-empty list (RLS would filter every row out anyway,
  // which reads as a bug, not a boundary). Outfits IS in that list (it's
  // explicitly Rishwa's responsibility per the spec), so that tab stays
  // visible to everyone — RLS scopes it to relevant rows on its own.
  const canSeeLogistics = person?.role_id === 'admin' || person?.role_id === 'organiser'

  // Deep-linked from an Event page's "View guest list" (?tab=guests&event=…)
  // so the Guests tab can open pre-scoped to that event without a separate
  // per-event guest list screen.
  const tabParam = searchParams.get('tab')
  const eventParam = searchParams.get('event')
  const scopedEvent = eventParam ? events?.find((e) => e.id === eventParam) : undefined
  const activeTab = tabParam && (canSeeLogistics || tabParam !== 'guests') ? tabParam : 'family'

  return (
    <Tabs
      value={activeTab}
      onChange={(v) => v && setSearchParams(v === 'family' ? {} : { tab: v })}
      keepMounted={false}
    >
      <Tabs.List grow>
        <Tabs.Tab value="family">Family</Tabs.Tab>
        {canSeeLogistics && <Tabs.Tab value="guests">Guests</Tabs.Tab>}
        <Tabs.Tab value="outfits">Outfits</Tabs.Tab>
        {canSeeLogistics && <Tabs.Tab value="accommodation">Stay</Tabs.Tab>}
        {canSeeLogistics && <Tabs.Tab value="transportation">Transport</Tabs.Tab>}
      </Tabs.List>

      <Tabs.Panel value="family">
        <PeoplePage />
      </Tabs.Panel>
      {canSeeLogistics && (
        <Tabs.Panel value="guests">
          <GuestsPanel
            scopedEventId={scopedEvent?.id}
            scopedEventName={scopedEvent?.name}
            onExitScope={scopedEvent ? () => navigate(`/events/${scopedEvent.id}`) : undefined}
          />
        </Tabs.Panel>
      )}
      <Tabs.Panel value="outfits">
        <OutfitsPanel />
      </Tabs.Panel>
      {canSeeLogistics && (
        <Tabs.Panel value="accommodation">
          <AccommodationPanel />
        </Tabs.Panel>
      )}
      {canSeeLogistics && (
        <Tabs.Panel value="transportation">
          <TransportationPanel />
        </Tabs.Panel>
      )}
    </Tabs>
  )
}
