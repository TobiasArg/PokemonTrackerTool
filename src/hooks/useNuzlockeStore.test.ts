import { beforeEach, describe, expect, it, vi } from 'vitest'

import { snapshotService } from '../services/snapshotService'
import { INITIAL_BADGES, ROADMAP_ZONES, useNuzlockeStore } from './useNuzlockeStore'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const createZoneProgress = () => {
  return ROADMAP_ZONES.reduce<Record<string, { captured: boolean; completed: boolean }>>(
    (acc, zone) => {
      acc[zone.id] = {
        captured: false,
        completed: false,
      }

      return acc
    },
    {},
  )
}

const resetStore = () => {
  const currentState = useNuzlockeStore.getState()

  useNuzlockeStore.setState(
    {
      ...currentState,
      fallenPokemons: [],
      chosenPokemons: [],
      zoneProgress: createZoneProgress(),
      badges: INITIAL_BADGES.map((badge) => ({ ...badge })),
      authStatus: 'authenticated',
      isBootstrapped: true,
      session: {
        userId: 'user-test-id',
        email: 'user@test.dev',
      },
      rawSession: null,
      runs: [
        {
          id: 'run-1',
          name: 'Run Test',
          gameKey: 'b2w2',
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      activeRunId: 'run-1',
      syncStatus: 'idle',
      syncError: null,
      lastSyncedAt: null,
      isHydratingRunData: false,
      dataRevision: 0,
      lastPersistedRevision: 0,
    },
    true,
  )
}

describe('useNuzlockeStore domain rules', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetStore()
  })

  it('addChosenPokemon respeta límite por capturas', () => {
    const store = useNuzlockeStore.getState()

    expect(store.addChosenPokemon('pikachu')).toBe('limit-reached')

    store.toggleZoneProgress('ruta-19', 'captured')

    expect(store.addChosenPokemon('pikachu')).toBe('added')
    expect(store.addChosenPokemon('riolu')).toBe('limit-reached')
  })

  it('addFallenPokemon elimina al elegido con el mismo nombre', () => {
    const store = useNuzlockeStore.getState()

    store.toggleZoneProgress('ruta-19', 'captured')
    expect(store.addChosenPokemon('lucario')).toBe('added')

    expect(
      store.addFallenPokemon({
        name: 'lucario',
        level: 20,
        captureZone: 'Ruta 19',
        cause: 'Crítico',
      }),
    ).toBe('added')

    const nextState = useNuzlockeStore.getState()
    expect(nextState.fallenPokemons).toHaveLength(1)
    expect(nextState.chosenPokemons).toHaveLength(0)
  })

  it('toggleZoneProgress de líder no permite captured y completed es irreversible', () => {
    const store = useNuzlockeStore.getState()

    const revisionBeforeCaptured = store.dataRevision
    store.toggleZoneProgress('cheren', 'captured')

    let nextState = useNuzlockeStore.getState()
    expect(nextState.zoneProgress.cheren.captured).toBe(false)
    expect(nextState.dataRevision).toBe(revisionBeforeCaptured)

    store.toggleZoneProgress('cheren', 'completed')
    nextState = useNuzlockeStore.getState()

    expect(nextState.zoneProgress.cheren.completed).toBe(true)
    expect(nextState.badges.find((badge) => badge.id === 'badge-1')?.earned).toBe(true)

    const revisionAfterComplete = nextState.dataRevision
    store.toggleZoneProgress('cheren', 'completed')

    expect(useNuzlockeStore.getState().dataRevision).toBe(revisionAfterComplete)
  })

  it('toggleBadge sincroniza líder y no vuelve a mutar si ya estaba activa', () => {
    const store = useNuzlockeStore.getState()

    store.toggleBadge('badge-2')

    let nextState = useNuzlockeStore.getState()
    expect(nextState.badges.find((badge) => badge.id === 'badge-2')?.earned).toBe(true)
    expect(nextState.zoneProgress.hiedra.completed).toBe(true)

    const revisionAfterFirstToggle = nextState.dataRevision

    store.toggleBadge('badge-2')
    nextState = useNuzlockeStore.getState()

    expect(nextState.dataRevision).toBe(revisionAfterFirstToggle)
  })

  it('sanitiza IDs inválidos al hidratar snapshot', async () => {
    const zoneProgress = createZoneProgress()
    zoneProgress['ruta-19'] = {
      captured: true,
      completed: false,
    }

    vi.spyOn(snapshotService, 'getRunSnapshot').mockResolvedValue({
      run: {
        id: 'run-1',
        name: 'Run Test',
        gameKey: 'b2w2',
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      zoneProgress,
      badges: INITIAL_BADGES.map((badge) => ({ id: badge.id, earned: false })),
      chosenPokemons: [
        {
          id: 'chosen-not-uuid',
          pokemonName: 'snivy',
          createdAt: new Date().toISOString(),
        },
      ],
      fallenPokemons: [
        {
          id: 'fallen-not-uuid',
          name: 'patrat',
          level: 4,
          captureZone: 'Ruta 19',
          cause: 'Crítico',
          createdAt: new Date().toISOString(),
        },
      ],
    })

    await useNuzlockeStore.getState().loadActiveRunSnapshot()

    const nextState = useNuzlockeStore.getState()

    expect(nextState.chosenPokemons[0]?.id).toMatch(UUID_REGEX)
    expect(nextState.fallenPokemons[0]?.id).toMatch(UUID_REGEX)
  })
})
