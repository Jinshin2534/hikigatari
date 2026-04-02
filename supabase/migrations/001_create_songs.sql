-- songs テーブル
create table public.songs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null default '',
  artist      text not null default '',
  original_key text not null default 'C',
  content     text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index songs_user_id_idx on public.songs(user_id);

-- updated_at 自動更新
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger songs_updated_at
  before update on public.songs
  for each row execute procedure public.handle_updated_at();

-- RLS
alter table public.songs enable row level security;

create policy "select own" on public.songs for select to authenticated
  using (auth.uid() = user_id);

create policy "insert own" on public.songs for insert to authenticated
  with check (auth.uid() = user_id);

create policy "update own" on public.songs for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own" on public.songs for delete to authenticated
  using (auth.uid() = user_id);
