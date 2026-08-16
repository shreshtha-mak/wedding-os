-- Wedding OS — Email is a User attribute, not a Family/Guest attribute.
--
-- Previously `people.email` could be typed in directly from the Family
-- "Add person" form, entirely separate from actually linking a login —
-- so a person could have an email on file with no account, and linking a
-- login didn't set it either. Family and Guests should never offer an
-- email field; the only path that populates people.email is genuinely
-- granting someone a login via link_user_account.

create or replace function link_user_account(target_person_id uuid, target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_user_id uuid;
  target_wedding_id uuid;
begin
  if not is_admin() then
    raise exception 'Only admins can link user accounts';
  end if;

  select wedding_id into target_wedding_id from people where id = target_person_id;
  if target_wedding_id is null or target_wedding_id != auth_wedding_id() then
    raise exception 'Person not found in your wedding';
  end if;

  select id into auth_user_id from auth.users where email = target_email;
  if auth_user_id is null then
    raise exception 'No login found for %. Create it first in Supabase Authentication -> Users.', target_email;
  end if;

  insert into user_accounts (id, person_id, login_email)
  values (auth_user_id, target_person_id, target_email);

  update people set app_access = true, email = target_email where id = target_person_id;
end;
$$;
