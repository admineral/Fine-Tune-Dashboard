import { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function FineTuningLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header className="p-6">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:text-blue-400 transition-colors">AI Fine-Tuning</Link>
          <div className="space-x-4">
            <Link href="/docs" className="hover:text-blue-400 transition-colors">Docs</Link>
            <Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link>
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="mt-auto p-6 text-center text-sm opacity-75">
        © {new Date().getFullYear()} AI Fine-Tuning Platform. All rights reserved.
      </footer>
    </div>
  )
}