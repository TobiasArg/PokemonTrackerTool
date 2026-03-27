import { getSupabaseClient } from '../lib/supabase'
import type { RunSummary } from '../types/app'

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

const sanitizeRunName = (value: string): string => {
  const cleaned = value.trim()
  if (!cleaned) {
    return 'Mi run'
  }

  return cleaned.slice(0, 80)
}

export const runsService = {
  async listRuns(): Promise<RunSummary[]> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('runs')
      .select('id,name,game_key,is_archived,created_at,updated_at')
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map((row) => mapRunRow(row as RunRow))
  },

  async createRun(name: string, gameKey = 'b2w2'): Promise<RunSummary> {
    const supabase = getSupabaseClient()
    const session = (await supabase.auth.getSession()).data.session
    if (!session) {
      throw new Error('Debes iniciar sesión para crear una run.')
    }

    const { data, error } = await supabase
      .from('runs')
      .insert({
        owner_id: session.user.id,
        name: sanitizeRunName(name),
        game_key: gameKey,
      })
      .select('id,name,game_key,is_archived,created_at,updated_at')
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? 'No se pudo crear la run.')
    }

    return mapRunRow(data as RunRow)
  },

  async renameRun(runId: string, name: string): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('runs')
      .update({
        name: sanitizeRunName(name),
      })
      .eq('id', runId)

    if (error) {
      throw new Error(error.message)
    }
  },

  async archiveRun(runId: string, isArchived: boolean): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('runs')
      .update({
        is_archived: isArchived,
      })
      .eq('id', runId)

    if (error) {
      throw new Error(error.message)
    }
  },

  async deleteRun(runId: string): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('runs').delete().eq('id', runId)

    if (error) {
      throw new Error(error.message)
    }
  },
}
