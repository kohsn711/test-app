-- ============================================================
-- 0014_parent_password_login.sql
-- 保護者は初回招待OTPで本人確認し、以降はパスワードでログインする。
-- 既存保護者への追加招待は parent_id 付き pending として作成する。
-- ============================================================

create or replace function public.create_parent_invite(_email text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  normalized_email text := lower(trim(coalesce(_email, '')));
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  existing_user_id uuid;
  existing_role text;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if public.current_user_role() is distinct from 'student' then
    raise exception 'only_students_can_invite_parent' using errcode = '42501';
  end if;

  if normalized_email = '' or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'invalid_email' using errcode = '22000';
  end if;

  if current_email = normalized_email then
    raise exception 'cannot_invite_self' using errcode = '23514';
  end if;

  select u.id, p.role
    into existing_user_id, existing_role
  from auth.users u
  left join public.profiles p on p.id = u.id
  where lower(u.email) = normalized_email
  limit 1;

  if existing_role is not null and existing_role <> 'parent' then
    raise exception 'email_already_used_by_non_parent' using errcode = '23514';
  end if;

  if existing_role = 'parent' then
    insert into public.parent_child_links (
      student_id,
      parent_id,
      invited_email,
      status
    ) values (
      auth.uid(),
      existing_user_id,
      normalized_email,
      'pending'
    );

    return 'existing_parent';
  end if;

  insert into public.parent_child_links (
    student_id,
    parent_id,
    invited_email,
    status
  ) values (
    auth.uid(),
    null,
    normalized_email,
    'pending'
  );

  return 'new_parent';
end;
$$;

revoke all on function public.create_parent_invite(text) from public;
grant execute on function public.create_parent_invite(text) to authenticated;

drop policy if exists pcl_update_parent_approve on public.parent_child_links;

create policy pcl_update_parent_approve
  on public.parent_child_links for update to authenticated
  using (
    status = 'pending'
    and public.current_user_role() = 'parent'
    and (
         auth.uid() = parent_id
      or (
        parent_id is null
        and lower(invited_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
    )
  )
  with check (
    auth.uid() = parent_id
    and status = 'active'
  );
