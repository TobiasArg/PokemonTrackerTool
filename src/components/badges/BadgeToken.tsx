import clsx from 'clsx'

import type { BadgeState } from '../../hooks/useNuzlockeStore'

type BadgeTokenProps = {
  badge: BadgeState
  onToggle: (badgeId: string) => void
}

export const BadgeToken = ({ badge, onToggle }: BadgeTokenProps) => {
  const gradientId = `badge-gradient-${badge.id}`

  return (
    <button
      aria-label={`${badge.label}: ${badge.earned ? 'ganada' : 'no ganada'}`}
      className={clsx('badge-token', { 'badge-token--earned': badge.earned })}
      onClick={() => onToggle(badge.id)}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="badge-token__icon"
        viewBox="0 0 96 96"
      >
        <defs>
          <linearGradient id={gradientId} x1="10%" x2="90%" y1="10%" y2="90%">
            <stop offset="0%" stopColor="#ededed" />
            <stop offset="100%" stopColor="#9a9a9a" />
          </linearGradient>
        </defs>

        <circle
          cx="48"
          cy="48"
          fill={badge.earned ? `url(#${gradientId})` : '#4c4c4c'}
          r="40"
        />
        <polygon
          fill={badge.earned ? '#f1f1f1' : '#2d2d2d'}
          points="48,14 74,34 64,74 32,74 22,34"
        />
        <circle
          cx="48"
          cy="47"
          fill={badge.earned ? '#767676' : '#1b1b1b'}
          r="12"
        />
      </svg>

      <span className="badge-token__label">{badge.label}</span>
      <span className="badge-token__status">
        {badge.earned ? 'Ganada' : 'Pendiente'}
      </span>
    </button>
  )
}
