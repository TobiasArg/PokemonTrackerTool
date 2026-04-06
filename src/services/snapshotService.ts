import { normalizePokemonKey } from '../utils/pokemonNormalization'
import type {
  BadgeSnapshotItem,
  ChosenPokemonSnapshotItem,
  FallenPokemonSnapshotItem,
  RunSnapshot,
  RunSummary,
  ZoneProgressMap,
} from '../types/app'
import { getSupabaseClient } from '../lib/supabase'

type SnapshotPayload = {
  zoneProgress: ZoneProgressMap
  badges: BadgeSnapshotItem[]
  chosenPokemons: ChosenPokemonSnapshotItem[]
  fallenPokemons: FallenPokemonSnapshotItem[]
}

const LEADER_ZONE_IDS = new Set<string>([
  'cheren',
  'hiedra',
  'camus',
  'camila',
  'yakon',
  'gerania',
  'lirio',
  'ciprian',
])

const BADGE_TO_LEADER_ZONE: Record<string, string> = {
  'badge-1': 'cheren',
  'badge-2': 'hiedra',
  'badge-3': 'camus',
  'badge-4': 'camila',
  'badge-5': 'yakon',
  'badge-6': 'gerania',
  'badge-7': 'lirio',
  'badge-8': 'ciprian',
}

type ZoneProgressRow = {
  zone_id: string
  captured: boolean
  completed: boolean
}

type BadgeRow = {
  badge_id: string
  earned: boolean
}

type ChosenRow = {
  id: string
  pokemon_name: string
  created_at: string
}

type FallenRow = {
  id: string
  name: string
  level: number
  capture_zone: string
  cause: string
  created_at: string
}

type IdRow = {
  id: string
}

