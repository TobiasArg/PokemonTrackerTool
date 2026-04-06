import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'

import { authService } from '../services/authService'
import { runsService } from '../services/runsService'
import { snapshotService } from '../services/snapshotService'
import type { AuthStatus, RunSummary, SyncStatus, UserSession } from '../types/app'
import { normalizePokemonKey } from '../utils/pokemonNormalization'

export type FallenPokemon = {
  id: string
  name: string
  level: number
  captureZone: string
  cause: string
  createdAt: string
}

export type ChosenPokemon = {
  id: string
  pokemonName: string
  createdAt: string
}

export type RoadmapCheckpointType = 'zone' | 'leader'

export type RoadmapZone = {
  id: string
  name: string
  levelCap: number
  checkpoint: RoadmapCheckpointType
}

export type ZoneProgress = {
  captured: boolean
  completed: boolean
}

export type BadgeState = {
  id: string
  label: string
  earned: boolean
}

type AddFallenPokemonPayload = {
  name: string
  level: number
  captureZone: string
  cause: string
}

export type AddFallenPokemonResult = 'added' | 'invalid'
export type AddChosenPokemonResult =
  | 'added'
  | 'empty'
  | 'duplicate'
  | 'fallen'
  | 'limit-reached'

const LEGACY_LOCAL_STORAGE_KEY = 'nuzlocke-b2w2-tracker/v1'
const ACTIVE_RUN_STORAGE_PREFIX = 'nuzlocke-active-run/v1:'

const GYM_LEADER_ZONE_IDS = [
  'cheren',
  'hiedra',
  'camus',
  'camila',
  'yakon',
  'gerania',
  'lirio',
  'ciprian',
] as const

const GYM_LEADER_ZONE_ID_SET = new Set<string>(GYM_LEADER_ZONE_IDS)

export const isGymLeaderZone = (zoneId: string): boolean => {
  return GYM_LEADER_ZONE_ID_SET.has(zoneId)
}

export const canZoneCapture = (zoneId: string): boolean => {
  return !isGymLeaderZone(zoneId)
}

const BADGE_TO_LEADER_ZONE_MAP: Record<string, string> = {
  'badge-1': 'cheren',
  'badge-2': 'hiedra',
  'badge-3': 'camus',
  'badge-4': 'camila',
  'badge-5': 'yakon',
  'badge-6': 'gerania',
  'badge-7': 'lirio',
  'badge-8': 'ciprian',
}

const LEADER_ZONE_TO_BADGE_MAP = Object.fromEntries(
  Object.entries(BADGE_TO_LEADER_ZONE_MAP).map(([badgeId, zoneId]) => [zoneId, badgeId]),
)

