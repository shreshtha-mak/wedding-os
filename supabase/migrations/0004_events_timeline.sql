-- Wedding OS — Event timeline (Phase 4).
-- Timeline items belong to one event; the date is deliberately not
-- duplicated here since it's always the parent event's date (spec:
-- single source of truth) — only start/end time are stored.

create table timeline_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  activity text not null,
  type text not null default 'Other'
    check (type in (
      'Event activity', 'Vendor', 'Setup', 'Family', 'Guest', 'Food',
      'Ceremony', 'Performance', 'Photography', 'Transport', 'Packing',
      'Payment', 'Other'
    )),
  start_time time,
  end_time time,
  location text,
  responsible_person_id uuid references people(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index timeline_items_event_id_idx on timeline_items(event_id);
create index timeline_items_wedding_id_idx on timeline_items(wedding_id);

create trigger timeline_items_set_updated_at
  before update on timeline_items
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — visible to every wedding member; organisers/admins manage it
-- (operational planning content, same tier as tasks and task_categories).
-- ---------------------------------------------------------------------------
alter table timeline_items enable row level security;

create policy timeline_items_select on timeline_items
  for select
  using (wedding_id = auth_wedding_id());

create policy timeline_items_write on timeline_items
  for all
  using (is_organiser_or_admin() and wedding_id = auth_wedding_id())
  with check (is_organiser_or_admin() and wedding_id = auth_wedding_id());
