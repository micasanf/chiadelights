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

    // If delivery, address is required
    if (deliveryMethod === 'delivery' && (!address || typeof address !== 'string' || address.trim() === '')) {
      errors.push('address is required when deliveryMethod is "delivery"')
    }

    // If payment method is not COD, payment proof is required
    if (paymentMethod !== 'cod' && (!paymentProof || typeof paymentProof !== 'string' || paymentProof.trim() === '')) {
      errors.push('paymentProof is required when paymentMethod is not "cod"')
    }

    // Validate email format if provided
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

    // Create the order
    const order = await db.order.create({
      data: {
        customerName: customerName.trim(),
        email: email?.trim() || null,
        phone: phone.trim(),
        address: address?.trim() || null,
        deliveryMethod,
        flavor: flavor.trim(),
        size,
        quantity,
        paymentMethod,
        paymentProof: paymentProof?.trim() || null,
        specialRequests: specialRequests?.trim() || null,
        totalAmount,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// GET /api/orders - Get all orders (admin view)
export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
