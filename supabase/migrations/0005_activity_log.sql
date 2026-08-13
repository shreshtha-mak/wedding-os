-- Wedding OS — Activity Log.
-- Centralized, lightweight history of meaningful changes (spec: "provide
-- operational traceability without becoming a noisy social feed" — so this
-- logs deliberate actions from app mutations, not a trigger firing on every
-- column touch). entity_type/entity_id are a loose polymorphic reference
-- (no FK — they point at whichever table the action concerned) reserved for
-- a future "tap to go to record" feature; not wired up yet.

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  actor_person_id uuid references people(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  -- Just the action description ("completed \"Confirm decorator\""), not
  -- prefixed with the actor's name — the UI joins actor_person_id for that,
  -- so the name isn't duplicated into stored text.
  summary text not null,
  created_at timestamptz not null default now()
);

create index activity_log_wedding_id_idx on activity_log(wedding_id);
create index activity_log_created_at_idx on activity_log(created_at desc);

-- ---------------------------------------------------------------------------
-- RLS — every wedding member can read the log (nothing sensitive is logged
-- yet; revisit scoping once Budget/Expenses start writing entries here).
-- No direct insert/update/delete policy for authenticated: the only way to
-- write is through log_activity() below, so wedding_id/actor can't be
-- spoofed by the client.
-- ---------------------------------------------------------------------------
alter table activity_log enable row level security;

create policy activity_log_select on activity_log
  for select
  using (wedding_id = auth_wedding_id());

create or replace function log_activity(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_summary text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into activity_log (wedding_id, actor_person_id, entity_type, entity_id, action, summary)
  values (auth_wedding_id(), auth_person_id(), p_entity_type, p_entity_id, p_action, p_summary);
end;
$$;

grant execute on function log_activity(text, uuid, text, text) to authenticated;
