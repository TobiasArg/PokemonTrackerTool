import { useEffect, useRef, useState } from 'react'

import type { BadgeState } from '../../hooks/useNuzlockeStore'
import { useBadges } from '../../hooks/useBadges'
import { BadgeToken } from './BadgeToken'
import { BADGE_ASSET_MAP } from './badgeAssets'

export const BadgesModule = () => {
  const { badges, earnedCount, totalBadges, toggleBadge } = useBadges()
  const [activatingBadgeId, setActivatingBadgeId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('Selecciona una medalla pendiente para activarla.')
  const activationTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (activationTimeoutRef.current) {
        window.clearTimeout(activationTimeoutRef.current)
      }
    }
  }, [])

  const handleActivateBadge = (badge: BadgeState) => {
    if (badge.earned) {
      setFeedback(`${badge.label} ya fue registrada como obtenida.`)
      return
    }

    toggleBadge(badge.id)
    setActivatingBadgeId(badge.id)
    setFeedback(`${badge.label} activada y guardada en la vitrina.`)

    if (activationTimeoutRef.current) {
      window.clearTimeout(activationTimeoutRef.current)
    }

    activationTimeoutRef.current = window.setTimeout(() => {
      setActivatingBadgeId((current) => (current === badge.id ? null : current))
    }, 900)
  }

  return (
    <section className="badges-module" id="medallas">
      <header className="badges-header">
        <p className="badges-header__eyebrow">Vitrina de Medallas</p>
        <p className="badges-header__progress">
          {earnedCount}/{totalBadges} medallas obtenidas
        </p>
      </header>

      <div className={`badges-case ${activatingBadgeId ? 'badges-case--pulse' : ''}`}>
        <ol className="badges-case__rail">
          {badges.map((badge, index) => {
            const imageUrl = BADGE_ASSET_MAP[badge.id] ?? BADGE_ASSET_MAP['badge-1']

            return (
              <li className="badges-case__slot" key={badge.id}>
                <BadgeToken
                  badge={badge}
                  badgeNumber={index + 1}
                  imageUrl={imageUrl}
                  isActivating={activatingBadgeId === badge.id}
                  onActivate={handleActivateBadge}
                />
              </li>
            )
          })}
        </ol>
      </div>
      <p aria-live="polite" className="badges-case__feedback" role="status">
        {feedback}
      </p>
    </section>
  )
}
