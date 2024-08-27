import { ReactNode } from 'react'

export default function FineTuningLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 text-center">
          <h1 className="text-3xl font-bold">Fine-Tuning Dashboard</h1>
        </div>
        <main className="pb-8">{children}</main>
      </div>
    </div>
  )
}