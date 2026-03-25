import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type ActionButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ActionButtonVariant
}

export const ActionButton = ({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ActionButtonProps) => {
  return (
    <button
      className={clsx('action-button', `action-button--${variant}`, className)}
      type={type}
      {...props}
    />
  )
}
