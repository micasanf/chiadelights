import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/orders/[id] - Update an order (status, details)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if order exists
    const existing = await db.execute({ sql: 'SELECT id FROM orders WHERE id = ?', args: [id] })
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Build dynamic update query
    const updates: string[] = []
    const values: (string | number | null)[] = []

    if (body.status !== undefined) {
      updates.push('status = ?')
      values.push(body.status)
    }
    if (body.customerName !== undefined) {
      updates.push('customer_name = ?')
      values.push(body.customerName)
    }
    if (body.email !== undefined) {
      updates.push('email = ?')
      values.push(body.email)
    }
    if (body.phone !== undefined) {
      updates.push('phone = ?')
      values.push(body.phone)
    }
    if (body.address !== undefined) {
      updates.push('address = ?')
      values.push(body.address)
    }
    if (body.deliveryMethod !== undefined) {
      updates.push('delivery_method = ?')
      values.push(body.deliveryMethod)
    }
    if (body.flavor !== undefined) {
      updates.push('flavor = ?')
      values.push(body.flavor)
    }
    if (body.size !== undefined) {
      updates.push('size = ?')
      values.push(body.size)
    }
    if (body.quantity !== undefined) {
      updates.push('quantity = ?')
      values.push(body.quantity)
    }
    if (body.paymentMethod !== undefined) {
      updates.push('payment_method = ?')
      values.push(body.paymentMethod)
    }
    if (body.specialRequests !== undefined) {
      updates.push('special_requests = ?')
      values.push(body.specialRequests)
    }
    if (body.totalAmount !== undefined) {
      updates.push('total_amount = ?')
      values.push(body.totalAmount)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    updates.push("updated_at = datetime('now')")
    values.push(id)

    await db.execute({
      sql: `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      args: values,
    })

    // Fetch updated order
    const result = await db.execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [id] })
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
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

// DELETE /api/orders/[id] - Delete an order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.execute({ sql: 'SELECT id FROM orders WHERE id = ?', args: [id] })
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    await db.execute({ sql: 'DELETE FROM orders WHERE id = ?', args: [id] })

    return NextResponse.json({ success: true, message: 'Order deleted' })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}

// GET /api/orders/[id] - Get a single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await db.execute({ sql: 'SELECT * FROM orders WHERE id = ?', args: [id] })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
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
      paymentProof: row.payment_proof as string | null,
      specialRequests: row.special_requests as string | null,
      totalAmount: row.total_amount as number,
      status: row.status as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}
