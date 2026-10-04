import { expect, test } from '@playwright/test'

const username = requiredEnvironment('QA_TEST_USERNAME')
const password = requiredEnvironment('QA_TEST_PASSWORD')

function requiredEnvironment(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Falta la variable de entorno ${name}.`)
  return value
}

function uniqueName(prefix) {
  return `${prefix} ${Date.now()} ${crypto.randomUUID().slice(0, 8)}`
}

async function login(page) {
  await page.goto('/')
  await page.getByLabel('Nombre de usuario').fill(username)
  await page.getByRole('textbox', { name: /^Contraseña/ }).fill(password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(
    page.getByRole('button', { name: `Cerrar sesión de ${username}` }),
  ).toBeVisible()
}

async function openExercises(page) {
  await page.getByRole('tab', { name: 'Ejercicios' }).click()
  await expect(page.getByRole('heading', { name: 'Tus ejercicios' })).toBeVisible()
}

async function createExercise(page, name, description = '') {
  await page.getByRole('button', { name: 'Crear ejercicio', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Crear ejercicio' })
  await dialog.getByLabel('Nombre').fill(name)
  if (description) await dialog.getByLabel('Descripción (opcional)').fill(description)
  await dialog.getByRole('tab', { name: /Resumen/ }).click()
  await dialog.getByRole('button', { name: 'Crear ejercicio', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
}

async function deleteExercise(page, name) {
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: `Eliminar ${name}` }).click()
  await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0)
}

async function cleanupExercise(page, name) {
  const token = await page.evaluate(() => sessionStorage.getItem('accessToken'))
  if (!token) return
  const headers = { Authorization: `Bearer ${token}` }
  const response = await page.request.get('/api/exercises', { headers })
  if (!response.ok()) return
  const exercises = await response.json()
  const exercise = exercises.find((item) => item.name === name)
  if (exercise) {
    await page.request.delete(`/api/exercises/${exercise.id}`, { headers })
  }
}

test.beforeEach(async ({ page }) => {
  await login(page)
  await openExercises(page)
})

test('crea un ejercicio, lo muestra y lo elimina', async ({ page }) => {
  const name = uniqueName('e2e alta')
  try {
    await createExercise(page, name, 'Flujo completo creado por TP7')
    await deleteExercise(page, name)
  } finally {
    await cleanupExercise(page, name)
  }
})

test('muestra un error y no crea un ejercicio sin nombre', async ({ page }) => {
  const cardsBefore = await page.locator('article').count()
  await page.getByRole('button', { name: 'Crear ejercicio', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Crear ejercicio' })
  await dialog.getByRole('tab', { name: /Resumen/ }).click()
  await dialog.getByRole('button', { name: 'Crear ejercicio', exact: true }).click()

  await expect(dialog.getByRole('alert')).toContainText('Nombre es obligatorio.')
  await expect(page.locator('article')).toHaveCount(cardsBefore)
  await dialog.getByRole('button', { name: 'Cancelar' }).click()
  await expect(dialog).not.toBeVisible()
})

test('edita un ejercicio y conserva el cambio al recargar', async ({ page }) => {
  const originalName = uniqueName('e2e edición')
  const updatedName = `${originalName} actualizada`

  try {
    await createExercise(page, originalName)
    await page.getByRole('button', { name: `Editar ${originalName}` }).click()
    const dialog = page.getByRole('dialog', { name: `Editar ejercicio` })
    await dialog.getByLabel('Nombre').fill(updatedName)
    await dialog.getByLabel('Descripción (opcional)').fill('Persistencia comprobada')
    await dialog.getByRole('tab', { name: /Resumen/ }).click()
    await dialog.getByRole('button', { name: 'Guardar cambios' }).click()

    await expect(page.getByRole('heading', { name: updatedName, exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: originalName, exact: true })).toHaveCount(0)

    await page.reload()
    await openExercises(page)
    await expect(page.getByRole('heading', { name: updatedName, exact: true })).toBeVisible()
    await deleteExercise(page, updatedName)
  } finally {
    await cleanupExercise(page, originalName)
    await cleanupExercise(page, updatedName)
  }
})
