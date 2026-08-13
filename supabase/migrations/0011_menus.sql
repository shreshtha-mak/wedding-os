-- Wedding OS — Menus (Phase 7, increment B).
-- One menu per event. Items use a soft is_active flag instead of hard
-- delete (spec: "previous versions should not simply be destroyed") —
-- removing an item during discussion archives it rather than losing it,
-- consistent with the archive-over-delete principle adopted for this build.

create table menus (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event_id uuid not null unique references events(id) on delete cascade,
  status text not null default 'Draft'
    check (status in ('Draft', 'Discussing', 'Finalised')),
  caterer_vendor_id uuid references vendors(id) on delete set null,
  finalised_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menus_wedding_id_idx on menus(wedding_id);

create trigger menus_set_updated_at
  before update on menus
  for each row execute function set_updated_at();

create or replace function menus_sync_finalised()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'Finalised' and old.status is distinct from 'Finalised' then
    new.finalised_date = coalesce(new.finalised_date, current_date);
  elsif new.status is distinct from 'Finalised' then
    new.finalised_date = null;
  end if;
  return new;
end;
$$;

create trigger menus_sync_finalised_trigger
  before update on menus
  for each row execute function menus_sync_finalised();

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references menus(id) on delete cascade,
  item_name text not null,
  category text not null default 'Other'
    check (category in (
      'Welcome drinks', 'Starters', 'Main course', 'Sides', 'Desserts',
      'Beverages', 'Special requirements', 'Other'
    )),
  is_vegetarian boolean,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

create index menu_items_menu_id_idx on menu_items(menu_id);

alter table menus enable row level security;

create policy menus_select on menus
  for select
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy menus_write on menus
  for all
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin())
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());

alter table menu_items enable row level security;

create policy menu_items_select on menu_items
  for select
  using (
    is_organiser_or_admin()
    and menu_id in (select id from menus where wedding_id = auth_wedding_id())
  );

create policy menu_items_write on menu_items
  for all
  using (
    is_organiser_or_admin()
    and menu_id in (select id from menus where wedding_id = auth_wedding_id())
  )
  with check (
    is_organiser_or_admin()
    and menu_id in (select id from menus where wedding_id = auth_wedding_id())
  );
