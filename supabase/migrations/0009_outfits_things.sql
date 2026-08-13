-- Wedding OS — Outfits and Things to Take (Phase 6, increment C).

create table outfits (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  description text,
  outfit_status text not null default 'Idea'
    check (outfit_status in ('Idea', 'To Buy', 'In Making', 'In Alteration', 'Ready')),
  shoes_status text not null default 'Idea'
    check (shoes_status in ('Idea', 'To Buy', 'In Making', 'In Alteration', 'Ready')),
  jewellery_status text not null default 'Idea'
    check (jewellery_status in ('Idea', 'To Buy', 'In Making', 'In Alteration', 'Ready')),
  accessories_status text not null default 'Idea'
    check (accessories_status in ('Idea', 'To Buy', 'In Making', 'In Alteration', 'Ready')),
  -- Derived, not manually toggled: an outfit is only Ready when every
  -- component is (spec: "the app should provide... things that aren't
  -- ready"). A generated column keeps this consistent by construction
  -- rather than trusting every update site to recompute it.
  is_ready boolean generated always as (
    outfit_status = 'Ready' and shoes_status = 'Ready'
    and jewellery_status = 'Ready' and accessories_status = 'Ready'
  ) stored,
  vendor_tailor text,
  cost numeric,
  ready_date date,
  -- Distinct from person_id: who the outfit belongs to vs. who's managing
  -- its procurement (spec: "responsibility ≠ role" — e.g. Rishwa can be
  -- responsible for tracking Maa's Sangeet outfit without it being hers).
  responsible_person_id uuid references people(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (person_id, event_id)
);

create index outfits_wedding_id_idx on outfits(wedding_id);
create index outfits_person_id_idx on outfits(person_id);
create index outfits_event_id_idx on outfits(event_id);

create trigger outfits_set_updated_at
  before update on outfits
  for each row execute function set_updated_at();

alter table outfits enable row level security;

create policy outfits_select on outfits
  for select
  using (
    wedding_id = auth_wedding_id()
    and (
      is_organiser_or_admin()
      or person_id = auth_person_id()
      or responsible_person_id = auth_person_id()
    )
  );

create policy outfits_insert on outfits
  for insert
  with check (
    wedding_id = auth_wedding_id()
    and (is_organiser_or_admin() or responsible_person_id = auth_person_id())
  );

create policy outfits_update on outfits
  for update
  using (
    wedding_id = auth_wedding_id()
    and (
      is_organiser_or_admin()
      or person_id = auth_person_id()
      or responsible_person_id = auth_person_id()
    )
  )
  with check (
    wedding_id = auth_wedding_id()
    and (
      is_organiser_or_admin()
      or person_id = auth_person_id()
      or responsible_person_id = auth_person_id()
    )
  );

create policy outfits_delete on outfits
  for delete
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

-- ---------------------------------------------------------------------------
-- Things to Take — distinct from Tasks (spec: "Buy mehendi cones" is a task;
-- "Mehendi cones, quantity 50, Bought" is a thing). RLS mirrors tasks
-- exactly: it's explicitly in the restricted-user "should see" list.
-- ---------------------------------------------------------------------------
create table things_to_take (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  item_name text not null,
  quantity integer not null default 1,
  responsible_person_id uuid references people(id) on delete set null,
  status text not null default 'Idea'
    check (status in ('Idea', 'To Buy', 'Bought', 'To Prepare', 'Packed', 'At Venue', 'Returned')),
  purchase_required boolean not null default false,
  cost numeric,
  where_stored text,
  notes text,
  created_by uuid references people(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index things_to_take_wedding_id_idx on things_to_take(wedding_id);
create index things_to_take_event_id_idx on things_to_take(event_id);
create index things_to_take_status_idx on things_to_take(status);

create trigger things_to_take_set_updated_at
  before update on things_to_take
  for each row execute function set_updated_at();

alter table things_to_take enable row level security;

create policy things_to_take_select on things_to_take
  for select
  using (wedding_id = auth_wedding_id());

create policy things_to_take_insert on things_to_take
  for insert
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy things_to_take_update on things_to_take
  for update
  using (
    wedding_id = auth_wedding_id()
    and (is_organiser_or_admin() or responsible_person_id = auth_person_id())
  )
  with check (
    wedding_id = auth_wedding_id()
    and (is_organiser_or_admin() or responsible_person_id = auth_person_id())
  );

create policy things_to_take_delete on things_to_take
  for delete
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());
