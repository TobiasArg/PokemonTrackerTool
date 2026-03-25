import clsx from 'clsx'
import type { InputHTMLAttributes } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  className?: string
}

export const TextField = ({ id, label, className, ...props }: TextFieldProps) => {
  return (
    <label className={clsx('text-field', className)} htmlFor={id}>
      <span className="text-field__label">{label}</span>
      <input className="text-field__input" id={id} {...props} />
    </label>
  )
}
