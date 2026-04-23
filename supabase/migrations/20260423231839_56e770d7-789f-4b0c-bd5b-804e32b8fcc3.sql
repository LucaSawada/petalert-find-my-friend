
-- Enums
create type public.app_role as enum ('admin', 'user');
create type public.pet_species as enum ('dog', 'cat', 'other');
create type public.pet_status as enum ('active', 'found');

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- user_roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users view own roles"
  on public.user_roles for select using (auth.uid() = user_id);

-- pets
create table public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  species pet_species not null,
  breed text,
  color text,
  size text,
  description text,
  photo_url text,
  latitude double precision,
  longitude double precision,
  address text,
  reward text,
  alt_contact text,
  status pet_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  found_at timestamptz,
  found_message text
);
alter table public.pets enable row level security;

create policy "Pets are viewable by everyone"
  on public.pets for select using (true);
create policy "Authenticated users can create pets"
  on public.pets for insert with check (auth.uid() = user_id);
create policy "Owners can update their pets"
  on public.pets for update using (auth.uid() = user_id);
create policy "Owners can delete their pets"
  on public.pets for delete using (auth.uid() = user_id);

create index idx_pets_status on public.pets(status);
create index idx_pets_created on public.pets(created_at desc);

-- messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

create policy "Participants can read messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Sender can insert messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);
create policy "Receiver can mark as read"
  on public.messages for update
  using (auth.uid() = receiver_id);

create index idx_messages_pet on public.messages(pet_id);

-- updated_at trigger
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger pets_updated_at before update on public.pets
  for each row execute function public.handle_updated_at();

-- handle new user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- realtime
alter publication supabase_realtime add table public.pets;
alter publication supabase_realtime add table public.messages;
alter table public.pets replica identity full;
alter table public.messages replica identity full;

-- storage bucket
insert into storage.buckets (id, name, public) values ('pet-photos', 'pet-photos', true);

create policy "Pet photos publicly readable"
  on storage.objects for select using (bucket_id = 'pet-photos');
create policy "Authenticated users can upload pet photos"
  on storage.objects for insert
  with check (bucket_id = 'pet-photos' and auth.uid() is not null);
create policy "Users can update own pet photos"
  on storage.objects for update
  using (bucket_id = 'pet-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete own pet photos"
  on storage.objects for delete
  using (bucket_id = 'pet-photos' and auth.uid()::text = (storage.foldername(name))[1]);