export const ROADMAP_ZONES: RoadmapZone[] = [
  { id: 'inicio', name: 'Inicio', levelCap: 5, checkpoint: 'zone' },
  { id: 'ruta-19', name: 'Ruta 19', levelCap: 5, checkpoint: 'zone' },
  { id: 'ruta-20', name: 'Ruta 20', levelCap: 4, checkpoint: 'zone' },
  { id: 'rancho-ocre', name: 'Rancho Ocre', levelCap: 6, checkpoint: 'zone' },
  { id: 'cheren', name: 'Cheren', levelCap: 13, checkpoint: 'leader' },
  { id: 'ruta-20-segunda', name: 'Ruta 20 (2ª)', levelCap: 11, checkpoint: 'zone' },
  { id: 'poligono-hormigon', name: 'Polígono Hormigón', levelCap: 13, checkpoint: 'zone' },
  { id: 'hiedra', name: 'Hiedra', levelCap: 18, checkpoint: 'leader' },
  { id: 'cloacas-porcelana', name: 'Cloacas Porcelana', levelCap: 20, checkpoint: 'zone' },
  { id: 'pasadizo-ancestral', name: 'Pasadizo Ancestral', levelCap: 20, checkpoint: 'zone' },
  { id: 'camus', name: 'Camus', levelCap: 24, checkpoint: 'leader' },
  { id: 'ruta-4', name: 'Ruta 4', levelCap: 20, checkpoint: 'zone' },
  { id: 'zona-desierto', name: 'Zona Desierto', levelCap: 23, checkpoint: 'zone' },
  { id: 'castillo-ancestral', name: 'Castillo Ancestral', levelCap: 23, checkpoint: 'zone' },
  { id: 'ruta-16', name: 'Ruta 16', levelCap: 25, checkpoint: 'zone' },
  { id: 'camila', name: 'Camila', levelCap: 30, checkpoint: 'leader' },
  { id: 'ruta-5', name: 'Ruta 5', levelCap: 27, checkpoint: 'zone' },
  { id: 'yakon', name: 'Yakón', levelCap: 33, checkpoint: 'leader' },
  { id: 'ruta-6', name: 'Ruta 6', levelCap: 28, checkpoint: 'zone' },
  { id: 'cueva-loza', name: 'Cueva Loza', levelCap: 28, checkpoint: 'zone' },
  { id: 'cueva-electrorroca', name: 'Cueva Electrorroca', levelCap: 33, checkpoint: 'zone' },
  { id: 'gerania', name: 'Gerania', levelCap: 39, checkpoint: 'leader' },
  { id: 'ruta-7', name: 'Ruta 7', levelCap: 34, checkpoint: 'zone' },
  { id: 'torre-de-los-cielos', name: 'Torre de los Cielos', levelCap: 34, checkpoint: 'zone' },
  { id: 'montana-reversia', name: 'Montaña Reversia', levelCap: 41, checkpoint: 'zone' },
  { id: 'bahia-arenisca', name: 'Bahía Arenisca', levelCap: 41, checkpoint: 'zone' },
  { id: 'ruta-13', name: 'Ruta 13', levelCap: 41, checkpoint: 'zone' },
  { id: 'ruta-12', name: 'Ruta 12', levelCap: 42, checkpoint: 'zone' },
  { id: 'puente-villa', name: 'Puente Villa', levelCap: 44, checkpoint: 'zone' },
  { id: 'ruta-11', name: 'Ruta 11', levelCap: 44, checkpoint: 'zone' },
  { id: 'ruta-9', name: 'Ruta 9', levelCap: 44, checkpoint: 'zone' },
  { id: 'lirio', name: 'Lirio', levelCap: 48, checkpoint: 'leader' },
  { id: 'ciprian', name: 'Ciprián', levelCap: 51, checkpoint: 'leader' },
]

const ROADMAP_ZONE_MAP = new Map(ROADMAP_ZONES.map((zone) => [zone.id, zone]))

export const INITIAL_BADGES: BadgeState[] = [
  { id: 'badge-1', label: 'Medalla Cheren', earned: false },
  { id: 'badge-2', label: 'Medalla Hiedra', earned: false },
  { id: 'badge-3', label: 'Medalla Camus', earned: false },
  { id: 'badge-4', label: 'Medalla Camila', earned: false },
  { id: 'badge-5', label: 'Medalla Yakón', earned: false },
  { id: 'badge-6', label: 'Medalla Gerania', earned: false },
  { id: 'badge-7', label: 'Medalla Lirio', earned: false },
  { id: 'badge-8', label: 'Medalla Ciprián', earned: false },
]

type DomainState = {
  fallenPokemons: FallenPokemon[]
  chosenPokemons: ChosenPokemon[]
  zoneProgress: Record<string, ZoneProgress>
  badges: BadgeState[]
}

const createInitialZoneProgress = (): Record<string, ZoneProgress> => {
  return ROADMAP_ZONES.reduce<Record<string, ZoneProgress>>((accumulator, zone) => {
    accumulator[zone.id] = {
      captured: false,
      completed: false,
    }

    return accumulator
  }, {})
}

const createInitialDomainState = (): DomainState => {
  return {
    fallenPokemons: [],
    chosenPokemons: [],
    zoneProgress: createInitialZoneProgress(),
    badges: INITIAL_BADGES,
  }
}

const sanitizeNonEmpty = (value: string): string => value.trim()

const sanitizeLevel = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 1
  }

  return Math.max(1, Math.min(100, Math.floor(value)))
}

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isUuid = (value: string): boolean => {
  return UUID_V4_PATTERN.test(value)
}

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const ensureUuid = (value: string | null | undefined): string => {
  if (!value) {
    return generateId()
  }

  const trimmed = value.trim()
  return isUuid(trimmed) ? trimmed : generateId()
}

