import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
}

export const PageShell = ({ children }: PageShellProps) => {
  return <main className="page-shell">{children}</main>
}
