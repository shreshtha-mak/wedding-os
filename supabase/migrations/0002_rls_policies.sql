-- Wedding OS — Row-Level Security
-- Permissions are enforced here, in Postgres, not just hidden in the UI
-- (spec §36: "Restricted users must genuinely be prevented from accessing
-- information they are not permitted to see... Do not rely only on hiding
-- UI elements.").

-- ---------------------------------------------------------------------------
-- Helper functions. SECURITY DEFINER so they can read people/user_accounts
-- on behalf of the caller without those reads themselves being blocked by
-- the RLS policies defined below (which would otherwise recurse).
-- ---------------------------------------------------------------------------
create or replace function auth_person_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select person_id from user_accounts where id = auth.uid();
$$;

create or replace function auth_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role_id from people where id = auth_person_id();
$$;

create or replace function auth_wedding_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select wedding_id from people where id = auth_person_id();
$$;

create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select auth_role() = 'admin';
$$;

create or replace function is_organiser_or_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select auth_role() in ('admin', 'organiser');
$$;

-- ---------------------------------------------------------------------------
-- roles — readable by any signed-in member; only admins manage the list.
-- ---------------------------------------------------------------------------
alter table roles enable row level security;

create policy roles_select on roles
  for select
  using (auth.uid() is not null);

create policy roles_write on roles
  for all
  using (is_admin())
  with check (is_admin());

-- ---------------------------------------------------------------------------
-- weddings — visible to its own members; only admins edit wedding settings.
-- ---------------------------------------------------------------------------
alter table weddings enable row level security;

create policy weddings_select on weddings
  for select
  using (id = auth_wedding_id());

create policy weddings_write on weddings
  for all
  using (is_admin() and id = auth_wedding_id())
  with check (is_admin() and id = auth_wedding_id());

-- ---------------------------------------------------------------------------
-- events — every member can see the six events; only admins schedule them.
-- ---------------------------------------------------------------------------
alter table events enable row level security;

create policy events_select on events
  for select
  using (wedding_id = auth_wedding_id());

create policy events_write on events
  for all
  using (is_admin() and wedding_id = auth_wedding_id())
  with check (is_admin() and wedding_id = auth_wedding_id());

-- ---------------------------------------------------------------------------
-- people — the family directory is visible to every member; only admins
-- add/edit/remove people or change roles.
-- ---------------------------------------------------------------------------
alter table people enable row level security;

create policy people_select on people
  for select
  using (wedding_id = auth_wedding_id());

create policy people_write on people
  for all
  using (is_admin() and wedding_id = auth_wedding_id())
  with check (is_admin() and wedding_id = auth_wedding_id());

-- ---------------------------------------------------------------------------
-- user_accounts — a user sees only their own account row; admins see and
-- manage every account in their wedding (provisioning app access).
-- ---------------------------------------------------------------------------
alter table user_accounts enable row level security;

create policy user_accounts_select_self on user_accounts
  for select
  using (id = auth.uid());

create policy user_accounts_select_admin on user_accounts
  for select
  using (
    is_admin()
    and person_id in (select id from people where wedding_id = auth_wedding_id())
  );

create policy user_accounts_write_admin on user_accounts
  for all
  using (
    is_admin()
    and person_id in (select id from people where wedding_id = auth_wedding_id())
  )
  with check (
    is_admin()
    and person_id in (select id from people where wedding_id = auth_wedding_id())
  );

-- ---------------------------------------------------------------------------
-- task_categories — visible to all members; organisers and admins can add
-- new categories (kept flexible without needing a schema change).
-- ---------------------------------------------------------------------------
alter table task_categories enable row level security;

create policy task_categories_select on task_categories
  for select
  using (wedding_id = auth_wedding_id());

create policy task_categories_write on task_categories
  for all
  using (is_organiser_or_admin() and wedding_id = auth_wedding_id())
  with check (is_organiser_or_admin() and wedding_id = auth_wedding_id());

-- ---------------------------------------------------------------------------
-- tasks
--   admin/organiser: full visibility and control over every task.
--   restricted: only tasks assigned to them, or created by them — and they
--   may only update (e.g. complete) rows assigned to them. This is the
--   "My Tasks" / quick-complete flow for restricted users.
-- ---------------------------------------------------------------------------
alter table tasks enable row level security;

create policy tasks_select on tasks
  for select
  using (
    wedding_id = auth_wedding_id()
    and (
      is_organiser_or_admin()
      or assigned_person_id = auth_person_id()
      or created_by = auth_person_id()
    )
  );

create policy tasks_insert on tasks
  for insert
  with check (
    wedding_id = auth_wedding_id()
    and is_organiser_or_admin()
  );

create policy tasks_update on tasks
  for update
  using (
    wedding_id = auth_wedding_id()
    and (is_organiser_or_admin() or assigned_person_id = auth_person_id())
  )
  with check (
    wedding_id = auth_wedding_id()
    and (is_organiser_or_admin() or assigned_person_id = auth_person_id())
  );

create policy tasks_delete on tasks
  for delete
  using (
    wedding_id = auth_wedding_id()
    and is_organiser_or_admin()
  );

-- ---------------------------------------------------------------------------
-- Login tracking — user_accounts writes are admin-only above, so a signed-in
-- user can't UPDATE their own last_login directly. This narrow function is
-- the one exception: it only ever touches the caller's own row/column.
-- ---------------------------------------------------------------------------
create or replace function touch_last_login()
returns void
language sql
security definer
set search_path = public
as $$
  update user_accounts set last_login = now() where id = auth.uid();
$$;

grant execute on function touch_last_login() to authenticated;
