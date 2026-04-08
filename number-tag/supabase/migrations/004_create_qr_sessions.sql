-- qr_sessions テーブル
create table public.qr_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  token      text not null unique default encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz not null default (now() + interval '1 hour'),
  created_at timestamptz not null default now()
);

create index qr_sessions_token_idx on public.qr_sessions(token);
create index qr_sessions_user_id_idx on public.qr_sessions(user_id);

-- RLS
alter table public.qr_sessions enable row level security;

create policy "insert own qr session" on public.qr_sessions
  for insert to authenticated with check (auth.uid() = user_id);

-- 全認証ユーザーが有効期限内のトークンを参照可（スキャン解決のため）
create policy "select valid qr sessions" on public.qr_sessions
  for select to authenticated using (expires_at > now());

create policy "delete own qr session" on public.qr_sessions
  for delete to authenticated using (auth.uid() = user_id);

-- QRトークンを解決して、display_levelに応じた情報を返すRPC
create or replace function public.resolve_qr_token(p_token text)
returns json language sql security definer as $$
  select case n.display_level
    when 1 then json_build_object(
      'user_id', p.id,
      'number_value', n.number_value,
      'color', n.color
    )
    when 2 then json_build_object(
      'user_id', p.id,
      'number_value', n.number_value,
      'color', n.color,
      'nickname', p.nickname
    )
    when 3 then json_build_object(
      'user_id', p.id,
      'number_value', n.number_value,
      'color', n.color,
      'category', n.category,
      'nickname', p.nickname
    )
    when 4 then json_build_object(
      'user_id', p.id,
      'number_value', n.number_value,
      'color', n.color,
      'category', n.category,
      'meaning', n.meaning,
      'nickname', p.nickname
    )
    else null
  end
  from public.qr_sessions q
  join public.user_profiles p on p.id = q.user_id
  join public.numbers n on n.user_id = q.user_id
  where q.token = p_token
    and q.expires_at > now()
    and n.is_public = true;
$$;
