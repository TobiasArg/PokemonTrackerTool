import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const AUTH_NAV_ITEMS = [
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

const GUEST_NAV_ITEMS = AUTH_NAV_ITEMS.filter((item) => item.to !== '/runs')

export const MobileTabNav = () => {
  const { authStatus } = useAuth()
  const navItems = authStatus === 'authenticated' ? AUTH_NAV_ITEMS : GUEST_NAV_ITEMS

  return (
    <nav
      aria-label="Navegación principal"
      className="mobile-tab-nav"
      style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
    >
      {navItems.map((item) => {
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
