-- Wedding OS — Expenses and Payments (Phase 7, increment C).
--
-- Deliberately NO paid_amount/outstanding_amount/payment_status columns on
-- expenses — those are derived from summing payments (spec: "outstanding
-- must be calculated... do not ask users to manually maintain it"). The
-- app computes them client-side (see features/budget/finance.ts) rather
-- than via a DB view, consistent with how event readiness is computed
-- (an isolated, swappable calculation, not baked into the schema).

create table expenses (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  category_id uuid references budget_categories(id) on delete set null,
  vendor_id uuid references vendors(id) on delete set null,
  name text not null,
  budgeted_amount numeric,
  quoted_amount numeric,
  finalised_amount numeric,
  due_date date,
  notes text,
  created_by uuid references people(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_wedding_id_idx on expenses(wedding_id);
create index expenses_event_id_idx on expenses(event_id);

create trigger expenses_set_updated_at
  before update on expenses
  for each row execute function set_updated_at();

create table payments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  amount numeric not null,
  payment_date date not null default current_date,
  payment_method text,
  paid_by_person_id uuid references people(id) on delete set null,
  reference_number text,
  notes text,
  created_at timestamptz not null default now()
);

create index payments_expense_id_idx on payments(expense_id);

-- ---------------------------------------------------------------------------
-- RLS — organiser/admin only, no exceptions. Spec is explicit: restricted
-- users must not see "the full budget or unrelated financial information."
-- ---------------------------------------------------------------------------
alter table expenses enable row level security;

create policy expenses_select on expenses
  for select
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy expenses_write on expenses
  for all
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin())
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());

alter table payments enable row level security;

create policy payments_select on payments
  for select
  using (
    is_organiser_or_admin()
    and expense_id in (select id from expenses where wedding_id = auth_wedding_id())
  );

create policy payments_write on payments
  for all
  using (
    is_organiser_or_admin()
    and expense_id in (select id from expenses where wedding_id = auth_wedding_id())
  )
  with check (
    is_organiser_or_admin()
    and expense_id in (select id from expenses where wedding_id = auth_wedding_id())
  );
