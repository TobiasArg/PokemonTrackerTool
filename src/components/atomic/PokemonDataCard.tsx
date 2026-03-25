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

export const PokemonDataCard = ({
  pokemonName,
  stateLabel,
  metadata,
  footer,
  className,
}: PokemonDataCardProps) => {
  const { status, data, errorMessage } = usePokemonCardData(pokemonName)

  const displayName = data?.displayName ?? formatFallbackName(pokemonName)
  const statusDescription =
    status === 'loading'
      ? 'Cargando desde PokeAPI...'
      : status === 'error'
        ? 'No se pudo validar este Pokémon.'
        : data
          ? `#${data.id} • ${data.apiName}`
          : 'Escribe un nombre de Pokémon.'

  return (
    <article className={clsx('pokemon-card', className)}>
      <div className="pokemon-card__main">
        <div className="pokemon-card__sprite-wrap">
          {status === 'success' && data?.spriteUrl ? (
            <img
              alt={`Sprite de ${data.displayName}`}
              className="pokemon-card__sprite"
              loading="lazy"
              src={data.spriteUrl}
            />
          ) : (
            <div className="pokemon-card__sprite-placeholder" role="presentation">
              {status === 'loading' ? '...' : '??'}
            </div>
          )}
        </div>

        <div className="pokemon-card__content">
          <h3 className="pokemon-card__name">{displayName}</h3>
          <p className="pokemon-card__description">{statusDescription}</p>

          <div className="pokemon-card__types" role="list">
            {status === 'success' && data?.types.length
              ? data.types.map((type) => {
                  return (
                    <span
                      className="pokemon-type-pill"
                      key={type.id}
                      role="listitem"
                      style={{ '--type-color': type.color } as CSSProperties}
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
        </div>

        {stateLabel ? (
          <span className="pokemon-card__state-label">{stateLabel}</span>
        ) : null}
      </div>

      {status === 'error' && errorMessage ? (
        <p className="pokemon-card__error">{errorMessage}</p>
      ) : null}

      {metadata ? <div className="pokemon-card__metadata">{metadata}</div> : null}
      {footer ? <div className="pokemon-card__footer">{footer}</div> : null}
    </article>
  )
}
