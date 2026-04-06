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
Crea `.env` en raíz:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## SQL de base de datos
Ejecuta en orden en Supabase SQL Editor:

- `supabase/schema.sql`
- `supabase/migrations/20260328_001_hardening.sql`

Incluye:
- Tablas `runs`, `run_zone_progress`, `run_badges`, `run_chosen_pokemon`, `run_fallen_pokemon`
- Triggers `updated_at`
- RLS owner-only con policies `to authenticated`
- Hardening de grants (sin DML para `anon`)
- Guardrail DB: líderes sin `captured=true`

## Scripts
```bash
npm install
npm run dev
npm run lint
npm run build
npm run test:unit
```

E2E:
```bash
npm run test:e2e:install
E2E_BASE_URL=http://127.0.0.1:5173 \
E2E_USER_A_EMAIL=... \
E2E_USER_A_PASSWORD=... \
E2E_USER_B_EMAIL=... \
E2E_USER_B_PASSWORD=... \
npm run test:e2e
```

Gate estricto (falla si faltan credenciales E2E):
```bash
npm run test:e2e:required
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

## Configuración Auth en Supabase (producción)
1. Auth > Providers: desactiva providers no usados.
2. Auth > Email: activar confirmación de email (`Confirm email`).
3. Auth > URL Configuration:
- `Site URL`: URL de Vercel producción.
- `Redirect URLs`: incluye `http://localhost:5173/*` y la URL de Vercel `/*`.
4. Revisar template de email de confirmación.

## Checklist de salida a producción
1. Ejecutar SQL base + hardening en proyecto Supabase de producción.
2. Confirmar que usuario A no puede leer/modificar runs de B.
3. Ejecutar `npm run lint`, `npm run build`, `npm run test:unit`.
4. Ejecutar E2E core multiusuario con dos cuentas reales (`npm run test:e2e:required`).
5. Smoke manual:
- Registro con confirmación de email.
- Login y creación de primera run.
- Persistencia entre dispositivos del mismo usuario.
- Refresh/token refresh sin rebote a login.
