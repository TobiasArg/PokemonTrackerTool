import { useBadges } from '../../hooks/useBadges'
import { BadgeToken } from './BadgeToken'

export const BadgesModule = () => {
  const { badges, earnedCount, totalBadges, toggleBadge } = useBadges()

  return (
    <section className="badges-module" id="medallas">
      <header className="badges-header">
        <p className="badges-header__eyebrow">Vista Grande</p>
        <h2 className="badges-header__title">Módulo de Medallas</h2>
        <p className="badges-header__description">
          Toca una medalla para alternar su estado. No ganada aparece en silueta
          gris; ganada se ilumina.
        </p>
        <p className="badges-header__progress">
          {earnedCount}/{totalBadges} medallas obtenidas
        </p>
      </header>

      <div className="badges-grid">
        {badges.map((badge) => {
          return (
            <BadgeToken
              badge={badge}
              key={badge.id}
              onToggle={toggleBadge}
            />
          )
        })}
      </div>
    </section>
  )
}
