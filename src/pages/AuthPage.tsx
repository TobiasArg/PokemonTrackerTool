import { type FormEvent, useState } from 'react'

import { ActionButton } from '../components/atomic/ActionButton'
import { Panel } from '../components/atomic/Panel'
import { TextField } from '../components/atomic/TextField'
import { useAuth } from '../hooks/useAuth'
import { SUPABASE_CONFIG_ERROR, isSupabaseConfigured } from '../lib/supabase'

export const AuthPage = () => {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    if (!isSupabaseConfigured) {
      setError(SUPABASE_CONFIG_ERROR)
      setLoading(false)
      return
    }

    const action = mode === 'login' ? signIn : signUp
    const result = await action(email, password)

    if (!result.ok) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
  }

  return (
    <section className="route-page auth-page">
      <Panel
        title={mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        description="Accede para sincronizar tus runs en la nube y continuar en cualquier dispositivo."
      >
        <div className="auth-mode-switch" role="group" aria-label="Modo de autenticación">
          <button
            className={`auth-mode-switch__button ${
              mode === 'login' ? 'auth-mode-switch__button--active' : ''
            }`}
            onClick={() => {
              setMode('login')
              setError(null)
            }}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-mode-switch__button ${
              mode === 'signup' ? 'auth-mode-switch__button--active' : ''
            }`}
            onClick={() => {
              setMode('signup')
              setError(null)
            }}
            type="button"
          >
            Registro
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <TextField
            id="auth-email"
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            required
            type="email"
            value={email}
          />

          <TextField
            id="auth-password"
            label="Contraseña"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            type="password"
            value={password}
          />

          {!isSupabaseConfigured && !error ? (
            <p className="modal-form__error">{SUPABASE_CONFIG_ERROR}</p>
          ) : null}
          {error ? <p className="modal-form__error">{error}</p> : null}

          <ActionButton disabled={loading} type="submit" variant="secondary">
            {loading
              ? 'Procesando...'
              : mode === 'login'
                ? 'Entrar'
                : 'Crear cuenta'}
          </ActionButton>
        </form>
      </Panel>
    </section>
  )
}
