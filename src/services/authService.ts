import type { Session } from '@supabase/supabase-js'

import { getSupabaseClient } from '../lib/supabase'

export const authService = {
  async getSession(): Promise<Session | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      throw new Error(error.message)
    }

    return data.session
  },

  async signIn(email: string, password: string): Promise<Session | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data.session
  },

  async signUp(email: string, password: string): Promise<Session | null> {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data.session
  },

  async signOut(): Promise<void> {
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  },

  async markLegacyMigrationDone(): Promise<void> {
    const supabase = getSupabaseClient()
    const session = await this.getSession()
    if (!session) {
      return
    }

    const currentMetadata = session.user.user_metadata ?? {}

    const { error } = await supabase.auth.updateUser({
      data: {
        ...currentMetadata,
        migration_done_v1: true,
      },
    })

    if (error) {
      throw new Error(error.message)
    }
  },
}
