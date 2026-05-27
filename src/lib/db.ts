import { sql } from '@vercel/postgres'

// Vercel Postgres SQL client
// When deployed on Vercel with a Postgres store, this automatically uses the connection string.
// Set DATABASE_URL in your Vercel project settings (or it's auto-set when you create a Vercel Postgres store).
export { sql }
