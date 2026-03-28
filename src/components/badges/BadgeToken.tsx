import clsx from 'clsx'

import type { BadgeState } from '../../hooks/useNuzlockeStore'

type BadgeTokenProps = {
  badge: BadgeState
  badgeNumber: number
  imageUrl: string
  isActivating: boolean
  onActivate: (badge: BadgeState) => void
}

export const BadgeToken = ({
  badge,
  badgeNumber,
  imageUrl,
  isActivating,
  onActivate,
}: BadgeTokenProps) => {
  const isEarned = badge.earned
  const stateLabel = isEarned ? 'Obtenida' : 'Pendiente'
  const actionLabel = isEarned ? 'Ya obtenida' : 'Activar medalla'

  return (
    <button
      aria-disabled={isEarned ? 'true' : undefined}
      aria-label={`${badge.label}: ${stateLabel}`}
      className={clsx('badge-token', {
        'badge-token--earned': isEarned,
        'badge-token--off': !isEarned,
        'badge-token--activating': isActivating,
      })}
      disabled={isEarned}
      onClick={() => {
        if (!isEarned) {
          onActivate(badge)
        }
      }}
      type="button"
    >
      <span aria-hidden="true" className="badge-token__index">
        #{badgeNumber}
      </span>

      <img alt="" className="badge-token__image" loading="lazy" src={imageUrl} />

      <span className="badge-token__meta">
        <span className="badge-token__label">{badge.label}</span>
        <span className="badge-token__status">{stateLabel}</span>
        <span className="badge-token__action">{actionLabel}</span>
      </span>
    </button>
  )
}
