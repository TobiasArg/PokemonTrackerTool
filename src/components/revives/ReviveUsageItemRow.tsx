import { ActionButton } from '../atomic/ActionButton'
import { CheckField } from '../atomic/CheckField'
import { TextField } from '../atomic/TextField'
import type { ReviveUsageItem } from '../../hooks/useNuzlockeStore'

type ReviveUsageItemRowProps = {
  item: ReviveUsageItem
  onToggle: (id: string) => void
  onRename: (id: string, pokemonName: string) => void
  onRemove: (id: string) => void
}

export const ReviveUsageItemRow = ({
  item,
  onToggle,
  onRename,
  onRemove,
}: ReviveUsageItemRowProps) => {
  return (
    <li className="revive-row">
      <CheckField
        checked={item.used}
        id={`revive-item-${item.id}`}
        label="Usado"
        onChange={() => onToggle(item.id)}
      />
      <TextField
        className="revive-row__name-input"
        id={`revive-name-${item.id}`}
        label="Pokémon"
        onChange={(event) => onRename(item.id, event.target.value)}
        value={item.pokemonName}
      />
      <ActionButton
        aria-label={`Eliminar revive asociado a ${item.pokemonName}`}
        onClick={() => onRemove(item.id)}
        variant="ghost"
      >
        Eliminar
      </ActionButton>
    </li>
  )
}
