-- Wedding OS — Menu categories become editable, not a fixed CHECK constraint.
-- Mirrors task_categories/budget_categories: a real lookup table the family
-- can add to (e.g. a category this wedding needs that the default list
-- didn't anticipate) without a schema change.

create table menu_categories (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  unique (wedding_id, name)
);

insert into menu_categories (wedding_id, name)
select (select id from weddings limit 1), c.name
from (values
  ('Welcome drinks'), ('Starters'), ('Main course'), ('Sides'), ('Desserts'),
  ('Beverages'), ('Special requirements'), ('Other')
) as c(name);

alter table menu_items add column category_id uuid references menu_categories(id);

update menu_items mi
set category_id = mc.id
from menu_categories mc
where mc.name = mi.category
  and mc.wedding_id = (select id from weddings limit 1);

-- Anything that somehow didn't map falls back to "Other" rather than
-- leaving a null category on an existing item.
update menu_items
set category_id = (select id from menu_categories where name = 'Other' limit 1)
where category_id is null;

alter table menu_items alter column category_id set not null;
alter table menu_items drop column category;

create index menu_items_category_id_idx on menu_items(category_id);

alter table menu_categories enable row level security;

create policy menu_categories_select on menu_categories
  for select
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy menu_categories_write on menu_categories
  for all
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin())
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());
