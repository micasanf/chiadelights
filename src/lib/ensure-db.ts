import { db } from '@/lib/db'

let tablesEnsured = false

/**
 * Ensures database tables exist before any operation.
 * Uses a simple flag to avoid re-checking on every request in the same process.
 * Tables are created with IF NOT EXISTS so it's safe to call repeatedly.
 */
export async function ensureTables(): Promise<void> {
  if (tablesEnsured) return

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        email TEXT,
        phone TEXT NOT NULL,
        address TEXT,
        delivery_method TEXT NOT NULL CHECK (delivery_method IN ('delivery', 'pickup')),
        flavor TEXT NOT NULL,
        size TEXT NOT NULL CHECK (size IN ('regular', 'large')),
        quantity INTEGER NOT NULL DEFAULT 1,
        payment_method TEXT NOT NULL CHECK (payment_method IN ('gcash', 'maya', 'bank_transfer', 'cod')),
        payment_proof TEXT,
        special_requests TEXT,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        data TEXT,
        date_range TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC)
    `)

    tablesEnsured = true
  } catch (error) {
    console.error('Error ensuring tables:', error)
    // Don't set the flag so it retries next time
    throw error
  }
}
