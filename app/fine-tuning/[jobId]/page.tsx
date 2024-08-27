import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { retrieveFineTuningJob, listFineTuningEvents } from '../../actions/fine-tuning'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { FineTuningJob, FineTuningEvent } from '@/types/fine-tuning'

function getBadgeVariant(status: string): "default" | "destructive" | "outline" | "secondary" {
  switch (status) {
    case 'succeeded':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'running':
      return 'default';
    default:
      return 'outline';
  }
}

async function JobDetails({ jobId }: { jobId: string }) {
  let job: FineTuningJob;
  try {
    job = await retrieveFineTuningJob(jobId);
  } catch (error) {
    console.error('Failed to retrieve job:', error);
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">ID</TableCell>
              <TableCell>{job.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Model</TableCell>
              <TableCell>{job.model}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Status</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(job.status)}>
                  {job.status}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Created At</TableCell>
              <TableCell>{new Date(job.created_at * 1000).toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

async function JobEvents({ jobId }: { jobId: string }) {
  let events: FineTuningEvent[];
  try {
    events = await listFineTuningEvents(jobId);
  } catch (error) {
    console.error('Failed to list events:', error);
    return <div>Failed to load events.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Events</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created At</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{new Date(event.created_at * 1000).toLocaleString()}</TableCell>
                <TableCell>{event.level}</TableCell>
                <TableCell>{event.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function JobDetailsPage({ params }: { params: { jobId: string } }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Job Details: {params.jobId}</h1>
        <Link href="/fine-tuning">
          <Button variant="outline">Back to Jobs</Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading job details...</div>}>
        <JobDetails jobId={params.jobId} />
      </Suspense>

      <Suspense fallback={<div>Loading job events...</div>}>
        <JobEvents jobId={params.jobId} />
      </Suspense>
    </div>
  )
}

export const revalidate = 60; // Revalidate this page every 60 seconds