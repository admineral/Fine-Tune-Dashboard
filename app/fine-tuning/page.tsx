import { Suspense } from 'react'
import { listFineTuningJobs } from '../actions/fine-tuning'
import FineTuningJobList from './FineTuningJobList'
import CreateFineTuningJobForm from './CreateFineTuningJobForm'
import Loading from './loading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FineTuningJob } from '@/types/fine-tuning'

export default async function FineTuningPage() {
  let jobs: FineTuningJob[] = [];
  let error: string | null = null;

  try {
    const response = await listFineTuningJobs();
    if ('data' in response && Array.isArray(response.data)) {
      jobs = response.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'An unexpected error occurred';
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OpenAI Fine-tuning Dashboard</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Suspense fallback={<Loading />}>
        <Tabs defaultValue="jobs" className="mb-4">
          <TabsList>
            <TabsTrigger value="jobs">Jobs List</TabsTrigger>
            <TabsTrigger value="create">Create Job</TabsTrigger>
          </TabsList>
          <TabsContent value="jobs">
            <FineTuningJobList initialJobs={jobs} />
          </TabsContent>
          <TabsContent value="create">
            <CreateFineTuningJobForm />
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  )
}