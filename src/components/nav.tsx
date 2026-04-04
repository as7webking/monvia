'use client'

import Link from "next/link"
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'

export function Nav() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-card border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">Monvia</Link>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/income" className="hover:underline">Income</Link>
            <Link href="/expenses" className="hover:underline">Expenses</Link>
            <Link href="/time" className="hover:underline">Time</Link>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}