const getActiveRunStorageKey = (userId: string): string => {
  return `${ACTIVE_RUN_STORAGE_PREFIX}${userId}`
}

const getStoredActiveRunId = (userId: string): string | null => {
  return localStorage.getItem(getActiveRunStorageKey(userId))
}

const storeActiveRunId = (userId: string, runId: string | null): void => {
  const key = getActiveRunStorageKey(userId)

  if (!runId) {
    localStorage.removeItem(key)
    return
  }

  localStorage.setItem(key, runId)
}

const countCapturedZones = (progress: Record<string, ZoneProgress>): number => {
  return ROADMAP_ZONES.reduce((count, zone) => {
    if (!canZoneCapture(zone.id)) {
      return count
    }

    return progress[zone.id]?.captured ? count + 1 : count
  }, 0)
}

const clampChosenToCaptureLimit = (
  chosenPokemons: ChosenPokemon[],
  zoneProgress: Record<string, ZoneProgress>,
): ChosenPokemon[] => {
  const captureLimit = countCapturedZones(zoneProgress)
  if (chosenPokemons.length <= captureLimit) {
    return chosenPokemons
  }

  return chosenPokemons.slice(0, captureLimit)
}

const syncLeaderBadgesWithProgress = (
  badges: BadgeState[],
  zoneProgress: Record<string, ZoneProgress>,
): BadgeState[] => {
  return badges.map((badge) => {
    const zoneId = BADGE_TO_LEADER_ZONE_MAP[badge.id]

    if (!zoneId) {
      return badge
    }

    return {
      ...badge,
      earned: Boolean(zoneProgress[zoneId]?.completed),
    }
  })
}

const sanitizeDomainState = (domain: DomainState): DomainState => {
  const mergedZoneProgress = createInitialZoneProgress()

  for (const [zoneId, progress] of Object.entries(domain.zoneProgress ?? {})) {
    if (!ROADMAP_ZONE_MAP.has(zoneId)) {
      continue
    }

    if (isGymLeaderZone(zoneId)) {
      mergedZoneProgress[zoneId] = {
        captured: false,
        completed: Boolean(progress?.completed),
      }
      continue
    }

    mergedZoneProgress[zoneId] = {
      captured: Boolean(progress?.captured),
      completed: Boolean(progress?.completed),
    }
  }

  const hydratedBadges = INITIAL_BADGES.map((badge) => {
    const candidate = domain.badges?.find((item) => item.id === badge.id)
    return {
      ...badge,
      earned: candidate ? Boolean(candidate.earned) : badge.earned,
    }
  })

  // Badge history is irreversible: if a badge appears as earned, the linked leader stays completed.
  for (const badge of hydratedBadges) {
    if (!badge.earned) {
      continue
    }

    const linkedZoneId = BADGE_TO_LEADER_ZONE_MAP[badge.id]
    if (!linkedZoneId) {
      continue
    }

    const currentProgress = mergedZoneProgress[linkedZoneId]
    mergedZoneProgress[linkedZoneId] = {
      captured: false,
      completed: Boolean(currentProgress?.completed || badge.earned),
    }
  }

  const mergedBadges = syncLeaderBadgesWithProgress(hydratedBadges, mergedZoneProgress)

  const mergedFallenPokemons = (domain.fallenPokemons ?? [])
    .filter((candidate): candidate is FallenPokemon => {
      return Boolean(
        candidate?.id &&
          candidate?.name &&
          candidate?.captureZone &&
          candidate?.cause &&
          candidate?.createdAt,
      )
    })
    .map((candidate) => ({
      id: ensureUuid(candidate.id),
      name: sanitizeNonEmpty(candidate.name),
      level: sanitizeLevel(candidate.level),
      captureZone: sanitizeNonEmpty(candidate.captureZone),
      cause: sanitizeNonEmpty(candidate.cause),
      createdAt: candidate.createdAt,
    }))
    .filter((candidate) => Boolean(candidate.name && candidate.captureZone && candidate.cause))

  const fallenNameKeys = new Set(
    mergedFallenPokemons.map((pokemon) => normalizePokemonKey(pokemon.name)),
  )

  const mergedChosenPokemons = (domain.chosenPokemons ?? [])
    .filter((candidate): candidate is ChosenPokemon => {
      return Boolean(candidate?.id && candidate?.pokemonName && candidate?.createdAt)
    })
    .map((candidate) => ({
      id: ensureUuid(candidate.id),
      pokemonName: sanitizeNonEmpty(candidate.pokemonName),
      createdAt: candidate.createdAt,
    }))
    .filter((candidate) => candidate.pokemonName.length > 0)
    .filter((candidate) => !fallenNameKeys.has(normalizePokemonKey(candidate.pokemonName)))

  return {
    fallenPokemons: mergedFallenPokemons,
    chosenPokemons: clampChosenToCaptureLimit(mergedChosenPokemons, mergedZoneProgress),
    zoneProgress: mergedZoneProgress,
    badges: mergedBadges,
  }
}

