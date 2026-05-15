-- ============================================================
-- 0017_social_visibility_security.sql
-- コメント・リアクション閲覧制御のDB側強化
-- ============================================================

create or replace function public.can_view_social_sender(
  _daily_record_id uuid,
  _sender_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.daily_records dr
    join public.profiles sender on sender.id = _sender_id
    where dr.id = _daily_record_id
      and public.can_access_daily_record(_daily_record_id)
      and (
            (
              dr.student_id = auth.uid()
              and sender.role in ('coach', 'parent')
            )
         or (
              public.current_user_role() = 'coach'
              and public.is_coach_of_student(dr.student_id)
              and sender.role = 'coach'
            )
         or (
              public.current_user_role() = 'parent'
              and public.is_active_parent_of(dr.student_id)
              and sender.role = 'parent'
            )
      )
  );
$$;

drop policy if exists reactions_select on public.reactions;
create policy reactions_select
  on public.reactions for select to authenticated
  using (public.can_view_social_sender(daily_record_id, sender_id));

drop policy if exists comments_select on public.comments;
create policy comments_select
  on public.comments for select to authenticated
  using (public.can_view_social_sender(daily_record_id, sender_id));

create or replace function public.get_record_reactions(_daily_record_id uuid)
returns table(
  id uuid,
  emoji text,
  sender_id uuid,
  sender_name text,
  sender_role text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.emoji,
    r.sender_id,
    coalesce(p.display_name, '') as sender_name,
    p.role as sender_role,
    r.created_at
  from public.reactions r
  join public.profiles p on p.id = r.sender_id
  where r.daily_record_id = _daily_record_id
    and public.can_view_social_sender(r.daily_record_id, r.sender_id)
  order by r.created_at desc;
$$;

create or replace function public.get_record_comments(_daily_record_id uuid)
returns table(
  id uuid,
  text text,
  sender_name text,
  sender_role text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.text,
    coalesce(p.display_name, '') as sender_name,
    p.role as sender_role,
    c.created_at
  from public.comments c
  join public.profiles p on p.id = c.sender_id
  where c.daily_record_id = _daily_record_id
    and public.can_view_social_sender(c.daily_record_id, c.sender_id)
  order by c.created_at desc;
$$;

revoke all on function public.get_record_reactions(uuid) from public;
grant execute on function public.get_record_reactions(uuid) to authenticated;

revoke all on function public.get_record_comments(uuid) from public;
grant execute on function public.get_record_comments(uuid) to authenticated;
