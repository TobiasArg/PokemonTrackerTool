# Nuzlocke Tracker B2W2

SPA mobile-first para trackear runs Nuzlocke de Pokémon Blanco/Negro 2.

## Stack
- React + TypeScript + Vite
- Zustand para estado de dominio
- Supabase (Auth + Postgres + RLS)
- PokeAPI para datos visuales de Pokémon

## Requisitos
- Node 18+
- Proyecto Supabase creado

## Variables de entorno
Crea `.env` en raíz usando `.env.example`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## SQL de base de datos
Ejecuta el schema en Supabase SQL Editor:

- `supabase/schema.sql`

Incluye:
- Tablas `runs`, `run_zone_progress`, `run_badges`, `run_chosen_pokemon`, `run_fallen_pokemon`
- Triggers `updated_at`
- RLS para owner-only

## Scripts
```bash
npm install
npm run dev
npm run lint
npm run build
```

## Flujo funcional implementado
- Login/registro
- Gestión de runs (crear, renombrar, archivar, eliminar)
- Selección de run activa
- Sync cloud de equipo, caídos, roadmap y medallas
- Migración automática de estado local legacy (`nuzlocke-b2w2-tracker/v1`) a “Run migrada”

## Estructura relevante
- `src/lib/supabase.ts`
- `src/services/authService.ts`
- `src/services/runsService.ts`
- `src/services/snapshotService.ts`
- `src/hooks/useNuzlockeStore.ts`
- `src/pages/AuthPage.tsx`
- `src/pages/RunsPage.tsx`

## Notas v1
- Scope: dueño único por run (sin colaboración multi-editor)
- Resolución de conflictos: last-write-wins
- Requiere conexión para persistencia cloud
