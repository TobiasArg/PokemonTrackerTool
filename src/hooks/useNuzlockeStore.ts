import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ReviveUsageItem = {
  id: string
  pokemonName: string
  used: boolean
  createdAt: string
}

export type FallenPokemon = {
  id: string
  name: string
  level: number
  captureZone: string
  cause: string
  createdAt: string
}

export type RoadmapZone = {
  id: string
  name: string
  levelCap: number
}

export type ZoneProgress = {
  visited: boolean
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

export type NuzlockeStoreState = {
  reviveStock: number
  reviveUsage: ReviveUsageItem[]
  fallenPokemons: FallenPokemon[]
  zoneProgress: Record<string, ZoneProgress>
  badges: BadgeState[]
  setReviveStock: (stock: number) => void
  addReviveUsage: (pokemonName: string) => void
  updateReviveUsageName: (id: string, pokemonName: string) => void
  toggleReviveUsage: (id: string) => void
  removeReviveUsage: (id: string) => void
  addFallenPokemon: (payload: AddFallenPokemonPayload) => void
  removeFallenPokemon: (id: string) => void
  toggleZoneProgress: (zoneId: string, field: keyof ZoneProgress) => void
  toggleBadge: (badgeId: string) => void
}

export const ROADMAP_ZONES: RoadmapZone[] = [
  { id: 'inicio', name: 'Inicio', levelCap: 5 },
  { id: 'ruta-19', name: 'Ruta 19', levelCap: 5 },
  { id: 'ruta-20', name: 'Ruta 20', levelCap: 4 },
  { id: 'rancho-ocre', name: 'Rancho Ocre', levelCap: 6 },
  { id: 'cheren', name: 'Cheren', levelCap: 13 },
  { id: 'ruta-20-segunda', name: 'Ruta 20 (2ª)', levelCap: 11 },
  { id: 'poligono-hormigon', name: 'Polígono Hormigón', levelCap: 13 },
  { id: 'hiedra', name: 'Hiedra', levelCap: 18 },
  { id: 'cloacas-porcelana', name: 'Cloacas Porcelana', levelCap: 20 },
  { id: 'pasadizo-ancestral', name: 'Pasadizo Ancestral', levelCap: 20 },
  { id: 'camus', name: 'Camus', levelCap: 24 },
  { id: 'ruta-4', name: 'Ruta 4', levelCap: 20 },
  { id: 'zona-desierto', name: 'Zona Desierto', levelCap: 23 },
  { id: 'ruta-16', name: 'Ruta 16', levelCap: 25 },
  { id: 'camila', name: 'Camila', levelCap: 30 },
  { id: 'ruta-5', name: 'Ruta 5', levelCap: 27 },
  { id: 'yakon', name: 'Yakón', levelCap: 33 },
  { id: 'ruta-6', name: 'Ruta 6', levelCap: 28 },
  { id: 'cueva-loza', name: 'Cueva Loza', levelCap: 28 },
  { id: 'cueva-electrorroca', name: 'Cueva Electrorroca', levelCap: 33 },
  { id: 'gerania', name: 'Gerania', levelCap: 39 },
  { id: 'ruta-7', name: 'Ruta 7', levelCap: 34 },
  { id: 'torre-de-los-cielos', name: 'Torre de los Cielos', levelCap: 34 },
  { id: 'montana-reversia', name: 'Montaña Reversia', levelCap: 41 },
  { id: 'bahia-arenisca', name: 'Bahía Arenisca', levelCap: 41 },
  { id: 'ruta-13', name: 'Ruta 13', levelCap: 41 },
  { id: 'ruta-12', name: 'Ruta 12', levelCap: 42 },
  { id: 'puente-villa', name: 'Puente Villa', levelCap: 44 },
  { id: 'ruta-11', name: 'Ruta 11', levelCap: 44 },
  { id: 'ruta-9', name: 'Ruta 9', levelCap: 44 },
  { id: 'lirio', name: 'Lirio', levelCap: 48 },
  { id: 'ciprian', name: 'Ciprián', levelCap: 51 },
]

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
      visited: false,
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

const sanitizeStock = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.floor(value))
}

