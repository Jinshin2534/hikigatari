-- user_profiles テーブル
create table public.user_profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  nickname       text not null default '',
  grade          smallint,
  class          text,
  face_image_url text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- updated_at 自動更新
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

-- 新規ユーザー登録時に自動でプロフィールレコード作成
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles(id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.user_profiles enable row level security;

-- 全認証ユーザーが参照可（カメラ画面でユーザー情報を取得するため）
create policy "select any profile" on public.user_profiles
  for select to authenticated using (true);

create policy "insert own profile" on public.user_profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "update own profile" on public.user_profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "delete own profile" on public.user_profiles
  for delete to authenticated using (auth.uid() = id);
