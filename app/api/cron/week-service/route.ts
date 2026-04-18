import { NextRequest, NextResponse } from 'next/server'
import { weekService } from '@/lib/service/week-service'

/**
 * Cron endpoint for WEEK-SERVICE pre-stay reminders and post-stay reviews
 * Runs every hour
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '')
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Send overdue reminders
    await weekService.sendOverdueReminders()

    return NextResponse.json({
      success: true,
      message: 'WEEK-SERVICE tasks executed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[WEEK-SERVICE Cron] Error:', error)
    return NextResponse.json(
      { error: 'Cron execution failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
