const stripDiacritics = (value: string): string => {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export const normalizePokemonName = (value: string): string => {
  return stripDiacritics(value)
    .trim()
    .toLowerCase()
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/[.'’]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const normalizePokemonKey = (value: string): string => {
  const normalized = normalizePokemonName(value)
  if (normalized) {
    return normalized
  }

  return stripDiacritics(value).trim().toLowerCase()
}

