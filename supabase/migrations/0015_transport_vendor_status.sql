-- Wedding OS — Transportation requirement model + Vendor status expansion.
--
-- Transportation was a boolean (required or not), losing the distinction
-- the screen spec calls for: "Own arrangement" and "Not needed" both count
-- as satisfied; only "Required" with nothing arranged is a real problem.
-- A boolean can't represent "unknown yet" vs "not needed" vs "sorting it
-- themselves" — replacing it with the full 5-state model.

alter table guest_event_attendance
  add column transportation_status text not null default 'Unknown'
    check (transportation_status in ('Unknown', 'Not needed', 'Own arrangement', 'Required', 'Arranged'));

-- Best-effort carry-over from the old boolean before dropping it.
update guest_event_attendance
set transportation_status = case when transportation_required then 'Required' else 'Unknown' end;

alter table guest_event_attendance drop column transportation_required;

-- ---------------------------------------------------------------------------
-- Vendor status — widened from a 3-value (Considering/Confirmed/Cancelled)
-- lifecycle to the full 5-value one (a vendor moves from being one option
-- among several, to shortlisted, to booked, to the job being done).
-- ---------------------------------------------------------------------------
update vendors set status = 'Prospect' where status = 'Considering';

alter table vendors drop constraint vendors_status_check;
alter table vendors add constraint vendors_status_check
  check (status in ('Prospect', 'Shortlisted', 'Confirmed', 'Completed', 'Cancelled'));

alter table vendors alter column status set default 'Prospect';
