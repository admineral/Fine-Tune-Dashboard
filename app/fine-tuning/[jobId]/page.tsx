import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { retrieveFineTuningJob, listFineTuningEvents, cancelFineTuningJob } from '../../actions/fine-tuning'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { FineTuningJob, FineTuningEvent } from '@/types/fine-tuning'
import { RefreshCw, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

function getBadgeVariant(status: string): "default" | "destructive" | "outline" | "secondary" {
  switch (status) {
    case 'succeeded':
      return 'secondary';
    case 'failed':
    case 'cancelled':
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

  const handleCancel = async () => {
    try {
      await cancelFineTuningJob(jobId);
      toast({
        title: "Success",
        description: "Job cancelled successfully.",
      });
    } catch (error) {
      console.error('Failed to cancel job:', error);
      toast({
        title: "Error",
        description: "Failed to cancel job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canBeCancelled = job.status !== 'cancelled' && job.status !== 'succeeded' && job.status !== 'failed';

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="text-2xl">Job Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-sm font-medium text-gray-500">ID</p>
            <p className="mt-1 text-lg font-semibold">{job.id}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-sm font-medium text-gray-500">Model</p>
            <p className="mt-1 text-lg font-semibold">{job.model}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-sm font-medium text-gray-500">Status</p>
            <Badge className="mt-1" variant={getBadgeVariant(job.status)}>
              {job.status}
            </Badge>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-sm font-medium text-gray-500">Created At</p>
            <p className="mt-1 text-lg font-semibold">{new Date(job.created_at * 1000).toLocaleString()}</p>
          </div>
        </div>
        {canBeCancelled && (
          <div className="mt-6">
            <Button onClick={handleCancel} variant="destructive">
              Cancel Job
            </Button>
          </div>
        )}
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
    <Card className="overflow-hidden shadow-lg mt-8">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
        <CardTitle className="text-2xl">Job Events</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Created At</TableHead>
                <TableHead className="w-1/4">Level</TableHead>
                <TableHead className="w-1/2">Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{new Date(event.created_at * 1000).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={event.level === 'error' ? 'destructive' : 'default'}>
                      {event.level}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobDetailsPage({ params }: { params: { jobId: string } }) {
  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Job Details: {params.jobId}
        </h1>
        <Link href="/fine-tuning">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="text-center">Loading job details...</div>}>
        <JobDetails jobId={params.jobId} />
      </Suspense>

      <Suspense fallback={<div className="text-center">Loading job events...</div>}>
        <JobEvents jobId={params.jobId} />
      </Suspense>
    </div>
  )
}

export const revalidate = 60; // Revalidate this page every 60 seconds