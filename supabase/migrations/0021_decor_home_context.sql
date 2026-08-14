-- Wedding OS — Home Decor.
--
-- The house/garden need decorating too, even though "Home" isn't one of
-- the wedding Events. Rather than inventing a fake Event row to hang decor
-- off of, decor_items gets a context: 'event' (existing behaviour, tied to
-- event_id) or 'home' (tied to a home_area instead). Same table, same
-- readiness philosophy — the app-level wedding readiness query is updated
-- separately to only ever read context='event' rows, so Home Decor can
-- never affect event/wedding readiness.
--
-- Written to be safely re-runnable: IF NOT EXISTS / guarded constraint add,
-- so re-applying after a partial run (e.g. pasted twice into the SQL
-- editor) doesn't error.

alter table decor_items
  add column if not exists context text not null default 'event'
    check (context in ('event', 'home')),
  add column if not exists home_area text
    check (home_area in ('house', 'garden'));

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'decor_items_context_check'
  ) then
    alter table decor_items
      add constraint decor_items_context_check check (
        (context = 'event' and event_id is not null and home_area is null)
        or (context = 'home' and event_id is null and home_area is not null)
      );
  end if;
end $$;
