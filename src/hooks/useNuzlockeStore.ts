import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export type NuzlockeStoreState = {
  fallenPokemons: FallenPokemon[]
  chosenPokemons: ChosenPokemon[]
  zoneProgress: Record<string, ZoneProgress>
  badges: BadgeState[]
  addFallenPokemon: (payload: AddFallenPokemonPayload) => AddFallenPokemonResult
  removeFallenPokemon: (id: string) => void
  addChosenPokemon: (pokemonName: string) => AddChosenPokemonResult
  removeChosenPokemon: (id: string) => void
  trimChosenPokemons: (limit: number) => void
  toggleZoneProgress: (zoneId: string, field: keyof ZoneProgress) => void
  toggleBadge: (badgeId: string) => void
}

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

const createInitialZoneProgress = (): Record<string, ZoneProgress> => {
  return ROADMAP_ZONES.reduce<Record<string, ZoneProgress>>((accumulator, zone) => {
    accumulator[zone.id] = {
      captured: false,
      completed: false,
    }

    return accumulator
  }, {})
}

const sanitizeNonEmpty = (value: string): string => value.trim()

const sanitizeLevel = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 1
  }

  return Math.max(1, Math.min(100, Math.floor(value)))
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

export const useNuzlockeStore = create<NuzlockeStoreState>()(
  persist(
    (set) => ({
      fallenPokemons: [],
      chosenPokemons: [],
      zoneProgress: createInitialZoneProgress(),
      badges: INITIAL_BADGES,
      addFallenPokemon: (payload) => {
        let result: AddFallenPokemonResult = 'invalid'

        set((state) => {
          const name = sanitizeNonEmpty(payload.name)
          const captureZone = sanitizeNonEmpty(payload.captureZone)
          const cause = sanitizeNonEmpty(payload.cause)

          if (!name || !captureZone || !cause) {
            return state
          }

          result = 'added'
          const fallenKey = normalizePokemonKey(name)

          return {
            fallenPokemons: [
              {
                id: nanoid(),
                name,
                level: sanitizeLevel(payload.level),
                captureZone,
                cause,
                createdAt: new Date().toISOString(),
              },
              ...state.fallenPokemons,
            ],
            chosenPokemons: state.chosenPokemons.filter((item) => {
              return normalizePokemonKey(item.pokemonName) !== fallenKey
            }),
          }
        })

        return result
      },
      removeFallenPokemon: (id) => {
        set((state) => ({
          fallenPokemons: state.fallenPokemons.filter((item) => item.id !== id),
        }))
      },
      addChosenPokemon: (pokemonName) => {
        let result: AddChosenPokemonResult = 'empty'

        set((state) => {
          const normalizedName = sanitizeNonEmpty(pokemonName)

          if (!normalizedName) {
            return state
          }

          const captureLimit = countCapturedZones(state.zoneProgress)
          if (state.chosenPokemons.length >= captureLimit) {
            result = 'limit-reached'
            return state
          }

          const normalizedKey = normalizePokemonKey(normalizedName)
          const fallenNames = new Set(
            state.fallenPokemons.map((item) => normalizePokemonKey(item.name)),
          )

          if (fallenNames.has(normalizedKey)) {
            result = 'fallen'
            return state
          }

          const hasDuplicate = state.chosenPokemons.some((item) => {
            return normalizePokemonKey(item.pokemonName) === normalizedKey
          })

          if (hasDuplicate) {
            result = 'duplicate'
            return state
          }

          result = 'added'
          return {
            chosenPokemons: [
              ...state.chosenPokemons,
              {
                id: nanoid(),
                pokemonName: normalizedName,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        })

        return result
      },
      removeChosenPokemon: (id) => {
        set((state) => ({
          chosenPokemons: state.chosenPokemons.filter((item) => item.id !== id),
        }))
      },
      trimChosenPokemons: (limit) => {
        const normalizedLimit = Math.max(0, Math.floor(limit))

        set((state) => {
          if (state.chosenPokemons.length <= normalizedLimit) {
            return state
          }

          return {
            chosenPokemons: state.chosenPokemons.slice(0, normalizedLimit),
          }
        })
      },
      toggleZoneProgress: (zoneId, field) => {
        set((state) => {
          const zone = ROADMAP_ZONE_MAP.get(zoneId)

          if (!zone) {
            return state
          }

          const currentProgress =
            state.zoneProgress[zoneId] ??
            ({
              captured: false,
              completed: false,
            } satisfies ZoneProgress)

          if (zone.checkpoint === 'leader') {
            if (field !== 'completed') {
              return state
            }

            const completed = !currentProgress.completed
            const nextZoneProgress = {
              ...state.zoneProgress,
              [zoneId]: {
                captured: false,
                completed,
              },
            }

            const badgeId = LEADER_ZONE_TO_BADGE_MAP[zoneId]
            const nextBadges = badgeId
              ? state.badges.map((badge) => {
                  if (badge.id !== badgeId) {
                    return badge
                  }

                  return {
                    ...badge,
                    earned: completed,
                  }
                })
              : state.badges

            return {
              zoneProgress: nextZoneProgress,
              badges: nextBadges,
              chosenPokemons: clampChosenToCaptureLimit(
                state.chosenPokemons,
                nextZoneProgress,
              ),
            }
          }

          const nextProgress = { ...currentProgress }

          if (field === 'captured') {
            const captured = !currentProgress.captured
            nextProgress.captured = captured
          }

          if (field === 'completed') {
            const completed = !currentProgress.completed
            nextProgress.completed = completed
          }

          const nextZoneProgress = {
            ...state.zoneProgress,
            [zoneId]: nextProgress,
          }

          return {
            zoneProgress: nextZoneProgress,
            chosenPokemons: clampChosenToCaptureLimit(
              state.chosenPokemons,
              nextZoneProgress,
            ),
          }
        })
      },
      toggleBadge: (badgeId) => {
        set((state) => {
          let nextEarned = false

          const nextBadges = state.badges.map((badge) => {
            if (badge.id !== badgeId) {
              return badge
            }

            nextEarned = !badge.earned

            return {
              ...badge,
              earned: nextEarned,
            }
          })

          const linkedZoneId = BADGE_TO_LEADER_ZONE_MAP[badgeId]
          if (!linkedZoneId) {
            return { badges: nextBadges }
          }

          const currentProgress =
            state.zoneProgress[linkedZoneId] ??
            ({
              captured: false,
              completed: false,
            } satisfies ZoneProgress)

          return {
            badges: nextBadges,
            zoneProgress: {
              ...state.zoneProgress,
              [linkedZoneId]: {
                ...currentProgress,
                captured: false,
                completed: nextEarned,
              },
            },
          }
        })
      },
    }),
    {
      name: 'nuzlocke-b2w2-tracker/v1',
      partialize: (state) => ({
        fallenPokemons: state.fallenPokemons,
        chosenPokemons: state.chosenPokemons,
        zoneProgress: state.zoneProgress,
        badges: state.badges,
      }),
      merge: (persistedState, currentState) => {
        const safeState = persistedState as Partial<NuzlockeStoreState>

        const mergedZoneProgress = createInitialZoneProgress()
        for (const [zoneId, progress] of Object.entries(safeState.zoneProgress ?? {})) {
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

        const mergedBadges = INITIAL_BADGES.map((badge) => {
          const persistedBadge = safeState.badges?.find(
            (candidate) => candidate.id === badge.id,
          )

          return {
            ...badge,
            earned: persistedBadge ? Boolean(persistedBadge.earned) : badge.earned,
          }
        })

        const syncedBadges = syncLeaderBadgesWithProgress(
          mergedBadges,
          mergedZoneProgress,
        )

        const mergedFallenPokemons = (safeState.fallenPokemons ?? [])
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
            id: candidate.id,
            name: sanitizeNonEmpty(candidate.name),
            level: sanitizeLevel(candidate.level),
            captureZone: sanitizeNonEmpty(candidate.captureZone),
            cause: sanitizeNonEmpty(candidate.cause),
            createdAt: candidate.createdAt,
          }))
          .filter((candidate) => {
            return Boolean(candidate.name && candidate.captureZone && candidate.cause)
          })

        const fallenNameKeys = new Set(
          mergedFallenPokemons.map((pokemon) => normalizePokemonKey(pokemon.name)),
        )

        const mergedChosenPokemons = (safeState.chosenPokemons ?? [])
          .filter((candidate): candidate is ChosenPokemon => {
            return Boolean(
              candidate?.id && candidate?.pokemonName && candidate?.createdAt,
            )
          })
          .map((candidate) => ({
            id: candidate.id,
            pokemonName: sanitizeNonEmpty(candidate.pokemonName),
            createdAt: candidate.createdAt,
          }))
          .filter((candidate) => candidate.pokemonName.length > 0)
          .filter((candidate) => !fallenNameKeys.has(normalizePokemonKey(candidate.pokemonName)))

        const normalizedChosenPokemons = clampChosenToCaptureLimit(
          mergedChosenPokemons,
          mergedZoneProgress,
        )

        return {
          ...currentState,
          ...safeState,
          fallenPokemons: mergedFallenPokemons,
          chosenPokemons: normalizedChosenPokemons,
          zoneProgress: mergedZoneProgress,
          badges: syncedBadges,
        }
      },
    },
  ),
)
