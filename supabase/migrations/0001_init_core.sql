-- Wedding OS — Core schema (vertical slice 1)
-- Scope: Wedding, Events, People, User Accounts, Roles, Tasks, Task Categories.
-- Remaining V1 entities (Vendors, Budget, Guests, Accommodation, Outfits, etc.)
-- are added in later migrations alongside their own vertical slice, per the
-- incremental schema strategy — this keeps every migration reviewable against
-- a concrete feature instead of guessing the full shape up front.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current on every row update.
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Roles — lookup table, not an enum, so permission roles can be extended
-- without a schema migration (spec: "permission system must be configurable
-- rather than hard-coded").
-- ---------------------------------------------------------------------------
create table roles (
  id text primary key,              -- 'admin' | 'organiser' | 'restricted'
  label text not null,
  description text
);

-- ---------------------------------------------------------------------------
-- Weddings — top-level entity so the architecture supports a second wedding
-- later, even though V1 only ever has one row here.
-- ---------------------------------------------------------------------------
create table weddings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger weddings_set_updated_at
  before update on weddings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Events — the six operational hubs (Mehendi, Haldi, Mandva Havan, Sangeet,
-- Mameru, Wedding). day_label kept as free text ("Friday") separate from the
-- actual date so the UI can show both without recomputing.
-- ---------------------------------------------------------------------------
create table events (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  day_label text,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_wedding_id_idx on events(wedding_id);

create trigger events_set_updated_at
  before update on events
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- People — the central directory. A person does not require a user account.
-- ---------------------------------------------------------------------------
create table people (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  relationship text,
  phone text,
  email text,
  profile_photo_url text,
  app_access boolean not null default false,
  role_id text references roles(id),   -- null until app_access is granted
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index people_wedding_id_idx on people(wedding_id);

create trigger people_set_updated_at
  before update on people
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- User accounts — separate from People. One row per Supabase auth user,
-- linked 1:1 to a person once that person is given app access.
-- ---------------------------------------------------------------------------
create table user_accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  person_id uuid not null unique references people(id) on delete cascade,
  login_email text not null,
  account_status text not null default 'active', -- 'active' | 'disabled'
  last_login timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Task categories — lookup table so categories stay editable without a
-- schema change (spec: "flexible rather than requiring database schema
-- changes"). Seeded with the spec's default list in seed.sql.
-- ---------------------------------------------------------------------------
create table task_categories (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  unique (wedding_id, name)
);

-- ---------------------------------------------------------------------------
-- Tasks — the master task database. event_id is optional: a task can exist
-- outside any single event. vendor/guest/item references are added once
-- those modules exist (Phase 6/7); omitting them now avoids dangling FKs to
-- tables that don't exist yet.
-- ---------------------------------------------------------------------------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  category_id uuid references task_categories(id) on delete set null,
  name text not null,
  description text,
  assigned_person_id uuid references people(id) on delete set null,
  created_by uuid references people(id) on delete set null,
  due_date date,
  due_time time,
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High', 'Critical')),
  status text not null default 'Not Started'
    check (status in ('Not Started', 'In Progress', 'Blocked', 'Completed')),
  notes text,
  attachment_url text,
  completed_at timestamptz,
  completed_by uuid references people(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_wedding_id_idx on tasks(wedding_id);
create index tasks_event_id_idx on tasks(event_id);
create index tasks_assigned_person_id_idx on tasks(assigned_person_id);
create index tasks_status_idx on tasks(status);
create index tasks_due_date_idx on tasks(due_date);

create trigger tasks_set_updated_at
  before update on tasks
  for each row execute function set_updated_at();

-- Data integrity: completed_at/completed_by should be set exactly when a
-- task is marked Completed, and cleared otherwise — enforced centrally here
-- rather than trusted to every call site (spec: "derived values must be
-- calculated consistently").
create or replace function tasks_sync_completion()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'Completed' and old.status is distinct from 'Completed' then
    new.completed_at = coalesce(new.completed_at, now());
  elsif new.status is distinct from 'Completed' then
    new.completed_at = null;
    new.completed_by = null;
  end if;
  return new;
end;
$$;

create trigger tasks_sync_completion_trigger
  before update on tasks
  for each row execute function tasks_sync_completion();
