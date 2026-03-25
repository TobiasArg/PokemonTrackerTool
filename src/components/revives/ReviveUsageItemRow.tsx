import { ActionButton } from '../atomic/ActionButton'
import { CheckField } from '../atomic/CheckField'
import { PokemonDataCard } from '../atomic/PokemonDataCard'
import type { ReviveUsageItem } from '../../hooks/useNuzlockeStore'

type ReviveUsageItemRowProps = {
  item: ReviveUsageItem
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

export const ReviveUsageItemRow = ({
  item,
  onToggle,
  onRemove,
}: ReviveUsageItemRowProps) => {
  const reviveStateLabel = item.used ? 'Usado' : 'Pendiente'

  return (
    <li className="revive-row">
      <PokemonDataCard
        footer={
          <div className="revive-row__actions">
            <CheckField
              checked={item.used}
              id={`revive-item-${item.id}`}
              label="Revive usado"
              onChange={() => onToggle(item.id)}
            />
            <ActionButton
              aria-label={`Eliminar revive asociado a ${item.pokemonName}`}
              onClick={() => onRemove(item.id)}
              variant="ghost"
            >
              Eliminar
            </ActionButton>
          </div>
        }
        pokemonName={item.pokemonName}
        stateLabel={reviveStateLabel}
      />
    </li>
  )
}
