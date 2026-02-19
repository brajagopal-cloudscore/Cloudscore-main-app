import { NextRequest, NextResponse } from 'next/server'
import { db, riskList } from '@db'
import { trackGET, TRACKING_OPTIONS } from '@/lib/api-tracking-wrappers'

/**
 * GET /api/risk-list
 * Fetches all active risk list items from the database
 * 
 * This route now includes automatic API tracking for PostHog analytics.
 * Tracks: request/response times, user context, error rates, and usage patterns.
 */
export const GET = trackGET(async (request: NextRequest) => {
  try {
    const risks = await db
      .select()
      .from(riskList)
      .orderBy(riskList.riskName)
    
    return NextResponse.json({
      success: true,
      data: risks,
    })
  } catch (error) {
    console.error('Error fetching risk list:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch risk list',
      },
      { status: 500 }
    )
  }
}, TRACKING_OPTIONS.DEFAULT)
