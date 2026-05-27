import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/verify - Verify admin session
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value
    const user = request.cookies.get('admin_user')?.value

    if (!token || !user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // If both cookies exist, consider authenticated
    // (In production, you'd verify the token against a store)
    return NextResponse.json({
      authenticated: true,
      username: user,
    })
  } catch (error) {
    console.error('Error verifying admin session:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}
