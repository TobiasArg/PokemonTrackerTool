import clsx from 'clsx'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  {
    to: '/runs',
    label: 'Runs',
  },
  {
    to: '/pokemons',
    label: 'Pokémon',
  },
  {
    to: '/roadmap',
    label: 'Roadmap',
  },
  {
    to: '/medallas',
    label: 'Medallas',
  },
]

export const MobileTabNav = () => {
  return (
    <nav
      aria-label="Navegación principal"
      className="mobile-tab-nav"
      style={{ gridTemplateColumns: `repeat(${NAV_ITEMS.length}, minmax(0, 1fr))` }}
    >
      {NAV_ITEMS.map((item) => {
        return (
          <NavLink
            className={({ isActive }) =>
              clsx('mobile-tab-nav__item', {
                'mobile-tab-nav__item--active': isActive,
              })
            }
            key={item.to}
            to={item.to}
          >
            <span className="mobile-tab-nav__label">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
