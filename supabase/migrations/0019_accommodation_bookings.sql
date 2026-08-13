-- Wedding OS — Accommodation Booking layer (Phase 11 remediation).
--
-- Location -> Room -> Assignment already tracks *who sleeps where*, but
-- nothing tracked the actual reservation made with the hotel/venue — a
-- confirmation reference, the block of rooms held, and its cost. This adds
-- that as its own entity rather than overloading accommodation_locations
-- (a location can have several separate bookings over the wedding's dates,
-- e.g. one block for the Sangeet night and a larger one for the wedding
-- night). Rooms optionally link to the booking they belong to.

create table accommodation_bookings (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  location_id uuid not null references accommodation_locations(id) on delete cascade,
  vendor_id uuid references vendors(id) on delete set null,
  booking_reference text,
  check_in date,
  check_out date,
  num_rooms integer not null default 1,
  cost numeric,
  status text not null default 'Requested'
    check (status in ('Requested', 'Confirmed', 'Cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index accommodation_bookings_wedding_id_idx on accommodation_bookings(wedding_id);
create index accommodation_bookings_location_id_idx on accommodation_bookings(location_id);

create trigger accommodation_bookings_set_updated_at
  before update on accommodation_bookings
  for each row execute function set_updated_at();

alter table accommodation_rooms
  add column booking_id uuid references accommodation_bookings(id) on delete set null;

create index accommodation_rooms_booking_id_idx on accommodation_rooms(booking_id);

-- RLS — same tier as accommodation_locations (organiser/admin only).
alter table accommodation_bookings enable row level security;

create policy accommodation_bookings_select on accommodation_bookings
  for select
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy accommodation_bookings_write on accommodation_bookings
  for all
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin())
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());