type RunRow = {
  id: string
  name: string
  game_key: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

const mapRunRow = (row: RunRow): RunSummary => {
  return {
    id: row.id,
    name: row.name,
    gameKey: row.game_key,
    isArchived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const normalizeSnapshotPayload = (payload: SnapshotPayload): SnapshotPayload => {
  const zoneProgress: ZoneProgressMap = Object.entries(payload.zoneProgress).reduce(
    (acc, [zoneId, progress]) => {
      const completed = Boolean(progress.completed)
      acc[zoneId] = {
        captured: LEADER_ZONE_IDS.has(zoneId) ? false : Boolean(progress.captured),
        completed,
      }

      return acc
    },
    {} as ZoneProgressMap,
  )

  const badgesById = new Map(
    payload.badges.map((badge) => [badge.id, Boolean(badge.earned)]),
  )

  for (const [badgeId, zoneId] of Object.entries(BADGE_TO_LEADER_ZONE)) {
    const zoneCompleted = Boolean(zoneProgress[zoneId]?.completed)
    const badgeEarned = badgesById.get(badgeId) ?? false
    const mergedEarned = zoneCompleted || badgeEarned

    badgesById.set(badgeId, mergedEarned)
    zoneProgress[zoneId] = {
      captured: false,
      completed: mergedEarned,
    }
  }

  const badges = Array.from(badgesById.entries()).map(([id, earned]) => ({
    id,
    earned,
  }))

  const fallenPokemons = payload.fallenPokemons.filter((pokemon) => {
    return Boolean(
      pokemon.name.trim() &&
        pokemon.captureZone.trim() &&
        pokemon.cause.trim() &&
        Number.isFinite(pokemon.level),
    )
  })

  const fallenKeys = new Set(
    fallenPokemons.map((pokemon) => normalizePokemonKey(pokemon.name)),
  )

  const capturedZones = Object.entries(zoneProgress).reduce((count, [zoneId, progress]) => {
    if (LEADER_ZONE_IDS.has(zoneId)) {
      return count
    }

    return progress.captured ? count + 1 : count
  }, 0)

  const chosenDeduped = payload.chosenPokemons.filter((pokemon, index, array) => {
    const normalizedKey = normalizePokemonKey(pokemon.pokemonName)
    if (!pokemon.pokemonName.trim() || fallenKeys.has(normalizedKey)) {
      return false
    }

    return (
      array.findIndex(
        (candidate) =>
          normalizePokemonKey(candidate.pokemonName) === normalizedKey,
      ) === index
    )
  })

  const chosenPokemons = chosenDeduped.slice(0, capturedZones)

  return {
    zoneProgress,
    badges,
    chosenPokemons,
    fallenPokemons,
  }
}

export const snapshotService = {
  async getRunSnapshot(runId: string): Promise<RunSnapshot> {
    const supabase = getSupabaseClient()
    const [
      runResult,
      zoneProgressResult,
      badgesResult,
      chosenResult,
      fallenResult,
    ] = await Promise.all([
      supabase
        .from('runs')
        .select('id,name,game_key,is_archived,created_at,updated_at')
        .eq('id', runId)
        .single(),
      supabase
        .from('run_zone_progress')
        .select('zone_id,captured,completed')
        .eq('run_id', runId),
      supabase
        .from('run_badges')
        .select('badge_id,earned')
        .eq('run_id', runId),
      supabase
        .from('run_chosen_pokemon')
        .select('id,pokemon_name,created_at')
        .eq('run_id', runId)
        .order('created_at', { ascending: true }),
      supabase
        .from('run_fallen_pokemon')
        .select('id,name,level,capture_zone,cause,created_at')
        .eq('run_id', runId)
        .order('created_at', { ascending: false }),
    ])

    if (runResult.error || !runResult.data) {
      throw new Error(runResult.error?.message ?? 'No se encontró la run solicitada.')
    }

    if (zoneProgressResult.error) {
      throw new Error(zoneProgressResult.error.message)
    }

    if (badgesResult.error) {
      throw new Error(badgesResult.error.message)
    }

    if (chosenResult.error) {
      throw new Error(chosenResult.error.message)
    }

    if (fallenResult.error) {
      throw new Error(fallenResult.error.message)
    }

    const zoneProgress = (zoneProgressResult.data ?? []).reduce<ZoneProgressMap>((acc, row) => {
      const mapped = row as ZoneProgressRow
      acc[mapped.zone_id] = {
        captured: Boolean(mapped.captured),
        completed: Boolean(mapped.completed),
      }
      return acc
    }, {})

    const badges = (badgesResult.data ?? []).map((row) => {
      const mapped = row as BadgeRow
      return {
        id: mapped.badge_id,
        earned: Boolean(mapped.earned),
      }
    })

    const chosenPokemons = (chosenResult.data ?? []).map((row) => {
      const mapped = row as ChosenRow
      return {
        id: mapped.id,
        pokemonName: mapped.pokemon_name,
        createdAt: mapped.created_at,
      }
    })

    const fallenPokemons = (fallenResult.data ?? []).map((row) => {
      const mapped = row as FallenRow
      return {
        id: mapped.id,
        name: mapped.name,
        level: mapped.level,
        captureZone: mapped.capture_zone,
        cause: mapped.cause,
        createdAt: mapped.created_at,
      }
    })

    return {
      run: mapRunRow(runResult.data as RunRow),
      zoneProgress,
      badges,
      chosenPokemons,
      fallenPokemons,
    }
  },

  async saveRunSnapshot(runId: string, payload: SnapshotPayload): Promise<void> {
    const supabase = getSupabaseClient()
    const normalizedPayload = normalizeSnapshotPayload(payload)

    const zoneRows = Object.entries(normalizedPayload.zoneProgress).map(([zoneId, progress]) => ({
      run_id: runId,
      zone_id: zoneId,
      captured: Boolean(progress.captured),
      completed: Boolean(progress.completed),
    }))

    if (zoneRows.length > 0) {
      const { error } = await supabase
        .from('run_zone_progress')
        .upsert(zoneRows, { onConflict: 'run_id,zone_id' })

      if (error) {
        throw new Error(error.message)
      }
    }

    const badgeRows = normalizedPayload.badges.map((badge) => ({
      run_id: runId,
      badge_id: badge.id,
      earned: Boolean(badge.earned),
    }))

    if (badgeRows.length > 0) {
      const { error } = await supabase
        .from('run_badges')
        .upsert(badgeRows, { onConflict: 'run_id,badge_id' })

      if (error) {
        throw new Error(error.message)
      }
    }

    if (normalizedPayload.chosenPokemons.length > 0) {
      const chosenRows = normalizedPayload.chosenPokemons.map((pokemon) => ({
        id: pokemon.id,
        run_id: runId,
        pokemon_name: pokemon.pokemonName,
        normalized_key: normalizePokemonKey(pokemon.pokemonName),
        created_at: pokemon.createdAt,
      }))

      const { error: upsertChosenError } = await supabase
        .from('run_chosen_pokemon')
        .upsert(chosenRows, { onConflict: 'id' })

      if (upsertChosenError) {
        throw new Error(upsertChosenError.message)
      }
    }

    const chosenIds = new Set(normalizedPayload.chosenPokemons.map((pokemon) => pokemon.id))
    const { data: existingChosenRows, error: existingChosenError } = await supabase
      .from('run_chosen_pokemon')
      .select('id')
      .eq('run_id', runId)

    if (existingChosenError) {
      throw new Error(existingChosenError.message)
    }

    const staleChosenIds = (existingChosenRows ?? [])
      .map((row) => (row as IdRow).id)
      .filter((id) => !chosenIds.has(id))

    if (staleChosenIds.length > 0) {
      const { error: deleteStaleChosenError } = await supabase
        .from('run_chosen_pokemon')
        .delete()
        .eq('run_id', runId)
        .in('id', staleChosenIds)

      if (deleteStaleChosenError) {
        throw new Error(deleteStaleChosenError.message)
      }
    }

    if (normalizedPayload.fallenPokemons.length > 0) {
      const fallenRows = normalizedPayload.fallenPokemons.map((pokemon) => ({
        id: pokemon.id,
        run_id: runId,
        name: pokemon.name,
        normalized_key: normalizePokemonKey(pokemon.name),
        level: pokemon.level,
        capture_zone: pokemon.captureZone,
        cause: pokemon.cause,
        created_at: pokemon.createdAt,
      }))

      const { error: upsertFallenError } = await supabase
        .from('run_fallen_pokemon')
        .upsert(fallenRows, { onConflict: 'id' })

      if (upsertFallenError) {
        throw new Error(upsertFallenError.message)
      }
    }

    const fallenIds = new Set(normalizedPayload.fallenPokemons.map((pokemon) => pokemon.id))
    const { data: existingFallenRows, error: existingFallenError } = await supabase
      .from('run_fallen_pokemon')
      .select('id')
      .eq('run_id', runId)

    if (existingFallenError) {
      throw new Error(existingFallenError.message)
    }

    const staleFallenIds = (existingFallenRows ?? [])
      .map((row) => (row as IdRow).id)
      .filter((id) => !fallenIds.has(id))

    if (staleFallenIds.length > 0) {
      const { error: deleteStaleFallenError } = await supabase
        .from('run_fallen_pokemon')
        .delete()
        .eq('run_id', runId)
        .in('id', staleFallenIds)

      if (deleteStaleFallenError) {
        throw new Error(deleteStaleFallenError.message)
      }
    }
  },
}
