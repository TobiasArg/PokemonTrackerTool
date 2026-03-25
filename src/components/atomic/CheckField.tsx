import type { InputHTMLAttributes } from 'react'

type CheckFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string
  label: string
}

export const CheckField = ({ id, label, ...props }: CheckFieldProps) => {
  return (
    <label className="check-field" htmlFor={id}>
      <input className="check-field__input" id={id} type="checkbox" {...props} />
      <span className="check-field__label">{label}</span>
    </label>
  )
}
