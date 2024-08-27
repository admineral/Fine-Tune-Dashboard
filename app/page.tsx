import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, Sparkles, Database } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header className="p-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold">AI Fine-Tuning</div>
          <div className="space-x-4">
            <Link href="/docs" className="hover:text-blue-400 transition-colors">Docs</Link>
            <Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Elevate Your AI Models
        </h1>
        <p className="text-xl text-center mb-10 max-w-2xl">
          Harness the power of advanced fine-tuning techniques to create AI models tailored to your specific needs.
        </p>
        <div className="flex space-x-4">
          <Link href="/fine-tuning" passHref>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105">
              Start Fine-Tuning <ArrowRight className="ml-2" />
            </Button>
          </Link>
          <Link href="/Generator" passHref>
            <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105">
              QA Generator <Database className="ml-2" />
            </Button>
          </Link>
        </div>

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
      </main>

      <footer className="mt-auto p-6 text-center text-sm opacity-75">
        © {new Date().getFullYear()} AI Fine-Tuning Platform. All rights reserved.
      </footer>
    </div>
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
