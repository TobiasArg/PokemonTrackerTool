import { useState } from 'react'

import { useRevives } from '../../hooks/useRevives'
import { ActionButton } from '../atomic/ActionButton'
import { Panel } from '../atomic/Panel'
import { TextField } from '../atomic/TextField'
import { ReviveUsageItemRow } from './ReviveUsageItemRow'

export const RevivesModule = () => {
  const {
    reviveStock,
    reviveUsage,
    usedCount,
    remainingRevives,
    setReviveStock,
    addReviveUsage,
    toggleReviveUsage,
    removeReviveUsage,
  } = useRevives()

  const [draftPokemonName, setDraftPokemonName] = useState('')

  const handleStockChange = (value: string) => {
    if (!value) {
      setReviveStock(0)
      return
    }

    const parsedValue = Number.parseInt(value, 10)
    setReviveStock(parsedValue)
  }

  const handleAddUsage = () => {
    addReviveUsage(draftPokemonName)
    setDraftPokemonName('')
  }

  return (
    <Panel
      description="Marca cuántos revives tienes, cuántos usaste y con qué Pokémon."
      title="Módulo de Revives"
    >
      <div className="metrics-grid">
        <article className="metric-card">
          <p className="metric-card__label">Disponibles</p>
          <p className="metric-card__value">{reviveStock}</p>
        </article>
        <article className="metric-card">
          <p className="metric-card__label">Usados</p>
          <p className="metric-card__value">{usedCount}</p>
        </article>
        <article className="metric-card">
          <p className="metric-card__label">Restantes</p>
          <p className="metric-card__value">{remainingRevives}</p>
        </article>
      </div>

      <div className="inline-fields">
        <TextField
          id="revive-stock"
          label="Total de revives"
          min={0}
          onChange={(event) => handleStockChange(event.target.value)}
          type="number"
          value={reviveStock}
        />
      </div>

      <div className="inline-fields">
        <TextField
          id="revive-usage-name"
          label="Agregar uso (nombre del Pokémon)"
          onChange={(event) => setDraftPokemonName(event.target.value)}
          placeholder="Ej: Lucario"
          value={draftPokemonName}
        />
        <ActionButton
          disabled={!draftPokemonName.trim()}
          onClick={handleAddUsage}
          variant="secondary"
        >
          Agregar
        </ActionButton>
      </div>

      <ul className="revive-list">
        {reviveUsage.map((item) => {
          return (
            <ReviveUsageItemRow
              item={item}
              key={item.id}
              onRemove={removeReviveUsage}
              onToggle={toggleReviveUsage}
            />
          )
        })}
      </ul>

      {!reviveUsage.length ? (
        <p className="empty-state">Sin registros de uso todavía.</p>
      ) : null}
    </Panel>
  )
}
