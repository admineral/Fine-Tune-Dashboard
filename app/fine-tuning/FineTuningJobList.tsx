'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FineTuningJob } from '@/types/fine-tuning'
import { listFineTuningJobs, cancelFineTuningJob } from '../actions/fine-tuning'
import { toast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'
import { RefreshCw } from "lucide-react";

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

export default function FineTuningJobList({ initialJobs }: { initialJobs: FineTuningJob[] }) {
  const [jobs, setJobs] = useState<FineTuningJob[]>(initialJobs)
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const router = useRouter()

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/fine-tuning/jobs?timestamp=' + Date.now());
      const data = await response.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(); // Fetch jobs immediately when component mounts
    const intervalId = setInterval(fetchJobs, 30000) // Update every 30 seconds

    return () => clearInterval(intervalId)
  }, [])

  const handleCancel = async (jobId: string) => {
    setIsCancelling(true)
    try {
      await cancelFineTuningJob(jobId)
      router.refresh() // This will trigger a re-render with fresh data
      toast({
        title: "Success",
        description: "Job cancelled successfully.",
      })
    } catch (error) {
      console.error('Failed to cancel job:', error)
      toast({
        title: "Error",
        description: "Failed to cancel job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Fine-Tuning Jobs</h2>
        <Button onClick={fetchJobs} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Fine-tuning Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && jobs.length === 0 ? (
            <p>Loading jobs...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.id}</TableCell>
                    <TableCell>{job.model}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(job.status)}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(job.created_at * 1000).toLocaleString()}</TableCell>
                    <TableCell>
                      {job.status === 'running' && (
                        <Button 
                          onClick={() => handleCancel(job.id)} 
                          disabled={isCancelling}
                        >
                          {isCancelling ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}