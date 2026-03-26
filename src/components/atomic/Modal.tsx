import { type MouseEvent, type ReactNode, useEffect } from 'react'

import { ActionButton } from './ActionButton'

type ModalProps = {
  isOpen: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
}

export const Modal = ({
  isOpen,
  title,
  description,
  onClose,
  children,
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) {
      return
    }

    onClose()
  }

  return (
    <div
      aria-modal="true"
      className="modal-overlay"
      onMouseDown={handleBackdropClick}
      role="dialog"
    >
      <div className="modal-card">
        <header className="modal-card__header">
          <div>
            <h3 className="modal-card__title">{title}</h3>
            {description ? (
              <p className="modal-card__description">{description}</p>
            ) : null}
          </div>
          <ActionButton aria-label="Cerrar ventana" onClick={onClose} variant="ghost">
            Cerrar
          </ActionButton>
        </header>

        <div className="modal-card__content">{children}</div>
      </div>
    </div>
  )
}
