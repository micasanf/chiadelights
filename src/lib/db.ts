import { createClient, type Client } from '@libsql/client'

const globalForDb = globalThis as unknown as {
  turso: Client | undefined
}

function createDbClient(): Client {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL

  if (!url) {
    throw new Error('TURSO_DATABASE_URL or DATABASE_URL environment variable is not set')
  }

  const authToken = process.env.TURSO_AUTH_TOKEN

  return createClient({
    url,
    authToken: authToken || undefined,
  })
}

// Lazy initialization - only create the client when first accessed
// This prevents build-time errors when env vars aren't set
let _db: Client | undefined = undefined

export function getDb(): Client {
  if (process.env.NODE_ENV !== 'production') {
    if (!globalForDb.turso) {
      globalForDb.turso = createDbClient()
    }
    return globalForDb.turso
  }

  if (!_db) {
    _db = createDbClient()
  }
  return _db
}

// Default export for convenience (lazy)
export const db = new Proxy({} as Client, {
  get(_target, prop, receiver) {
    const client = getDb()
    const value = Reflect.get(client, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
