import { NextResponse } from 'next/server'
import { cancelFineTuningJob } from '@/app/actions/fine-tuning'
import { logRequest, logResponse, logError } from '@/lib/logging'

export async function POST(request: Request, { params }: { params: { jobId: string } }) {
  // Record the start time to measure request duration
  const startTime = Date.now()
  
  // Log the incoming request
  logRequest('POST', 'cancelFineTuningJob', false)

  try {
    // Attempt to cancel the fine-tuning job
    const job = await cancelFineTuningJob(params.jobId)
    
    // Calculate the request duration
    const duration = Date.now() - startTime
    
    // Log the successful response
    logResponse('cancelFineTuningJob', 200, duration, job)
    
    // Return the job data as a JSON response
    return NextResponse.json(job)
  } catch (error) {
    // Calculate the request duration even for failed requests
    const duration = Date.now() - startTime
    
    // Log the error
    logError('POST', 'cancelFineTuningJob', error)
    
    // Return an error response
    return NextResponse.json({ error: 'Failed to cancel job' }, { status: 500 })
  }
}