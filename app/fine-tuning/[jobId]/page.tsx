import { retrieveFineTuningJob, listFineTuningEvents } from '../../actions/fine-tuning'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { Button } from "@/components/ui/button"

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

export default async function JobDetailsPage({ params }: { params: { jobId: string } }) {
  const job = await retrieveFineTuningJob(params.jobId)
  const events = await listFineTuningEvents(params.jobId)

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Job Details: {job.id}</h1>
        <Link href="/fine-tuning">
          <Button variant="outline">Back to Jobs</Button>
        </Link>
      </div>

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
    </div>
  )
}