import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE /api/reports/[id] - Delete a report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.execute({ sql: 'SELECT id FROM reports WHERE id = ?', args: [id] })
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    await db.execute({ sql: 'DELETE FROM reports WHERE id = ?', args: [id] })

    return NextResponse.json({ success: true, message: 'Report deleted' })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 })
  }
}
