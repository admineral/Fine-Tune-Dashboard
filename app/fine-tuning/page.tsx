'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { RefreshCw, Upload, List } from 'lucide-react'
import { listFineTuningJobs, cancelFineTuningJob } from '../actions/fine-tuning'
import { uploadJSONLFile, startFineTuning } from '../Generator/actions'
import { FineTuningJob } from '@/types/fine-tuning'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

export default function FineTuningPage() {
  const [jobs, setJobs] = useState<FineTuningJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modelName, setModelName] = useState('gpt-4o-2024-08-06')
  const [file, setFile] = useState<File | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [previewContent, setPreviewContent] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const response = await listFineTuningJobs({})
      if ('jobs' in response && Array.isArray(response.jobs)) {
        setJobs(response.jobs)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a JSONL file to upload.",
        variant: "destructive",
      })
      return
    }
    try {
      const fileContent = await file.text()
      const lines = fileContent.split('\n')
      setPreviewContent(lines.slice(0, 10)) // Preview first 10 lines
      setShowConfirmDialog(true)
    } catch (error) {
      console.error('Failed to read file:', error)
      toast({
        title: "Error",
        description: "Failed to read the selected file.",
        variant: "destructive",
      })
    }
  }

  const confirmUpload = async () => {
    setIsCreating(true)
    setShowConfirmDialog(false)
    setError(null)
    try {
      const fileContent = await file!.text()
      const uploadedFileId = await uploadJSONLFile(fileContent)
      const fineTuningJob = await startFineTuning(uploadedFileId, modelName)
      toast({
        title: "Success",
        description: "Fine-tuning job created successfully.",
      })
      fetchJobs()
    } catch (error) {
      console.error('Failed to create fine-tuning job:', error)
      if (error instanceof Error) {
        if (error.message.includes('Rate limit')) {
          setError("You've reached the rate limit for creating fine-tuning jobs. Your organization has reached the maximum of 5 fine-tuning requests per day for the model 'gpt-4o-2024-08-06'.")
        } else {
          setError(error.message)
        }
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancelJob = async (jobId: string) => {
    try {
      await cancelFineTuningJob(jobId)
      toast({
        title: "Success",
        description: "Job cancelled successfully.",
      })
      fetchJobs()
    } catch (error) {
      console.error('Failed to cancel job:', error)
      toast({
        title: "Error",
        description: "Failed to cancel job. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fine-Tuning Jobs</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-6 w-6" />
              Create Fine-Tuning Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="modelName">Model Name</Label>
                <Input
                  id="modelName"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Enter model name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Upload JSONL File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".jsonl"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Fine-Tuning Job'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <List className="mr-2 h-6 w-6" />
              Fine-tuning Jobs
            </CardTitle>
            <Button onClick={fetchJobs} disabled={isLoading} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <p>No fine-tuning jobs found.</p>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{job.id}</h3>
                          <p>Model: {job.model}</p>
                          <p>Status: <span className={`badge ${getBadgeVariant(job.status)}`}>{job.status}</span></p>
                          <p>Created at: {new Date(job.created_at * 1000).toLocaleString()}</p>
                        </div>
                        {job.status === 'running' && (
                          <Button onClick={() => handleCancelJob(job.id)} variant="destructive" size="sm">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Upload</DialogTitle>
            <DialogDescription>
              You are about to upload the following Q&A pairs:
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto">
            {previewContent.map((line, index) => (
              <div key={index} className="mb-2">
                <pre className="whitespace-pre-wrap break-words">{line}</pre>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={confirmUpload}>Confirm Upload</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}