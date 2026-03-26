import { type FormEvent, useState } from 'react'

import { useRevives } from '../../hooks/useRevives'
import { ActionButton } from '../atomic/ActionButton'
import { Modal } from '../atomic/Modal'
import { Panel } from '../atomic/Panel'
import { TextField } from '../atomic/TextField'
import { ReviveUsageItemRow } from './ReviveUsageItemRow'

type ReviveModalState = {
  stock: string
  pokemonName: string
}

const createInitialModalState = (stock: number): ReviveModalState => {
  return {
    stock: String(stock),
    pokemonName: '',
  }
}

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

  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [modalState, setModalState] = useState<ReviveModalState>(() =>
    createInitialModalState(reviveStock),
  )

  const openRegisterModal = () => {
    setModalState(createInitialModalState(reviveStock))
    setIsRegisterOpen(true)
  }

  const closeRegisterModal = () => {
    setIsRegisterOpen(false)
    setModalState(createInitialModalState(reviveStock))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedStock = Number.parseInt(modalState.stock, 10)
    setReviveStock(parsedStock)
    addReviveUsage(modalState.pokemonName)
    closeRegisterModal()
  }

  return (
    <>
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

        <div className="module-toolbar">
          <ActionButton onClick={openRegisterModal} variant="secondary">
            Registrar
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

      <Modal
        description="Registra el Pokémon al que le aplicaste un revive y ajusta tu stock total."
        isOpen={isRegisterOpen}
        onClose={closeRegisterModal}
        title="Registrar revive"
      >
        <form className="modal-form" onSubmit={handleSubmit}>
          <TextField
            id="revive-modal-stock"
            label="Total de revives disponibles"
            min={0}
            onChange={(event) =>
              setModalState((state) => ({ ...state, stock: event.target.value }))
            }
            required
            type="number"
            value={modalState.stock}
          />
          <TextField
            id="revive-modal-pokemon"
            label="Pokémon usado con revive"
            onChange={(event) =>
              setModalState((state) => ({
                ...state,
                pokemonName: event.target.value,
              }))
            }
            placeholder="Ej: Lucario"
            required
            value={modalState.pokemonName}
          />

          <div className="modal-form__actions">
            <ActionButton onClick={closeRegisterModal} type="button" variant="ghost">
              Cancelar
            </ActionButton>
            <ActionButton disabled={!modalState.pokemonName.trim()} type="submit" variant="secondary">
              Guardar registro
            </ActionButton>
          </div>
        </form>
      </Modal>
    </>
  )
}