export const useNuzlockeStore = create<NuzlockeStoreState>()(
  persist(
    (set) => ({
      reviveStock: 0,
      reviveUsage: [],
      fallenPokemons: [],
      zoneProgress: createInitialZoneProgress(),
      badges: INITIAL_BADGES,
      setReviveStock: (stock) => {
        set({ reviveStock: sanitizeStock(stock) })
      },
      addReviveUsage: (pokemonName) => {
        set((state) => {
          const normalizedName = sanitizeNonEmpty(pokemonName)

          if (!normalizedName) {
            return state
          }

          return {
            reviveUsage: [
              ...state.reviveUsage,
              {
                id: nanoid(),
                pokemonName: normalizedName,
                used: false,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        })
      },
      updateReviveUsageName: (id, pokemonName) => {
        set((state) => {
          const normalizedName = sanitizeNonEmpty(pokemonName)

          if (!normalizedName) {
            return state
          }

          return {
            reviveUsage: state.reviveUsage.map((item) => {
              if (item.id !== id) {
                return item
              }

              return {
                ...item,
                pokemonName: normalizedName,
              }
            }),
          }
        })
      },
      toggleReviveUsage: (id) => {
        set((state) => ({
          reviveUsage: state.reviveUsage.map((item) => {
            if (item.id !== id) {
              return item
            }

            return {
              ...item,
              used: !item.used,
            }
          }),
        }))
      },
      removeReviveUsage: (id) => {
        set((state) => ({
          reviveUsage: state.reviveUsage.filter((item) => item.id !== id),
        }))
      },
      addFallenPokemon: (payload) => {
        set((state) => {
          const name = sanitizeNonEmpty(payload.name)
          const captureZone = sanitizeNonEmpty(payload.captureZone)
          const cause = sanitizeNonEmpty(payload.cause)

          if (!name || !captureZone || !cause) {
            return state
          }

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
          }
        })
      },
      removeFallenPokemon: (id) => {
        set((state) => ({
          fallenPokemons: state.fallenPokemons.filter((item) => item.id !== id),
        }))
      },
      toggleZoneProgress: (zoneId, field) => {
        set((state) => {
          const currentProgress =
            state.zoneProgress[zoneId] ??
            ({
              visited: false,
              captured: false,
              completed: false,
            } satisfies ZoneProgress)

          return {
            zoneProgress: {
              ...state.zoneProgress,
              [zoneId]: {
                ...currentProgress,
                [field]: !currentProgress[field],
              },
            },
          }
        })
      },
      toggleBadge: (badgeId) => {
        set((state) => ({
          badges: state.badges.map((badge) => {
            if (badge.id !== badgeId) {
              return badge
            }

            return {
              ...badge,
              earned: !badge.earned,
            }
          }),
        }))
      },
    }),
    {
      name: 'nuzlocke-b2w2-tracker/v1',
      partialize: (state) => ({
        reviveStock: state.reviveStock,
        reviveUsage: state.reviveUsage,
        fallenPokemons: state.fallenPokemons,
        zoneProgress: state.zoneProgress,
        badges: state.badges,
      }),
      merge: (persistedState, currentState) => {
        const safeState = persistedState as Partial<NuzlockeStoreState>

        const mergedZoneProgress = createInitialZoneProgress()
        for (const [zoneId, progress] of Object.entries(safeState.zoneProgress ?? {})) {
          mergedZoneProgress[zoneId] = {
            visited: Boolean(progress?.visited),
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

        return {
          ...currentState,
          ...safeState,
          zoneProgress: mergedZoneProgress,
          badges: mergedBadges,
        }
      },
    },
  ),
)
