'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createFineTuningJob } from '../actions/fine-tuning'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

export default function CreateFineTuningJobForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('gpt-4o-2024-08-06')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiKey(localStorage.getItem('openaiApiKey') || '')
    }
  }, [])

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value
    setApiKey(newApiKey)
    if (typeof window !== 'undefined') {
      localStorage.setItem('openaiApiKey', newApiKey)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!file) {
      setError("Please select a JSONL file to upload.")
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('apiKey', apiKey)
      formData.append('model', model)
      formData.append('file', file)
      formData.append('training_file', file.name) // Add this line

      const result = await createFineTuningJob(formData)
      toast({
        title: "Success",
        description: "Fine-tuning job created successfully.",
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to create fine-tuning job:', error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
      toast({
        title: "Error",
        description: "Failed to create fine-tuning job.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Fine-Tuning Job</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="Enter your OpenAI API key"
            />
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <Input 
              id="model" 
              name="model" 
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required 
            />
          </div>
          <div>
            <Label htmlFor="file">Upload JSONL File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".jsonl"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Fine-Tuning Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}