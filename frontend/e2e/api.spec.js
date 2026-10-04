import { expect, test } from '@playwright/test'

const API = process.env.API_BASE_URL || 'http://localhost:8080'
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

async function authenticate(request) {
  const response = await request.post(`${API}/api/auth/login`, {
    data: { username, password },
  })
  expect(response.status()).toBe(200)
  const body = await response.json()
  expect(body.accessToken).toEqual(expect.any(String))
  return { Authorization: `Bearer ${body.accessToken}` }
}

async function listExercises(request, headers) {
  const response = await request.get(`${API}/api/exercises`, { headers })
  expect(response.status()).toBe(200)
  return await response.json()
}

async function removeExercise(request, headers, id) {
  if (id === undefined) return
  const response = await request.delete(`${API}/api/exercises/${id}`, {
    headers,
  })
  expect([204, 404]).toContain(response.status())
}

test('el alta persiste el ejercicio y el borrado lo elimina', async ({ request }) => {
  const headers = await authenticate(request)
  const name = uniqueName('api alta')
  let createdID

  try {
    const creation = await request.post(`${API}/api/exercises`, {
      headers,
      data: {
        name,
        description: 'Creado por integración TP7',
        imageUrl: '',
        videoUrl: '',
      },
    })
    expect(creation.status()).toBe(201)
    const created = await creation.json()
    expect(created).toMatchObject({ name })
    expect(created.id).toEqual(expect.any(Number))
    createdID = created.id

    const afterCreation = await listExercises(request, headers)
    expect(afterCreation).toContainEqual(expect.objectContaining({ id: createdID, name }))

    const deletion = await request.delete(`${API}/api/exercises/${createdID}`, {
      headers,
    })
    expect(deletion.status()).toBe(204)
    createdID = undefined

    const afterDeletion = await listExercises(request, headers)
    expect(afterDeletion.some((exercise) => exercise.name === name)).toBe(false)
  } finally {
    await removeExercise(request, headers, createdID)
  }
})

test('un nombre vacío devuelve 400 y no crea un ejercicio', async ({ request }) => {
  const headers = await authenticate(request)
  const before = await listExercises(request, headers)

  const creation = await request.post(`${API}/api/exercises`, {
    headers,
    data: { name: '', description: '', imageUrl: '', videoUrl: '' },
  })

  expect(creation.status()).toBe(400)
  const body = await creation.json()
  expect(body.error.code).toBe('validation_failed')
  expect(body.error.fields.name).toContain('Es obligatorio.')

  const after = await listExercises(request, headers)
  expect(after.map((exercise) => exercise.id).sort()).toEqual(
    before.map((exercise) => exercise.id).sort(),
  )
})

test('la actualización queda persistida en la base', async ({ request }) => {
  const headers = await authenticate(request)
  const originalName = uniqueName('api edición')
  const updatedName = `${originalName} actualizada`
  let createdID

  try {
    const creation = await request.post(`${API}/api/exercises`, {
      headers,
      data: { name: originalName, description: '', imageUrl: '', videoUrl: '' },
    })
    expect(creation.status()).toBe(201)
    const created = await creation.json()
    createdID = created.id

    const update = await request.put(`${API}/api/exercises/${createdID}`, {
      headers,
      data: {
        name: updatedName,
        description: 'Descripción actualizada por integración',
        imageUrl: '',
        videoUrl: '',
      },
    })
    expect(update.status()).toBe(200)
    expect(await update.json()).toMatchObject({
      id: createdID,
      name: updatedName,
      description: 'Descripción actualizada por integración',
    })

    const persisted = await request.get(`${API}/api/exercises/${createdID}`, {
      headers,
    })
    expect(persisted.status()).toBe(200)
    expect(await persisted.json()).toMatchObject({ id: createdID, name: updatedName })

    await removeExercise(request, headers, createdID)
    createdID = undefined
    const afterDeletion = await listExercises(request, headers)
    expect(afterDeletion.some((exercise) => exercise.name === updatedName)).toBe(false)
  } finally {
    await removeExercise(request, headers, createdID)
  }
})
