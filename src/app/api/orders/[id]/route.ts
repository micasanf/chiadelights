import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/orders/[id] - Get a single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await sql`
      SELECT id, customer_name, email, phone, address, delivery_method,
        flavor, size, quantity, payment_method, special_requests,
        total_amount, status, created_at, updated_at
      FROM orders
      WHERE id = ${id}
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = result.rows[0]
    const formattedOrder = {
      id: order.id,
      customerName: order.customer_name,
      email: order.email,
      phone: order.phone,
      address: order.address,
      deliveryMethod: order.delivery_method,
      flavor: order.flavor,
      size: order.size,
      quantity: order.quantity,
      paymentMethod: order.payment_method,
      specialRequests: order.special_requests,
      totalAmount: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }

    return NextResponse.json(formattedOrder)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
