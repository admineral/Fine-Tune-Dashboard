import { Suspense } from 'react'
import { listFineTuningJobs } from '../actions/fine-tuning'
import FineTuningJobList from './FineTuningJobList'
import CreateFineTuningJobForm from './CreateFineTuningJobForm'
import Loading from './loading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { List, PlusCircle, Zap, Shield, Sparkles } from 'lucide-react'
import { FineTuningJob } from '@/types/fine-tuning'

export const revalidate = 36000 // revalidate every hour

export default async function FineTuningPage() {
  let jobs: FineTuningJob[] = [];
  let error: string | null = null;

  try {
    const response = await listFineTuningJobs({});
    if ('jobs' in response && Array.isArray(response.jobs)) {
      jobs = response.jobs;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (e) {
    error = e instanceof Error ? e.message : 'An unexpected error occurred';
  }

  return (
    <>
      <h1 className="text-5xl sm:text-6xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        OpenAI Fine-tuning Dashboard
      </h1>
      <p className="text-xl text-center mb-10 max-w-2xl">
        Manage and create fine-tuning jobs to enhance your AI models.
      </p>
      
      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-900 border-red-700">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Suspense fallback={<Loading />}>
        <Tabs defaultValue="jobs" className="w-full max-w-4xl">
          <TabsList className="bg-gray-800 p-1 rounded-lg mb-6">
            <TabsTrigger value="jobs" className="data-[state=active]:bg-blue-600">
              <List className="mr-2 h-4 w-4" /> Jobs List
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-green-600">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Job
            </TabsTrigger>
          </TabsList>
          <TabsContent value="jobs">
            <FineTuningJobList initialJobs={jobs} />
          </TabsContent>
          <TabsContent value="create">
            <CreateFineTuningJobForm />
          </TabsContent>
        </Tabs>
      </Suspense>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
        <FeatureCard
          icon={<Zap className="w-10 h-10 text-yellow-400" />}
          title="Lightning Fast"
          description="Optimize your models with unparalleled speed and efficiency."
        />
        <FeatureCard
          icon={<Shield className="w-10 h-10 text-green-400" />}
          title="Secure & Private"
          description="Your data and models are protected with state-of-the-art security measures."
        />
        <FeatureCard
          icon={<Sparkles className="w-10 h-10 text-purple-400" />}
          title="Cutting-Edge Tech"
          description="Access the latest advancements in AI and machine learning."
        />
      </div>
    </>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-gray-300 text-center">{description}</p>
    </div>
  )
}