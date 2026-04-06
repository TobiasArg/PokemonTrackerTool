const required = [
  'E2E_USER_A_EMAIL',
  'E2E_USER_A_PASSWORD',
  'E2E_USER_B_EMAIL',
  'E2E_USER_B_PASSWORD',
]

const missing = required.filter((key) => !process.env[key])

if (missing.length > 0) {
  console.error('[E2E Gate] Faltan variables de entorno requeridas:')
  for (const key of missing) {
    console.error(`- ${key}`)
  }
  process.exit(1)
}

console.log('[E2E Gate] Variables requeridas presentes. Ejecutando E2E...')
