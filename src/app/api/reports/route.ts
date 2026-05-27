import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ensureTables } from '@/lib/ensure-db'

// POST /api/reports - Upload a report/sheet
export async function POST(request: NextRequest) {
  try {
    await ensureTables()
    const body = await request.json()
    const { title, type, data, dateRange } = body

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      )
    }

    const id = `rpt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
    const now = new Date().toISOString()

    await db.execute({
      sql: `INSERT INTO reports (id, title, type, data, date_range, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, title, type, data ? JSON.stringify(data) : null, dateRange || null, now, now],
    })

    return NextResponse.json({ id, title, type, dateRange, createdAt: now }, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }
}

// GET /api/reports - Get all reports
export async function GET() {
  try {
    await ensureTables()
    const result = await db.execute('SELECT * FROM reports ORDER BY created_at DESC')

    const reports = result.rows.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      type: row.type as string,
      data: row.data ? JSON.parse(row.data as string) : null,
      dateRange: row.date_range as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }))

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
