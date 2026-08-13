-- Wedding OS — Accommodation and Transportation (Phase 6, increment B).
-- Accommodation Location -> Rooms -> Assignments, kept as three explicit
-- tables (not flattened) so "empty beds"/"overbooked" stay derivable by
-- comparing room.capacity against assignment counts, rather than being
-- manually tracked numbers that can drift from reality.

create table accommodation_locations (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  type text,
  address text,
  contact_person text,
  phone text,
  check_in_time time,
  check_out_time time,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index accommodation_locations_wedding_id_idx on accommodation_locations(wedding_id);

create trigger accommodation_locations_set_updated_at
  before update on accommodation_locations
  for each row execute function set_updated_at();

create table accommodation_rooms (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references accommodation_locations(id) on delete cascade,
  room_name text not null,
  capacity integer not null default 1,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index accommodation_rooms_location_id_idx on accommodation_rooms(location_id);

create trigger accommodation_rooms_set_updated_at
  before update on accommodation_rooms
  for each row execute function set_updated_at();

create table accommodation_assignments (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references accommodation_rooms(id) on delete cascade,
  guest_id uuid not null references guests(id) on delete cascade,
  check_in date,
  check_out date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, guest_id)
);

create index accommodation_assignments_room_id_idx on accommodation_assignments(room_id);
create index accommodation_assignments_guest_id_idx on accommodation_assignments(guest_id);

create trigger accommodation_assignments_set_updated_at
  before update on accommodation_assignments
  for each row execute function set_updated_at();

-- RLS — same scoping as guests (organiser/admin only): this table is
-- entirely about where specific guests sleep, inherently guest-identity data.
alter table accommodation_locations enable row level security;

create policy accommodation_locations_select on accommodation_locations
  for select
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy accommodation_locations_write on accommodation_locations
  for all
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin())
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());

alter table accommodation_rooms enable row level security;

create policy accommodation_rooms_select on accommodation_rooms
  for select
  using (
    is_organiser_or_admin()
    and location_id in (select id from accommodation_locations where wedding_id = auth_wedding_id())
  );

create policy accommodation_rooms_write on accommodation_rooms
  for all
  using (
    is_organiser_or_admin()
    and location_id in (select id from accommodation_locations where wedding_id = auth_wedding_id())
  )
  with check (
    is_organiser_or_admin()
    and location_id in (select id from accommodation_locations where wedding_id = auth_wedding_id())
  );

alter table accommodation_assignments enable row level security;

create policy accommodation_assignments_select on accommodation_assignments
  for select
  using (
    is_organiser_or_admin()
    and guest_id in (select id from guests where wedding_id = auth_wedding_id())
  );

create policy accommodation_assignments_write on accommodation_assignments
  for all
  using (
    is_organiser_or_admin()
    and guest_id in (select id from guests where wedding_id = auth_wedding_id())
  )
  with check (
    is_organiser_or_admin()
    and guest_id in (select id from guests where wedding_id = auth_wedding_id())
  );

-- ---------------------------------------------------------------------------
-- Transportation — each requirement is its own record (spec: "the purpose
-- is simple: nobody gets forgotten. Do not build a complicated fleet-
-- management system"). person_id is nullable because a record can represent
-- a whole group ("Sharma family airport pickup") rather than one person.
-- ---------------------------------------------------------------------------
create table transportation (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  person_id uuid references people(id) on delete set null,
  group_label text,
  pickup_location text,
  destination text,
  transport_date date,
  transport_time time,
  responsible_person_id uuid references people(id) on delete set null,
  driver text,
  vehicle text,
  num_passengers integer not null default 1,
  status text not null default 'Needed'
    check (status in ('Needed', 'Assigned', 'Confirmed', 'Completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transportation_wedding_id_idx on transportation(wedding_id);
create index transportation_event_id_idx on transportation(event_id);
create index transportation_status_idx on transportation(status);

create trigger transportation_set_updated_at
  before update on transportation
  for each row execute function set_updated_at();

alter table transportation enable row level security;

create policy transportation_select on transportation
  for select
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy transportation_write on transportation
  for all
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin())
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());
