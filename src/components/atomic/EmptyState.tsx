type EmptyStateProps = {
  title: string
  hint?: string
}

export const EmptyState = ({ title, hint }: EmptyStateProps) => {
  return (
    <div className="empty-state" role="status">
      <p className="empty-state__title">{title}</p>
      {hint ? <p className="empty-state__hint">{hint}</p> : null}
    </div>
  )
}
