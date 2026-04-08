-- numbers テーブル
create table public.numbers (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  number_value  smallint not null check (number_value >= 0 and number_value <= 999),
  meaning       text,
  category      text not null default 'other',
  color         text not null default '#7c3aed',
  display_level smallint not null default 1 check (display_level between 1 and 4),
  is_public     boolean not null default true,
  event_id      uuid references public.events(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id)
);

create index numbers_user_id_idx on public.numbers(user_id);
create index numbers_event_id_idx on public.numbers(event_id);

create trigger numbers_updated_at
  before update on public.numbers
  for each row execute procedure public.handle_updated_at();

-- RLS
alter table public.numbers enable row level security;

-- is_public=true のものは全認証ユーザーが参照可、自分のものは常に参照可
create policy "select public numbers" on public.numbers
  for select to authenticated
  using (is_public = true or auth.uid() = user_id);

create policy "insert own number" on public.numbers
  for insert to authenticated with check (auth.uid() = user_id);

create policy "update own number" on public.numbers
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own number" on public.numbers
  for delete to authenticated using (auth.uid() = user_id);
