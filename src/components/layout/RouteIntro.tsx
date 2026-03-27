type RouteIntroProps = {
  title: string
  description?: string
}

export const RouteIntro = ({ title, description }: RouteIntroProps) => {
  return (
    <header className="route-intro">
      <h2 className="route-intro__title">{title}</h2>
      {description ? <p className="route-intro__description">{description}</p> : null}
    </header>
  )
}
