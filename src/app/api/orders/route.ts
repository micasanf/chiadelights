import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

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

    // Create the order using SQL
    const result = await sql`
      INSERT INTO orders (
        customer_name, email, phone, address, delivery_method,
        flavor, size, quantity, payment_method, payment_proof,
        special_requests, total_amount, status
      ) VALUES (
        ${customerName.trim()},
        ${email?.trim() || null},
        ${phone.trim()},
        ${address?.trim() || null},
        ${deliveryMethod},
        ${flavor.trim()},
        ${size},
        ${quantity},
        ${paymentMethod},
        ${paymentProof?.trim() || null},
        ${specialRequests?.trim() || null},
        ${totalAmount},
        'pending'
      )
      RETURNING id, customer_name, email, phone, address, delivery_method, flavor, size, quantity, payment_method, special_requests, total_amount, status, created_at, updated_at
    `

    const order = result.rows[0]

    // Transform snake_case to camelCase for frontend compatibility
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

    return NextResponse.json(formattedOrder, { status: 201 })
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
    const result = await sql`
      SELECT id, customer_name, email, phone, address, delivery_method,
        flavor, size, quantity, payment_method, special_requests,
        total_amount, status, created_at, updated_at
      FROM orders
      ORDER BY created_at DESC
    `

    const orders = result.rows.map((order) => ({
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
