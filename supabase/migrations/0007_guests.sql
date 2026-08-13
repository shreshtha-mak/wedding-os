-- Wedding OS — Guests and Event Attendance (Phase 6, increment A).
--
-- Guest deliberately does NOT duplicate name/phone/email — it references
-- People (spec's core principle: "a person exists once"; a later doc made
-- this explicit for Guests specifically: "A Guest should reference a
-- Person. Do not create duplicate person records merely because someone
-- is also a guest"). Guest-specific fields (dietary, accommodation need,
-- family grouping) live here; identity/contact stays on people.
--
-- Attendance is per-event, not a single global flag (spec: "A guest may
-- attend Haldi, not attend Mandva, attend Sangeet, attend Wedding").

create table guests (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  person_id uuid not null unique references people(id) on delete cascade,
  family_group text,
  dietary_requirements text[] not null default '{}',
  dietary_notes text,
  accommodation_required boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index guests_wedding_id_idx on guests(wedding_id);

create trigger guests_set_updated_at
  before update on guests
  for each row execute function set_updated_at();

create table guest_event_attendance (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  -- 'Pending' must never be read as 'Not attending' (spec: pending RSVP
  -- should not trigger accommodation/transport failures).
  status text not null default 'Pending'
    check (status in ('Pending', 'Attending', 'Not attending', 'Maybe')),
  num_attending integer not null default 1,
  -- Transport need is tracked per event (spec: "transportation can differ
  -- by event"), unlike accommodation which is wedding-level on guests.
  transportation_required boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guest_id, event_id)
);

create index guest_event_attendance_guest_id_idx on guest_event_attendance(guest_id);
create index guest_event_attendance_event_id_idx on guest_event_attendance(event_id);

create trigger guest_event_attendance_set_updated_at
  before update on guest_event_attendance
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — Guests aren't in the restricted-user "should see" list in the spec
-- (unlike Tasks/Things to Take/Events/Outfits/Timeline), and guest records
-- carry more personal info (phone via people, dietary/allergy notes) than
-- typical planning content, so this is organiser/admin only, full stop.
-- ---------------------------------------------------------------------------
alter table guests enable row level security;

create policy guests_select on guests
  for select
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy guests_write on guests
  for all
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin())
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());

alter table guest_event_attendance enable row level security;

create policy guest_event_attendance_select on guest_event_attendance
  for select
  using (
    is_organiser_or_admin()
    and guest_id in (select id from guests where wedding_id = auth_wedding_id())
  );

create policy guest_event_attendance_write on guest_event_attendance
  for all
  using (
    is_organiser_or_admin()
    and guest_id in (select id from guests where wedding_id = auth_wedding_id())
  )
  with check (
    is_organiser_or_admin()
    and guest_id in (select id from guests where wedding_id = auth_wedding_id())
  );
