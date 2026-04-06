-- Hardening v1: owner-only multiuser isolation and minimal DB guardrails.

-- Ensure RLS is enabled.
alter table if exists public.runs enable row level security;
alter table if exists public.run_zone_progress enable row level security;
alter table if exists public.run_badges enable row level security;
alter table if exists public.run_chosen_pokemon enable row level security;
alter table if exists public.run_fallen_pokemon enable row level security;

-- Restrict table DML to authenticated clients only.
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

-- Runs policies: owner-only.
drop policy if exists runs_owner_select on public.runs;
create policy runs_owner_select on public.runs
for select to authenticated
using (owner_id = auth.uid());

drop policy if exists runs_owner_insert on public.runs;
create policy runs_owner_insert on public.runs
for insert to authenticated
with check (owner_id = auth.uid());

drop policy if exists runs_owner_update on public.runs;
create policy runs_owner_update on public.runs
for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists runs_owner_delete on public.runs;
create policy runs_owner_delete on public.runs
for delete to authenticated
using (owner_id = auth.uid());

-- Child tables policies: only rows linked to owned runs.
drop policy if exists run_zone_progress_owner_all on public.run_zone_progress;
create policy run_zone_progress_owner_all on public.run_zone_progress
for all to authenticated
using (
  exists (
    select 1
    from public.runs r
    where r.id = run_zone_progress.run_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.runs r
    where r.id = run_zone_progress.run_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists run_badges_owner_all on public.run_badges;
create policy run_badges_owner_all on public.run_badges
for all to authenticated
using (
  exists (
    select 1
    from public.runs r
    where r.id = run_badges.run_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.runs r
    where r.id = run_badges.run_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists run_chosen_pokemon_owner_all on public.run_chosen_pokemon;
create policy run_chosen_pokemon_owner_all on public.run_chosen_pokemon
for all to authenticated
using (
  exists (
    select 1
    from public.runs r
    where r.id = run_chosen_pokemon.run_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.runs r
    where r.id = run_chosen_pokemon.run_id
      and r.owner_id = auth.uid()
  )
);

drop policy if exists run_fallen_pokemon_owner_all on public.run_fallen_pokemon;
create policy run_fallen_pokemon_owner_all on public.run_fallen_pokemon
for all to authenticated
using (
  exists (
    select 1
    from public.runs r
    where r.id = run_fallen_pokemon.run_id
      and r.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.runs r
    where r.id = run_fallen_pokemon.run_id
      and r.owner_id = auth.uid()
  )
);

-- Guardrail: gym leaders cannot hold capture flag.
create or replace function public.enforce_leader_capture_false()
returns trigger
language plpgsql
as $$
begin
  if new.zone_id = any(array[
    'cheren',
    'hiedra',
    'camus',
    'camila',
    'yakon',
    'gerania',
    'lirio',
    'ciprian'
  ]) then
    new.captured = false;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_leader_capture_false on public.run_zone_progress;
create trigger trg_enforce_leader_capture_false
before insert or update on public.run_zone_progress
for each row execute function public.enforce_leader_capture_false();

-- Useful read-order indexes by run timeline.
create index if not exists run_chosen_pokemon_run_created_idx
  on public.run_chosen_pokemon(run_id, created_at);

create index if not exists run_fallen_pokemon_run_created_idx
  on public.run_fallen_pokemon(run_id, created_at);

-- NOTE: badge irreversibility and catalog validation remain app-side in v1
-- to preserve backward compatibility with existing snapshots.
