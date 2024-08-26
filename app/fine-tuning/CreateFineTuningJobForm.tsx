'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createFineTuningJob } from '../actions/fine-tuning'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateFineTuningJobForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      formData.append('apiKey', apiKey)
      await createFineTuningJob(formData)
      router.refresh()
    } catch (error) {
      console.error('Failed to create fine-tuning job:', error)
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
            <Input id="model" name="model" required />
          </div>
          <div>
            <Label htmlFor="training_file">Training File ID</Label>
            <Input id="training_file" name="training_file" required />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Fine-Tuning Job'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}