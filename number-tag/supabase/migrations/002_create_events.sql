-- events テーブル（numbersより先に作成する必要がある）
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  created_by  uuid references auth.users(id) on delete set null,
  is_active   boolean not null default false,
  starts_at   timestamptz,
  ends_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- RLS
alter table public.events enable row level security;

-- アクティブなイベントは全認証ユーザーが参照可
create policy "select active events" on public.events
  for select to authenticated using (is_active = true);

-- 作成者のみ insert/update/delete
create policy "insert own event" on public.events
  for insert to authenticated with check (auth.uid() = created_by);

create policy "update own event" on public.events
  for update to authenticated
  using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "delete own event" on public.events
  for delete to authenticated using (auth.uid() = created_by);
