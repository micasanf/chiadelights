import { createClient, type Client } from '@libsql/client'

const globalForDb = globalThis as unknown as {
  turso: Client | undefined
}

function createDbClient() {
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

export const db = globalForDb.turso ?? createDbClient()

if (process.env.NODE_ENV !== 'production') globalForDb.turso = db
