import type { Person } from '../../types/database'

// Outfit planning is only tracked for this fixed set of people, regardless
// of how many People records the wedding has overall. This is a UI/business
// rule scoped to the Outfits module — it must never filter the canonical
// People table itself (spec: "other people still exist normally in Wedding
// OS"), so it's a name allowlist applied only where an Outfit person is
// picked, not a column on `people`.
const ELIGIBLE_OUTFIT_PEOPLE = [
  'Saumya', 'Clara', 'Matu', 'Pitu', 'Chahca', 'Chachi',
  'Shreshtha', 'Nishtha', 'Baa', 'Bapuji', 'Albert', 'Beate', 'Max',
]

const normalize = (name: string) => name.trim().toLowerCase()
const ELIGIBLE_SET = new Set(ELIGIBLE_OUTFIT_PEOPLE.map(normalize))

export function isOutfitEligible(personName: string): boolean {
  return ELIGIBLE_SET.has(normalize(personName))
}

export function filterOutfitEligiblePeople<T extends Pick<Person, 'name'>>(people: T[]): T[] {
  return people.filter((p) => isOutfitEligible(p.name))
}
