-- Wedding OS — Separate Family from Guests within People.
--
-- People stays the single canonical identity table (everyone shows up
-- there — spec: "a person exists once"), but until now there was no way
-- to tell "core family" apart from "someone added purely as a guest" —
-- the Family screen listed every person indiscriminately, including
-- guest-only additions. `category` is a lightweight default-list tag
-- decided once at creation, orthogonal to the guests table: a family
-- member can still independently have a guests row (attending, dietary,
-- accommodation tracked) without changing their category, since being
-- family and being a wedding guest are not mutually exclusive.
--
-- Backfill: existing rows default to 'family' (preserves today's Family
-- list exactly), except rows that already have a guests record and no
-- app role — those read as guest-only additions and are recategorised
-- accordingly. Anyone with a role_id keeps 'family' regardless, since an
-- app role is a strong signal they're organising, not just attending.

alter table people
  add column category text not null default 'family'
    check (category in ('family', 'guest'));

update people
set category = 'guest'
where role_id is null
  and exists (select 1 from guests where guests.person_id = people.id);
