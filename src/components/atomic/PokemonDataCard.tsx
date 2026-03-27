import clsx from 'clsx'
import type { CSSProperties, ReactNode } from 'react'

import { usePokemonCardData } from '../../hooks/usePokemonCardData'

type PokemonDataCardProps = {
  pokemonName: string
  stateLabel?: string
  metadata?: ReactNode
  footer?: ReactNode
  className?: string
}

const formatFallbackName = (value: string): string => {
  const normalized = value.trim()
  if (!normalized) {
    return 'Pokémon desconocido'
  }

  return normalized
}

const getTypeStyle = (color: string): CSSProperties => {
  return {
    '--type-color': color,
    '--type-bg': `${color}2a`,
  } as CSSProperties
}

export const PokemonDataCard = ({
  pokemonName,
  stateLabel,
  metadata,
  footer,
  className,
}: PokemonDataCardProps) => {
  const { status, data, errorMessage } = usePokemonCardData(pokemonName)

  const displayName = data?.displayName ?? formatFallbackName(pokemonName)
  const dexId = data ? `Nº ${String(data.id).padStart(3, '0')}` : 'Nº ---'
  const statusMessage =
    status === 'loading'
      ? 'Sincronizando datos...'
      : status === 'error'
        ? 'Entrada no identificada.'
        : data
          ? null
          : 'Sin nombre registrado.'

  return (
    <article className={clsx('pokemon-card', className)}>
      <header className="pokemon-card__head">
        <p className="pokemon-card__dex-id">{dexId}</p>
        {stateLabel ? (
          <span className="pokemon-card__state-label">{stateLabel}</span>
        ) : null}
      </header>

      <div className="pokemon-card__main">
        <div className="pokemon-card__art-wrap">
          {status === 'success' && data?.spriteUrl ? (
            <img
              alt={`Splash art de ${data.displayName}`}
              className="pokemon-card__artwork"
              loading="lazy"
              src={data.spriteUrl}
            />
          ) : (
            <div className="pokemon-card__artwork-placeholder" role="presentation">
              {status === 'loading' ? '...' : '??'}
            </div>
          )}
        </div>

        <div className="pokemon-card__content">
          <h3 className="pokemon-card__name">{displayName}</h3>
          <div className="pokemon-card__types" role="list">
            {status === 'success' && data?.types.length
              ? data.types.map((type) => {
                  return (
                    <span
                      className="pokemon-type-pill"
                      key={type.id}
                      role="listitem"
                      style={getTypeStyle(type.color)}
                    >
                      {type.label}
                    </span>
                  )
                })
              : (
                  <span className="pokemon-type-pill pokemon-type-pill--neutral">
                    Sin tipo
                  </span>
                )}
          </div>

          {statusMessage ? (
            <p className="pokemon-card__status-message">{statusMessage}</p>
          ) : null}

          {metadata ? <div className="pokemon-card__metadata">{metadata}</div> : null}
        </div>
      </div>

      {status === 'error' && errorMessage ? (
        <p className="pokemon-card__error">{errorMessage}</p>
      ) : null}

      {footer ? <div className="pokemon-card__footer">{footer}</div> : null}
    </article>
  )
}
