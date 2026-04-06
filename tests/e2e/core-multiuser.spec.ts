import { expect, test, type Page } from '@playwright/test'

const userAEmail = process.env.E2E_USER_A_EMAIL
const userAPassword = process.env.E2E_USER_A_PASSWORD
const userBEmail = process.env.E2E_USER_B_EMAIL
const userBPassword = process.env.E2E_USER_B_PASSWORD

const missingEnv =
  !userAEmail ||
  !userAPassword ||
  !userBEmail ||
  !userBPassword

test.describe.configure({ mode: 'serial' })
test.skip(missingEnv, 'Faltan credenciales E2E en variables de entorno.')

const signIn = async (page: Page, email: string, password: string) => {
  await page.goto('/auth')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page).not.toHaveURL(/\/auth$/)
}

let runNameA = ''

test('usuario A crea run y persiste', async ({ page }) => {
  runNameA = `E2E Run A ${Date.now()}`

  await signIn(page, userAEmail as string, userAPassword as string)
  await page.goto('/runs')

  await page.getByLabel('Nombre de la nueva run').fill(runNameA)
  await page.getByRole('button', { name: 'Crear run' }).click()

  await page.goto('/runs')
  await expect(page.getByText(runNameA)).toBeVisible()
})

test('usuario B no ve runs de A', async ({ page }) => {
  await signIn(page, userBEmail as string, userBPassword as string)
  await page.goto('/runs')

  await expect(page.getByText(runNameA)).toHaveCount(0)
})

test('usuario A ve su run desde otra sesión', async ({ page }) => {
  await signIn(page, userAEmail as string, userAPassword as string)
  await page.goto('/runs')

  await expect(page.getByText(runNameA)).toBeVisible()
})

test('logout/login mantiene aislamiento entre cuentas', async ({ page }) => {
  await signIn(page, userAEmail as string, userAPassword as string)
  await page.goto('/runs')
  await expect(page.getByText(runNameA)).toBeVisible()

  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page).toHaveURL(/\/auth$/)

  await signIn(page, userBEmail as string, userBPassword as string)
  await page.goto('/runs')
  await expect(page.getByText(runNameA)).toHaveCount(0)
})

test('error de red en guardado no expulsa la sesión', async ({ page }) => {
  await signIn(page, userAEmail as string, userAPassword as string)
  await page.goto('/roadmap')

  await page.route('**/rest/v1/**', (route) => route.abort('failed'))
  await page.locator('#ruta-19-captured').click()

  await expect(page.getByText('Error de sync')).toBeVisible()
  await expect(page).not.toHaveURL(/\/auth$/)
})
