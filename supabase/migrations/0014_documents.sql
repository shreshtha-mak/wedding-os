-- Wedding OS — Documents (the final Phase 7 piece).
--
-- The bucket is PRIVATE, not public — this is a private family app, so
-- files are served via short-lived signed URLs generated on demand, never
-- a permanent public link. RLS on storage.objects enforces access the same
-- way every other table in this app does (organiser/admin only, matching
-- Vendors/Budget/Guests — many possible attachments here, like invoices,
-- are exactly the sensitive kind of content restricted users shouldn't see).
--
-- Upload paths are `{wedding_id}/{uuid}-{filename}` so storage.foldername()
-- can scope RLS by wedding, future-proofing for the multi-wedding
-- architecture the spec asks for even though V1 only ever has one.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760, -- 10MB
  array[
    'image/jpeg', 'image/png', 'image/webp', 'image/heic',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
);

create policy documents_storage_select on storage.objects
  for select
  using (
    bucket_id = 'documents'
    and is_organiser_or_admin()
    and (storage.foldername(name))[1] = auth_wedding_id()::text
  );

create policy documents_storage_insert on storage.objects
  for insert
  with check (
    bucket_id = 'documents'
    and is_organiser_or_admin()
    and (storage.foldername(name))[1] = auth_wedding_id()::text
  );

create policy documents_storage_delete on storage.objects
  for delete
  using (
    bucket_id = 'documents'
    and is_organiser_or_admin()
    and (storage.foldername(name))[1] = auth_wedding_id()::text
  );

-- ---------------------------------------------------------------------------
-- Metadata table. A document can be tagged with more than one context at
-- once (spec: "attachable to multiple relevant contexts without duplicating
-- the underlying file") via multiple nullable FKs on the same row, rather
-- than a separate join table — simpler, and every association still has
-- real referential integrity instead of a generic untyped entity_id.
-- ---------------------------------------------------------------------------
create table documents (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references weddings(id) on delete cascade,
  name text not null,
  storage_path text not null unique,
  file_type text,
  file_size bigint,
  event_id uuid references events(id) on delete set null,
  vendor_id uuid references vendors(id) on delete set null,
  expense_id uuid references expenses(id) on delete set null,
  guest_id uuid references guests(id) on delete set null,
  task_id uuid references tasks(id) on delete set null,
  uploaded_by uuid references people(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index documents_wedding_id_idx on documents(wedding_id);

alter table documents enable row level security;

create policy documents_select on documents
  for select
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin());

create policy documents_write on documents
  for all
  using (wedding_id = auth_wedding_id() and is_organiser_or_admin())
  with check (wedding_id = auth_wedding_id() and is_organiser_or_admin());
