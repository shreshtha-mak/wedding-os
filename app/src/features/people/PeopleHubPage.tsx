import { Tabs } from '@mantine/core'
import { useAuth } from '../auth/AuthContext'
import { PeoplePage } from './PeoplePage'
import { GuestsPanel } from '../guests/GuestsPanel'
import { OutfitsPanel } from '../outfits/OutfitsPanel'
import { AccommodationPanel } from '../accommodation/AccommodationPanel'
import { TransportationPanel } from '../transportation/TransportationPanel'

export function PeopleHubPage() {
  const { person } = useAuth()
  // Guests/Accommodation/Transportation all carry more personal/logistics
  // data than the rest of the hub and aren't in the restricted-user
  // "should see" list in the spec — hide the tabs entirely rather than
  // showing an always-empty list (RLS would filter every row out anyway,
  // which reads as a bug, not a boundary). Outfits IS in that list (it's
  // explicitly Rishwa's responsibility per the spec), so that tab stays
  // visible to everyone — RLS scopes it to relevant rows on its own.
  const canSeeLogistics = person?.role_id === 'admin' || person?.role_id === 'organiser'

  return (
    <Tabs defaultValue="family" keepMounted={false}>
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
          <GuestsPanel />
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
