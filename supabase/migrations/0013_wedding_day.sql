-- Wedding OS — Wedding Day Mode support (Phase 9).
-- The only schema need: tracking which guests have actually arrived at an
-- event, so Wedding Day Mode can show "3 guests haven't arrived" per the
-- spec's example screen. Everything else in this phase (current-event
-- detection, countdown, event status, "what's next") is computed from
-- data that already exists.

alter table guest_event_attendance
  add column arrived boolean not null default false;
