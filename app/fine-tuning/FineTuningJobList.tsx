'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FineTuningJob, FineTuningJobResponse } from '@/types/fine-tuning'
import { listFineTuningJobs, cancelFineTuningJob } from '../actions/fine-tuning'

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

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const response = await listFineTuningJobs()
      if ('data' in response) {
        setJobs(response.data)
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(intervalId)
  }, [])

  const handleCancel = async (jobId: string) => {
    await cancelFineTuningJob(jobId)
    const response = await listFineTuningJobs()
    if ('data' in response) {
      setJobs(response.data)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fine-tuning Jobs</CardTitle>
      </CardHeader>
      <CardContent>
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
                    <Button onClick={() => handleCancel(job.id)}>Cancel</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}