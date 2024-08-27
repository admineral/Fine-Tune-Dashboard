import { NextRequest, NextResponse } from 'next/server'
import { listFineTuningJobs } from '@/app/actions/fine-tuning'
import { logRequest, logResponse, logError } from '@/lib/logging'
import { ListFineTuningJobsRequest } from '@/types/fine-tuning'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  logRequest('GET', 'listFineTuningJobs (API)', false)

  try {
    const searchParams = request.nextUrl.searchParams
    const params: ListFineTuningJobsRequest = Object.fromEntries(searchParams.entries())

    const jobs = await listFineTuningJobs(params)
    const duration = Date.now() - startTime
    logResponse('listFineTuningJobs (API)', 200, duration, { totalJobs: jobs.totalJobs })
    return NextResponse.json(jobs)
  } catch (error: unknown) {
    const duration = Date.now() - startTime
    logError('GET', 'listFineTuningJobs (API)', error as Error)
    return NextResponse.json({ error: 'Failed to list jobs', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}