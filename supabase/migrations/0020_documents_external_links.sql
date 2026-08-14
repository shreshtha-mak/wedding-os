-- Wedding OS — External document links (Google Drive, etc).
--
-- The family already keeps most documents in Google Drive and the app
-- shouldn't force a duplicate upload just to reference one. A document can
-- now point at either an uploaded file in the `documents` storage bucket
-- (unchanged from before) or an external URL — never both, and every
-- existing row is backfilled as 'upload' so nothing already stored changes
-- behaviour.
--
-- Written to be safely re-runnable: IF NOT EXISTS / guarded constraint add,
-- so re-applying after a partial run (e.g. pasted twice into the SQL
-- editor) doesn't error.

alter table documents
  alter column storage_path drop not null;

alter table documents
  add column if not exists storage_type text not null default 'upload'
    check (storage_type in ('upload', 'external')),
  add column if not exists external_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'documents_storage_source_check'
  ) then
    alter table documents
      add constraint documents_storage_source_check check (
        (storage_type = 'upload' and storage_path is not null and external_url is null)
        or (storage_type = 'external' and external_url is not null and storage_path is null)
      );
  end if;
end $$;
