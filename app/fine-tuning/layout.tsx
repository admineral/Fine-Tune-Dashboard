import { ReactNode } from 'react'

export default function FineTuningLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900">Fine-Tuning Dashboard</h1>
      </div>
      <main>{children}</main>
    </div>
  )
}