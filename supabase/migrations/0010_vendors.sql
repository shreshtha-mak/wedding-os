-- Wedding OS — Vendors, Vendor-Event Assignments, Vendor Checklists (Phase 7, increment A).
--
-- budget_categories is new but deliberately shared by both vendors.category_id
-- and (in a later migration) expenses.category_id — vendor "type" and expense
-- "category" are the same underlying dimension (a Decorator vendor incurs
-- Décor-category expenses), so one lookup table rather than two near-
-- duplicates, following the same pattern as reusing task_categories across
-- tasks/decisions/challenges.

create table budget_categories (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  unique (wedding_id, name)
);

insert into budget_categories (wedding_id, name)
select (select id from weddings limit 1), c.name
from (values
  ('Venue'), ('Décor'), ('Food'), ('Music'), ('Photography'), ('Clothing'),
  ('Jewellery'), ('Gifts'), ('Invitations'), ('Accommodation'), ('Transport'),
  ('Makeup'), ('Entertainment'), ('Miscellaneous')
) as c(name);

create table vendors (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  category_id uuid references budget_categories(id) on delete set null,
  contact_person text,
  phone text,
  whatsapp text,
  email text,
  address text,
  status text not null default 'Considering'
    check (status in ('Considering', 'Confirmed', 'Cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vendors_wedding_id_idx on vendors(wedding_id);

create trigger vendors_set_updated_at
  before update on vendors
  for each row execute function set_updated_at();

create table vendor_event_assignments (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  responsibility text,
  setup_time time,
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'Completed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vendor_id, event_id)
);

create index vendor_event_assignments_vendor_id_idx on vendor_event_assignments(vendor_id);
create index vendor_event_assignments_event_id_idx on vendor_event_assignments(event_id);

create trigger vendor_event_assignments_set_updated_at
  before update on vendor_event_assignments
  for each row execute function set_updated_at();

create table vendor_checklist_items (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references vendor_event_assignments(id) on delete cascade,
  item_name text not null,
  responsible_contact text,
  due_date date,
  status text not null default 'Not Started'
    check (status in ('Not Started', 'In Progress', 'Done')),
  completed_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index vendor_checklist_items_assignment_id_idx on vendor_checklist_items(assignment_id);

create trigger vendor_checklist_items_set_updated_at
  before update on vendor_checklist_items
  for each row execute function set_updated_at();

create or replace function vendor_checklist_items_sync_completed()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'Done' and old.status is distinct from 'Done' then
    new.completed_date = coalesce(new.completed_date, current_date);
  elsif new.status is distinct from 'Done' then
    new.completed_date = null;
  end if;
  return new;
end;
$$;

create trigger vendor_checklist_items_sync_completed_trigger
  before update on vendor_checklist_items
  for each row execute function vendor_checklist_items_sync_completed();

-- ---------------------------------------------------------------------------
-- RLS — organiser/admin only. Vendors aren't in the restricted-user
-- "should see" list (unlike Outfits/Things to Take/Tasks/Events/Timeline).
-- ---------------------------------------------------------------------------
alter table budget_categories enable row level security;

create policy budget_categories_select on budget_categories
  for select
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy budget_categories_write on budget_categories
  for all
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin())
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());

alter table vendors enable row level security;

create policy vendors_select on vendors
  for select
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy vendors_write on vendors
  for all
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin())
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());

alter table vendor_event_assignments enable row level security;

create policy vendor_event_assignments_select on vendor_event_assignments
  for select
  using (
    is_organiser_or_admin()
    and vendor_id in (select id from vendors where wedding_id = auth_wedding_id())
  );

create policy vendor_event_assignments_write on vendor_event_assignments
  for all
  using (
    is_organiser_or_admin()
    and vendor_id in (select id from vendors where wedding_id = auth_wedding_id())
  )
  with check (
    is_organiser_or_admin()
    and vendor_id in (select id from vendors where wedding_id = auth_wedding_id())
  );

alter table vendor_checklist_items enable row level security;

create policy vendor_checklist_items_select on vendor_checklist_items
  for select
  using (
    is_organiser_or_admin()
    and assignment_id in (
      select vea.id from vendor_event_assignments vea
      join vendors v on v.id = vea.vendor_id
      where v.wedding_id = auth_wedding_id()
    )
  );

create policy vendor_checklist_items_write on vendor_checklist_items
  for all
  using (
    is_organiser_or_admin()
    and assignment_id in (
      select vea.id from vendor_event_assignments vea
      join vendors v on v.id = vea.vendor_id
      where v.wedding_id = auth_wedding_id()
    )
  )
  with check (
    is_organiser_or_admin()
    and assignment_id in (
      select vea.id from vendor_event_assignments vea
      join vendors v on v.id = vea.vendor_id
      where v.wedding_id = auth_wedding_id()
    )
  );
