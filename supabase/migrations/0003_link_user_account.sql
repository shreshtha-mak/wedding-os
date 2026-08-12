-- Wedding OS — admin-driven People -> User Account linking.
--
-- Creating an actual login still has to happen in the Supabase dashboard
-- (Authentication -> Users): that's Supabase's admin API, gated behind the
-- service_role key, which must never reach the client. What CAN happen from
-- the app is everything else: creating the person, and — once an admin has
-- created their auth login by email — linking that login to the person's
-- record. This function is that link step, plpgsql/SECURITY DEFINER so it
-- can read auth.users, but gated on is_admin() so only admins can call it.

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

  update people set app_access = true where id = target_person_id;
end;
$$;

grant execute on function link_user_account(uuid, text) to authenticated;