const parseLegacyDomainState = (): DomainState | null => {
  const raw = localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as {
      state?: Partial<DomainState>
    } & Partial<DomainState>

    const legacyState = (parsed.state ?? parsed) as Partial<DomainState>

    return sanitizeDomainState({
      fallenPokemons: legacyState.fallenPokemons ?? [],
      chosenPokemons: legacyState.chosenPokemons ?? [],
      zoneProgress: legacyState.zoneProgress ?? createInitialZoneProgress(),
      badges: legacyState.badges ?? INITIAL_BADGES,
    })
  } catch {
    return null
  }
}

export type NuzlockeStoreState = DomainState & {
  authStatus: AuthStatus
  isBootstrapped: boolean
  session: UserSession | null
  rawSession: Session | null
  runs: RunSummary[]
  activeRunId: string | null
  syncStatus: SyncStatus
  syncError: string | null
  lastSyncedAt: string | null
  isHydratingRunData: boolean
  dataRevision: number
  lastPersistedRevision: number
  bootstrap: () => Promise<void>
  loadRuns: () => Promise<void>
  createRun: (name: string) => Promise<RunSummary | null>
  renameRun: (runId: string, name: string) => Promise<void>
  archiveRun: (runId: string, archived: boolean) => Promise<void>
  deleteRun: (runId: string) => Promise<void>
  setActiveRun: (runId: string | null) => Promise<void>
  loadActiveRunSnapshot: () => Promise<void>
  persistActiveRunSnapshot: () => Promise<void>
  retrySync: () => Promise<void>
  migrateLegacyLocalState: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  signUp: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  signOut: () => Promise<void>
  applySignedOutState: () => void
  clearSyncError: () => void
  addFallenPokemon: (payload: AddFallenPokemonPayload) => AddFallenPokemonResult
  removeFallenPokemon: (id: string) => void
  addChosenPokemon: (pokemonName: string) => AddChosenPokemonResult
  removeChosenPokemon: (id: string) => void
  trimChosenPokemons: (limit: number) => void
  toggleZoneProgress: (zoneId: string, field: keyof ZoneProgress) => void
  toggleBadge: (badgeId: string) => void
}

const initialDomainState = createInitialDomainState()

const toUserSession = (session: Session | null): UserSession | null => {
  if (!session) {
    return null
  }

  return {
    userId: session.user.id,
    email: session.user.email ?? null,
  }
}

const createUnauthenticatedState = (
  syncStatus: SyncStatus,
  syncError: string | null,
): Pick<
  NuzlockeStoreState,
  | 'fallenPokemons'
  | 'chosenPokemons'
  | 'zoneProgress'
  | 'badges'
  | 'authStatus'
  | 'isBootstrapped'
  | 'session'
  | 'rawSession'
  | 'runs'
  | 'activeRunId'
  | 'syncStatus'
  | 'syncError'
  | 'isHydratingRunData'
  | 'dataRevision'
  | 'lastPersistedRevision'
  | 'lastSyncedAt'
