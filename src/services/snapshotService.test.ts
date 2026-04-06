import { describe, expect, it } from 'vitest'

import { normalizeSnapshotPayload } from './snapshotService'

describe('normalizeSnapshotPayload', () => {
  it('aplica reglas de dominio de líderes, badges, caídos y límite de equipo', () => {
    const normalized = normalizeSnapshotPayload({
      zoneProgress: {
        cheren: { captured: true, completed: false },
        'ruta-19': { captured: true, completed: false },
      },
      badges: [
        { id: 'badge-1', earned: true },
        { id: 'badge-2', earned: false },
      ],
      chosenPokemons: [
        {
          id: 'c1f2bf39-c723-44f8-9f65-88e35f7c8901',
          pokemonName: 'Patrat',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'db9c43d5-1ae6-4dce-9d63-a7131769c4dc',
          pokemonName: 'Riolu',
          createdAt: '2026-01-01T00:01:00.000Z',
        },
      ],
      fallenPokemons: [
        {
          id: 'f1f2bf39-c723-44f8-9f65-88e35f7c8901',
          name: 'Patrat',
          level: 4,
          captureZone: 'Ruta 19',
          cause: 'Crítico',
          createdAt: '2026-01-01T00:02:00.000Z',
        },
      ],
    })

    expect(normalized.zoneProgress.cheren.captured).toBe(false)
    expect(normalized.zoneProgress.cheren.completed).toBe(true)

    expect(normalized.badges.find((badge) => badge.id === 'badge-1')?.earned).toBe(true)

    expect(normalized.chosenPokemons).toHaveLength(1)
    expect(normalized.chosenPokemons[0].pokemonName).toBe('Riolu')
  })
})
