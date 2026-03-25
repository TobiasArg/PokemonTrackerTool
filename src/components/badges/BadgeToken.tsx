import clsx from 'clsx'
import type { CSSProperties } from 'react'

import type { BadgeState } from '../../hooks/useNuzlockeStore'

type BadgeTokenProps = {
  badge: BadgeState
  index: number
  onToggle: (badgeId: string) => void
}

export const BadgeToken = ({ badge, index, onToggle }: BadgeTokenProps) => {
  const gradientId = `badge-gradient-${badge.id}`
  const hue = (index * 38) % 360

  return (
    <button
      aria-label={`${badge.label}: ${badge.earned ? 'ganada' : 'no ganada'}`}
      className={clsx('badge-token', { 'badge-token--earned': badge.earned })}
      onClick={() => onToggle(badge.id)}
      style={{ '--badge-hue': `${hue}deg` } as CSSProperties}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="badge-token__icon"
        viewBox="0 0 96 96"
      >
        <defs>
          <linearGradient id={gradientId} x1="10%" x2="90%" y1="10%" y2="90%">
            <stop offset="0%" stopColor={`hsl(${hue} 88% 62%)`} />
            <stop offset="100%" stopColor={`hsl(${(hue + 64) % 360} 72% 48%)`} />
          </linearGradient>
        </defs>

        <circle
          cx="48"
          cy="48"
          fill={badge.earned ? `url(#${gradientId})` : '#8e9aae'}
          r="40"
        />
        <polygon
          fill={badge.earned ? 'rgba(255, 255, 255, 0.95)' : '#667085'}
          points="48,14 74,34 64,74 32,74 22,34"
        />
        <circle
          cx="48"
          cy="47"
          fill={badge.earned ? `hsl(${(hue + 18) % 360} 79% 44%)` : '#4b5565'}
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
