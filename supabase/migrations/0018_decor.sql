-- Wedding OS — Decor module (Phase 11 remediation).
--
-- Previously decor work only showed up implicitly as Vendor checklist items
-- (see the comment in readiness/calculate.ts). The screen spec calls for
-- Decor as its own tracked module, so this gives it a real table rather
-- than continuing to fold it into vendor checklists.

create table decor_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  name text not null,
  category text not null default 'Other'
    check (category in (
      'Mandap/Stage', 'Entrance', 'Seating', 'Lighting', 'Floral',
      'Table Settings', 'Photo Booth', 'Signage', 'Other'
    )),
  vendor_id uuid references vendors(id) on delete set null,
  status text not null default 'Concept'
    check (status in ('Concept', 'Confirmed', 'In Progress', 'Done')),
  cost numeric,
  notes text,
  created_by uuid references people(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index decor_items_wedding_id_idx on decor_items(wedding_id);
create index decor_items_event_id_idx on decor_items(event_id);

create trigger decor_items_set_updated_at
  before update on decor_items
  for each row execute function set_updated_at();

-- RLS — organiser/admin only, same tier as Vendors/Budget: decor is a
-- planning-side module, not one restricted users act on.
alter table decor_items enable row level security;

create policy decor_items_select on decor_items
  for select
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy decor_items_write on decor_items
  for all
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin())
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());
