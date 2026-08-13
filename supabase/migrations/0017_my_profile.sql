-- Wedding OS — self-service profile editing.
--
-- people_write (0002) is admin-only, so a regular user can't update even
-- their own name/phone directly. Rather than a self-referential RLS policy
-- (fragile: has to prevent someone editing their own role/app_access via
-- the same UPDATE), this is a narrow RPC that only ever touches the
-- caller's own row and only these two columns — same shape as
-- touch_last_login and link_user_account.

create or replace function update_my_profile(p_name text, p_phone text)
returns void
language sql
security definer
set search_path = public
as $$
  update people set name = p_name, phone = p_phone where id = auth_person_id();
$$;

grant execute on function update_my_profile(text, text) to authenticated;
