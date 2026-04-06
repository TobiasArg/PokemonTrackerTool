-- Extensiones
create extension if not exists pgcrypto;

-- Tabla principal de runs
create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  game_key text not null default 'b2w2',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists runs_owner_idx on public.runs(owner_id);

-- Progreso de roadmap
create table if not exists public.run_zone_progress (
  run_id uuid not null references public.runs(id) on delete cascade,
  zone_id text not null,
  captured boolean not null default false,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (run_id, zone_id)
);

create index if not exists run_zone_progress_run_idx on public.run_zone_progress(run_id);

-- Estado de medallas
create table if not exists public.run_badges (
  run_id uuid not null references public.runs(id) on delete cascade,
  badge_id text not null,
  earned boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (run_id, badge_id)
);

create index if not exists run_badges_run_idx on public.run_badges(run_id);

-- Equipo elegido
create table if not exists public.run_chosen_pokemon (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs(id) on delete cascade,
  pokemon_name text not null,
  normalized_key text not null,
  created_at timestamptz not null default now(),
  unique (run_id, normalized_key)
);

create index if not exists run_chosen_pokemon_run_idx on public.run_chosen_pokemon(run_id);

-- Caidos
create table if not exists public.run_fallen_pokemon (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.runs(id) on delete cascade,
  name text not null,
  normalized_key text not null,
  level int not null check (level between 1 and 100),
  capture_zone text not null,
  cause text not null,
  created_at timestamptz not null default now()
);

create index if not exists run_fallen_pokemon_run_idx on public.run_fallen_pokemon(run_id);

-- Trigger updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_runs_updated_at on public.runs;
create trigger set_runs_updated_at
before update on public.runs
for each row execute function public.set_updated_at();

drop trigger if exists set_run_zone_progress_updated_at on public.run_zone_progress;
create trigger set_run_zone_progress_updated_at
before update on public.run_zone_progress
for each row execute function public.set_updated_at();

drop trigger if exists set_run_badges_updated_at on public.run_badges;
create trigger set_run_badges_updated_at
before update on public.run_badges
for each row execute function public.set_updated_at();

-- RLS
alter table public.runs enable row level security;
alter table public.run_zone_progress enable row level security;
alter table public.run_badges enable row level security;
alter table public.run_chosen_pokemon enable row level security;
alter table public.run_fallen_pokemon enable row level security;

-- Grants base (owner-authenticated only)
revoke all on table public.runs from anon;
revoke all on table public.run_zone_progress from anon;
revoke all on table public.run_badges from anon;
revoke all on table public.run_chosen_pokemon from anon;
revoke all on table public.run_fallen_pokemon from anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.runs to authenticated;
grant select, insert, update, delete on table public.run_zone_progress to authenticated;
grant select, insert, update, delete on table public.run_badges to authenticated;
grant select, insert, update, delete on table public.run_chosen_pokemon to authenticated;
grant select, insert, update, delete on table public.run_fallen_pokemon to authenticated;

-- Runs: owner only
drop policy if exists runs_owner_select on public.runs;
create policy runs_owner_select on public.runs
for select to authenticated using (owner_id = auth.uid());

drop policy if exists runs_owner_insert on public.runs;
create policy runs_owner_insert on public.runs
for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists runs_owner_update on public.runs;
create policy runs_owner_update on public.runs
for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists runs_owner_delete on public.runs;
create policy runs_owner_delete on public.runs
for delete to authenticated using (owner_id = auth.uid());

-- Child tables: access only if run belongs to user
drop policy if exists run_zone_progress_owner_all on public.run_zone_progress;
create policy run_zone_progress_owner_all on public.run_zone_progress
for all to authenticated using (
  exists (
    select 1 from public.runs r
    where r.id = run_zone_progress.run_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.runs r
    where r.id = run_zone_progress.run_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists run_badges_owner_all on public.run_badges;
create policy run_badges_owner_all on public.run_badges
for all to authenticated using (
  exists (
    select 1 from public.runs r
    where r.id = run_badges.run_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.runs r
    where r.id = run_badges.run_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists run_chosen_pokemon_owner_all on public.run_chosen_pokemon;
create policy run_chosen_pokemon_owner_all on public.run_chosen_pokemon
for all to authenticated using (
  exists (
    select 1 from public.runs r
    where r.id = run_chosen_pokemon.run_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.runs r
    where r.id = run_chosen_pokemon.run_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists run_fallen_pokemon_owner_all on public.run_fallen_pokemon;
create policy run_fallen_pokemon_owner_all on public.run_fallen_pokemon
for all to authenticated using (
  exists (
    select 1 from public.runs r
    where r.id = run_fallen_pokemon.run_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.runs r
    where r.id = run_fallen_pokemon.run_id
      and r.owner_id = auth.uid()
  )
);
