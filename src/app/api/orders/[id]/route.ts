import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/orders/[id] - Get a single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await db.execute({
      sql: 'SELECT * FROM orders WHERE id = ?',
      args: [id],
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const row = result.rows[0]
    const order = {
      id: row.id as string,
      customerName: row.customer_name as string,
      email: row.email as string | null,
      phone: row.phone as string,
      address: row.address as string | null,
      deliveryMethod: row.delivery_method as string,
      flavor: row.flavor as string,
      size: row.size as string,
      quantity: row.quantity as number,
      paymentMethod: row.payment_method as string,
      specialRequests: row.special_requests as string | null,
      totalAmount: row.total_amount as number,
      status: row.status as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
