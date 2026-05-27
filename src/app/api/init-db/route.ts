import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/init-db - Initialize the database tables
// This endpoint creates the orders table if it doesn't exist
export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY DEFAULT 'ord_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 20),
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
        total_amount DOUBLE PRECISION NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)
    `

    // Create the trigger function
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `

    // Create the trigger
    await sql`
      DROP TRIGGER IF EXISTS orders_updated_at ON orders
    `

    await sql`
      CREATE TRIGGER orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at()
    `

    return NextResponse.json({ success: true, message: 'Database initialized successfully' })
  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