> => {
  return {
    ...createInitialDomainState(),
    authStatus: 'unauthenticated',
    isBootstrapped: true,
    session: null,
    rawSession: null,
    runs: [],
    activeRunId: null,
    syncStatus,
    syncError,
    isHydratingRunData: false,
    dataRevision: 0,
    lastPersistedRevision: 0,
    lastSyncedAt: null,
  }
}

export const useNuzlockeStore = create<NuzlockeStoreState>()((set, get) => ({
  ...initialDomainState,
  authStatus: 'loading',
  isBootstrapped: false,
  session: null,
  rawSession: null,
  runs: [],
  activeRunId: null,
  syncStatus: 'idle',
  syncError: null,
  lastSyncedAt: null,
  isHydratingRunData: false,
  dataRevision: 0,
  lastPersistedRevision: 0,

  bootstrap: async () => {
    set({ authStatus: 'loading', syncError: null })

    let session: Session | null = null
    let userSession: UserSession | null = null
    try {
      session = await authService.getSession()
      userSession = toUserSession(session)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo validar la sesión.'
      set(createUnauthenticatedState('error', message))
      return
    }

    if (!session || !userSession) {
      set(createUnauthenticatedState('idle', null))
      return
    }

    set({
      authStatus: 'authenticated',
      session: userSession,
      rawSession: session,
    })

    try {
      await get().loadRuns()
      await get().migrateLegacyLocalState()
      await get().loadRuns()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudieron cargar tus runs.'
      set({
        isBootstrapped: true,
        syncStatus: 'error',
        syncError: message,
      })
      return
    }

    let nextRuns = get().runs
    if (nextRuns.length === 0) {
      try {
        const created = await get().createRun('Mi primera run')
        if (created) {
          nextRuns = [created]
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No se pudo crear la run inicial.'
        set({
          isBootstrapped: true,
          syncStatus: 'error',
          syncError: message,
        })
        return
      }
    }

    if (nextRuns.length === 0) {
      set({ isBootstrapped: true, syncStatus: 'idle' })
      return
    }

    const preferredRunId = getStoredActiveRunId(userSession.userId)
    const chosenRun = nextRuns.find((run) => run.id === preferredRunId) ?? nextRuns[0]

    try {
      await get().setActiveRun(chosenRun.id)
      set({ isBootstrapped: true })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo abrir la run activa.'
      set({
        isBootstrapped: true,
        activeRunId: chosenRun.id,
        syncStatus: 'error',
        syncError: message,
      })
    }
  },

  loadRuns: async () => {
    if (!get().session) {
      set({ runs: [] })
      return
    }

    const runs = await runsService.listRuns()
    set({ runs })
  },

  createRun: async (name) => {
    if (!get().session) {
      return null
    }

    const run = await runsService.createRun(name)
    set((state) => ({
      runs: [...state.runs, run],
    }))

    return run
  },

  renameRun: async (runId, name) => {
    await runsService.renameRun(runId, name)
    set((state) => ({
      runs: state.runs.map((run) => {
        if (run.id !== runId) {
          return run
        }

        return {
          ...run,
          name: sanitizeNonEmpty(name) || run.name,
        }
      }),
    }))
  },

  archiveRun: async (runId, archived) => {
    await runsService.archiveRun(runId, archived)
    set((state) => ({
      runs: state.runs.map((run) => {
        if (run.id !== runId) {
          return run
        }

        return {
          ...run,
          isArchived: archived,
        }
      }),
    }))
  },

  deleteRun: async (runId) => {
    await runsService.deleteRun(runId)

    const state = get()
    const nextRuns = state.runs.filter((run) => run.id !== runId)

    set({ runs: nextRuns })

    if (state.activeRunId !== runId) {
      return
    }

    const fallback = nextRuns[0]
    if (!fallback) {
      set({
        ...createInitialDomainState(),
        activeRunId: null,
        syncStatus: 'idle',
        isHydratingRunData: false,
        dataRevision: 0,
        lastPersistedRevision: 0,
      })

      if (state.session) {
        storeActiveRunId(state.session.userId, null)
      }

      return
    }

    await get().setActiveRun(fallback.id)
  },

  setActiveRun: async (runId) => {
    const state = get()

    if (!state.session) {
      set({ activeRunId: null })
      return
    }

    if (!runId) {
      storeActiveRunId(state.session.userId, null)
      set({
        activeRunId: null,
        ...createInitialDomainState(),
        syncStatus: 'idle',
        isHydratingRunData: false,
        dataRevision: 0,
        lastPersistedRevision: 0,
      })
      return
    }

    storeActiveRunId(state.session.userId, runId)
    set({ activeRunId: runId })

    await get().loadActiveRunSnapshot()
  },

  loadActiveRunSnapshot: async () => {
    const { activeRunId } = get()

    if (!activeRunId) {
      return
    }

    set({ syncStatus: 'loading', syncError: null, isHydratingRunData: true })

    try {
      const snapshot = await snapshotService.getRunSnapshot(activeRunId)
      const sanitized = sanitizeDomainState({
        fallenPokemons: snapshot.fallenPokemons,
        chosenPokemons: snapshot.chosenPokemons,
        zoneProgress: snapshot.zoneProgress,
        badges: INITIAL_BADGES.map((badge) => {
          const saved = snapshot.badges.find((item) => item.id === badge.id)
          return {
            ...badge,
            earned: saved ? saved.earned : badge.earned,
          }
        }),
      })

      set((state) => ({
        ...sanitized,
        runs: state.runs.map((run) => (run.id === snapshot.run.id ? snapshot.run : run)),
        syncStatus: 'idle',
        syncError: null,
        isHydratingRunData: false,
        dataRevision: 0,
        lastPersistedRevision: 0,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo cargar la run.'
      set({ syncStatus: 'error', syncError: message, isHydratingRunData: false })
    }
  },

  persistActiveRunSnapshot: async () => {
    const state = get()

    if (!state.session || !state.activeRunId) {
      return
    }

    set({ syncStatus: 'saving', syncError: null })

    try {
      await snapshotService.saveRunSnapshot(state.activeRunId, {
        zoneProgress: state.zoneProgress,
        badges: state.badges.map((badge) => ({
          id: badge.id,
          earned: badge.earned,
        })),
        chosenPokemons: state.chosenPokemons,
        fallenPokemons: state.fallenPokemons,
      })

      set({
        syncStatus: 'idle',
        lastSyncedAt: new Date().toISOString(),
        syncError: null,
        lastPersistedRevision: state.dataRevision,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar la run.'
      set({ syncStatus: 'error', syncError: message })
    }
  },

  retrySync: async () => {
    const state = get()

    if (state.authStatus !== 'authenticated') {
      return
    }

    set({ syncError: null })

    if (state.activeRunId) {
      if (state.dataRevision > state.lastPersistedRevision) {
        await get().persistActiveRunSnapshot()
        return
      }

      await get().loadActiveRunSnapshot()
      return
    }

    await get().loadRuns()

    const nextRuns = get().runs
    if (!nextRuns.length) {
      const created = await get().createRun('Mi primera run')
      if (!created) {
        return
      }

      await get().setActiveRun(created.id)
      return
    }

    const userId = get().session?.userId
    const preferredRunId = userId ? getStoredActiveRunId(userId) : null
    const chosenRun = nextRuns.find((run) => run.id === preferredRunId) ?? nextRuns[0]
    await get().setActiveRun(chosenRun.id)
  },

  migrateLegacyLocalState: async () => {
    const state = get()
    if (!state.rawSession || !state.session) {
      return
    }

    const hasMigrationFlag = Boolean(state.rawSession.user.user_metadata?.migration_done_v1)
    if (hasMigrationFlag) {
      return
    }

    const legacyDomainState = parseLegacyDomainState()
    if (!legacyDomainState) {
      await authService.markLegacyMigrationDone()
      const refreshedSession = await authService.getSession()
      set({
        rawSession: refreshedSession,
        session: toUserSession(refreshedSession),
      })
      return
    }

    const existingMigratedRun = state.runs.find((run) => run.name === 'Run migrada')
    const targetRun = existingMigratedRun ?? (await runsService.createRun('Run migrada'))

    await snapshotService.saveRunSnapshot(targetRun.id, {
      zoneProgress: legacyDomainState.zoneProgress,
      badges: legacyDomainState.badges.map((badge) => ({
        id: badge.id,
        earned: badge.earned,
      })),
      chosenPokemons: legacyDomainState.chosenPokemons,
      fallenPokemons: legacyDomainState.fallenPokemons,
    })

    await authService.markLegacyMigrationDone()
    const refreshedSession = await authService.getSession()

    set((current) => ({
      rawSession: refreshedSession,
      session: toUserSession(refreshedSession),
      runs: current.runs.some((run) => run.id === targetRun.id)
        ? current.runs
        : [...current.runs, targetRun],
    }))
  },

  signIn: async (email, password) => {
    try {
      const session = await authService.signIn(email, password)
      if (!session) {
        return {
          ok: false,
          error: 'No se pudo iniciar sesión. Verifica tus credenciales.',
        } as const
      }

      set({
        authStatus: 'loading',
        syncError: null,
      })

      await get().bootstrap()
      const nextState = get()
      if (nextState.authStatus !== 'authenticated') {
        return {
          ok: false,
          error: nextState.syncError ?? 'No se pudo iniciar la sesión en la app.',
        } as const
      }

      return { ok: true } as const
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'No se pudo iniciar sesión.',
      } as const
    }
  },

  signUp: async (email, password) => {
    try {
      const session = await authService.signUp(email, password)
      if (!session) {
        return {
          ok: false,
          error:
            'Cuenta creada. Revisa tu email para confirmar la cuenta y luego inicia sesión.',
        } as const
      }

      set({
        authStatus: 'loading',
        syncError: null,
      })

      await get().bootstrap()
      const nextState = get()
      if (nextState.authStatus !== 'authenticated') {
        return {
          ok: false,
          error: nextState.syncError ?? 'No se pudo completar el registro.',
        } as const
      }

      return { ok: true } as const
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'No se pudo registrar la cuenta.',
      } as const
    }
  },

  signOut: async () => {
    await authService.signOut()

    get().applySignedOutState()
  },

  applySignedOutState: () => {
    const state = get()
    if (state.session) {
      storeActiveRunId(state.session.userId, null)
    }

    set(createUnauthenticatedState('idle', null))
  },

  clearSyncError: () => {
    set({ syncError: null })
  },

  addFallenPokemon: (payload) => {
    const state = get()
    if (!state.activeRunId) {
      return 'invalid'
    }

    const name = sanitizeNonEmpty(payload.name)
    const captureZone = sanitizeNonEmpty(payload.captureZone)
    const cause = sanitizeNonEmpty(payload.cause)

    if (!name || !captureZone || !cause) {
      return 'invalid'
    }

    const fallenKey = normalizePokemonKey(name)

    set((current) => ({
      fallenPokemons: [
        {
          id: generateId(),
          name,
          level: sanitizeLevel(payload.level),
          captureZone,
          cause,
          createdAt: new Date().toISOString(),
        },
        ...current.fallenPokemons,
      ],
      chosenPokemons: current.chosenPokemons.filter((item) => {
        return normalizePokemonKey(item.pokemonName) !== fallenKey
      }),
      dataRevision: current.dataRevision + 1,
    }))

    return 'added'
  },

  removeFallenPokemon: (id) => {
    const state = get()
    if (!state.activeRunId) {
      return
    }

    set((current) => ({
      fallenPokemons: current.fallenPokemons.filter((item) => item.id !== id),
      dataRevision: current.dataRevision + 1,
    }))
  },

  addChosenPokemon: (pokemonName) => {
    const state = get()
    if (!state.activeRunId) {
      return 'limit-reached'
    }

    const normalizedName = sanitizeNonEmpty(pokemonName)

    if (!normalizedName) {
      return 'empty'
    }

    const captureLimit = countCapturedZones(state.zoneProgress)
    if (state.chosenPokemons.length >= captureLimit) {
      return 'limit-reached'
    }

    const normalizedKey = normalizePokemonKey(normalizedName)
    const fallenNames = new Set(
      state.fallenPokemons.map((item) => normalizePokemonKey(item.name)),
    )

    if (fallenNames.has(normalizedKey)) {
      return 'fallen'
    }

    const hasDuplicate = state.chosenPokemons.some((item) => {
      return normalizePokemonKey(item.pokemonName) === normalizedKey
    })

    if (hasDuplicate) {
      return 'duplicate'
    }

    set((current) => ({
      chosenPokemons: [
        ...current.chosenPokemons,
        {
          id: generateId(),
          pokemonName: normalizedName,
          createdAt: new Date().toISOString(),
        },
      ],
      dataRevision: current.dataRevision + 1,
    }))

    return 'added'
  },

  removeChosenPokemon: (id) => {
    const state = get()
    if (!state.activeRunId) {
      return
    }

    set((current) => ({
      chosenPokemons: current.chosenPokemons.filter((item) => item.id !== id),
      dataRevision: current.dataRevision + 1,
    }))
  },

  trimChosenPokemons: (limit) => {
    const state = get()
    if (!state.activeRunId) {
      return
    }

    const normalizedLimit = Math.max(0, Math.floor(limit))

    set((current) => {
      if (current.chosenPokemons.length <= normalizedLimit) {
        return current
      }

      return {
        chosenPokemons: current.chosenPokemons.slice(0, normalizedLimit),
        dataRevision: current.dataRevision + 1,
      }
    })
  },

  toggleZoneProgress: (zoneId, field) => {
    const state = get()
    if (!state.activeRunId) {
      return
    }

    set((current) => {
      const zone = ROADMAP_ZONE_MAP.get(zoneId)

      if (!zone) {
        return current
      }

      const currentProgress =
        current.zoneProgress[zoneId] ??
        ({
          captured: false,
          completed: false,
        } satisfies ZoneProgress)

      if (zone.checkpoint === 'leader') {
        if (field !== 'completed') {
          return current
        }

        if (currentProgress.completed) {
          return current
        }

        const completed = true
        const nextZoneProgress = {
          ...current.zoneProgress,
          [zoneId]: {
            captured: false,
            completed,
          },
        }

        const badgeId = LEADER_ZONE_TO_BADGE_MAP[zoneId]
        const nextBadges = badgeId
          ? current.badges.map((badge) => {
              if (badge.id !== badgeId) {
                return badge
              }

              return {
                ...badge,
                earned: completed,
              }
            })
          : current.badges

        return {
          zoneProgress: nextZoneProgress,
          badges: nextBadges,
          chosenPokemons: clampChosenToCaptureLimit(current.chosenPokemons, nextZoneProgress),
          dataRevision: current.dataRevision + 1,
        }
      }

      const nextProgress = { ...currentProgress }

      if (field === 'captured') {
        nextProgress.captured = !currentProgress.captured
      }

      if (field === 'completed') {
        nextProgress.completed = !currentProgress.completed
      }

      const nextZoneProgress = {
        ...current.zoneProgress,
        [zoneId]: nextProgress,
      }

      return {
        zoneProgress: nextZoneProgress,
        chosenPokemons: clampChosenToCaptureLimit(current.chosenPokemons, nextZoneProgress),
        dataRevision: current.dataRevision + 1,
      }
    })
  },

  toggleBadge: (badgeId) => {
    const state = get()
    if (!state.activeRunId) {
      return
    }

    set((current) => {
      let hasActivation = false

      const nextBadges = current.badges.map((badge) => {
        if (badge.id !== badgeId) {
          return badge
        }

        if (badge.earned) {
          return badge
        }

        hasActivation = true

        return {
          ...badge,
          earned: true,
        }
      })

      if (!hasActivation) {
        return current
      }

      const linkedZoneId = BADGE_TO_LEADER_ZONE_MAP[badgeId]
      if (!linkedZoneId) {
        return {
          badges: nextBadges,
          dataRevision: current.dataRevision + 1,
        }
      }

      const currentProgress =
        current.zoneProgress[linkedZoneId] ??
        ({
          captured: false,
          completed: false,
        } satisfies ZoneProgress)

      return {
        badges: nextBadges,
        zoneProgress: {
          ...current.zoneProgress,
          [linkedZoneId]: {
            ...currentProgress,
            captured: false,
            completed: true,
          },
        },
        dataRevision: current.dataRevision + 1,
      }
    })
  },
}))
