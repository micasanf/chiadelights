import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      customerName,
      email,
      phone,
      address,
      deliveryMethod,
      flavor,
      size,
      quantity,
      paymentMethod,
      paymentProof,
      specialRequests,
      totalAmount,
    } = body

    // Validate required fields
    const errors: string[] = []

    if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
      errors.push('customerName is required')
    }

    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      errors.push('phone is required')
    }

    if (!deliveryMethod || !['delivery', 'pickup'].includes(deliveryMethod)) {
      errors.push('deliveryMethod must be "delivery" or "pickup"')
    }

    if (!flavor || typeof flavor !== 'string' || flavor.trim() === '') {
      errors.push('flavor is required')
    }

    if (!size || !['regular', 'large'].includes(size)) {
      errors.push('size must be "regular" or "large"')
    }

    if (!quantity || typeof quantity !== 'number' || quantity < 1) {
      errors.push('quantity must be a positive number')
    }

    if (!paymentMethod || !['gcash', 'maya', 'bank_transfer', 'cod'].includes(paymentMethod)) {
      errors.push('paymentMethod must be one of: gcash, maya, bank_transfer, cod')
    }

    if (typeof totalAmount !== 'number' || totalAmount < 0) {
      errors.push('totalAmount must be a non-negative number')
    }

    if (deliveryMethod === 'delivery' && (!address || typeof address !== 'string' || address.trim() === '')) {
      errors.push('address is required when deliveryMethod is "delivery"')
    }

    if (paymentMethod !== 'cod' && (!paymentProof || typeof paymentProof !== 'string' || paymentProof.trim() === '')) {
      errors.push('paymentProof is required when paymentMethod is not "cod"')
    }

    if (email && typeof email === 'string' && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        errors.push('email must be a valid email address')
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Generate a unique ID
    const id = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    const now = new Date().toISOString()

    // Create the order using Turso
    await db.execute({
      sql: `INSERT INTO orders (
        id, customer_name, email, phone, address, delivery_method,
        flavor, size, quantity, payment_method, payment_proof,
        special_requests, total_amount, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        customerName.trim(),
        email?.trim() || null,
        phone.trim(),
        address?.trim() || null,
        deliveryMethod,
        flavor.trim(),
        size,
        quantity,
        paymentMethod,
        paymentProof?.trim() || null,
        specialRequests?.trim() || null,
        totalAmount,
        'pending',
        now,
        now,
      ],
    })

    // Return the created order
    const order = {
      id,
      customerName: customerName.trim(),
      email: email?.trim() || null,
      phone: phone.trim(),
      address: address?.trim() || null,
      deliveryMethod,
      flavor: flavor.trim(),
      size,
      quantity,
      paymentMethod,
      specialRequests: specialRequests?.trim() || null,
      totalAmount,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// GET /api/orders - Get all orders
export async function GET() {
  try {
    const result = await db.execute('SELECT * FROM orders ORDER BY created_at DESC')

    const orders = result.rows.map((row) => ({
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
    }))

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
