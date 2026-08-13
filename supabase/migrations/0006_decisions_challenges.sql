-- Wedding OS — Decisions and Challenges (Phase 5).
-- Both reuse task_categories for categorisation rather than introducing two
-- near-identical lookup tables — it's already seeded with a general-purpose
-- planning category list, and adding a genuinely decision/challenge-specific
-- category later is a one-row insert, not a schema change.

create table decisions (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  category_id uuid references task_categories(id) on delete set null,
  question text not null,
  options text[] not null default '{}',
  responsible_person_id uuid references people(id) on delete set null,
  deadline date,
  status text not null default 'Pending'
    check (status in ('Pending', 'Decided')),
  selected_option text,
  decided_by_person_ids uuid[] not null default '{}',
  decided_date date,
  notes text,
  created_by uuid references people(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index decisions_wedding_id_idx on decisions(wedding_id);
create index decisions_event_id_idx on decisions(event_id);
create index decisions_status_idx on decisions(status);
create index decisions_responsible_person_id_idx on decisions(responsible_person_id);

create trigger decisions_set_updated_at
  before update on decisions
  for each row execute function set_updated_at();

-- Mirrors tasks_sync_completion: decided_date tracks status consistently
-- rather than trusting every call site to set/clear it correctly.
create or replace function decisions_sync_decided()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'Decided' and old.status is distinct from 'Decided' then
    new.decided_date = coalesce(new.decided_date, current_date);
  elsif new.status is distinct from 'Decided' then
    new.decided_date = null;
    new.selected_option = null;
    new.decided_by_person_ids = '{}';
  end if;
  return new;
end;
$$;

create trigger decisions_sync_decided_trigger
  before update on decisions
  for each row execute function decisions_sync_decided();

alter table decisions enable row level security;

create policy decisions_select on decisions
  for select
  using (
    wedding_id = auth_wedding_id()
    and (
      is_organiser_or_admin()
      or responsible_person_id = auth_person_id()
      or created_by = auth_person_id()
    )
  );

create policy decisions_insert on decisions
  for insert
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy decisions_update on decisions
  for update
  using (
    wedding_id = auth_wedding_id()
    and (is_organiser_or_admin() or responsible_person_id = auth_person_id())
  )
  with check (
    wedding_id = auth_wedding_id()
    and (is_organiser_or_admin() or responsible_person_id = auth_person_id())
  );

create policy decisions_delete on decisions
  for delete
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

-- ---------------------------------------------------------------------------
-- Challenges — distinct from Tasks (spec: a task is "confirm decorator", a
-- challenge is "decorator can't provide enough chairs").
-- ---------------------------------------------------------------------------
create table challenges (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  category_id uuid references task_categories(id) on delete set null,
  title text not null,
  description text,
  owner_person_id uuid references people(id) on delete set null,
  priority text not null default 'Medium'
    check (priority in ('Low', 'Medium', 'High', 'Critical')),
  date_identified date not null default current_date,
  deadline date,
  status text not null default 'Open'
    check (status in ('Open', 'Being Resolved', 'Resolved')),
  resolution text,
  related_task_id uuid references tasks(id) on delete set null,
  resolved_at timestamptz,
  notes text,
  created_by uuid references people(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index challenges_wedding_id_idx on challenges(wedding_id);
create index challenges_event_id_idx on challenges(event_id);
create index challenges_status_idx on challenges(status);
create index challenges_owner_person_id_idx on challenges(owner_person_id);

create trigger challenges_set_updated_at
  before update on challenges
  for each row execute function set_updated_at();

create or replace function challenges_sync_resolved()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'Resolved' and old.status is distinct from 'Resolved' then
    new.resolved_at = coalesce(new.resolved_at, now());
  elsif new.status is distinct from 'Resolved' then
    new.resolved_at = null;
  end if;
  return new;
end;
$$;

create trigger challenges_sync_resolved_trigger
  before update on challenges
  for each row execute function challenges_sync_resolved();

alter table challenges enable row level security;

create policy challenges_select on challenges
  for select
  using (
    wedding_id = auth_wedding_id()
    and (
      is_organiser_or_admin()
      or owner_person_id = auth_person_id()
      or created_by = auth_person_id()
    )
  );

create policy challenges_insert on challenges
  for insert
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy challenges_update on challenges
  for update
  using (
    wedding_id = auth_wedding_id()
    and (is_organiser_or_admin() or owner_person_id = auth_person_id())
  )
  with check (
    wedding_id = auth_wedding_id()
    and (is_organiser_or_admin() or owner_person_id = auth_person_id())
  );

create policy challenges_delete on challenges
  for delete
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());
