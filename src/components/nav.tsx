'use client'

import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (mounted) setIsAuthenticated(!!data.session)
    }

    loadSession()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setIsAuthenticated(!!session)
    })

    return () => {
      mounted = false
      data?.subscription?.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    setIsOpen(false)
  }

  return (
    <nav className="bg-card border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold" onClick={() => setIsOpen(false)}>Monvia</Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/income" className="hover:underline">Income</Link>
            <Link href="/expenses" className="hover:underline">Expenses</Link>
            <Link href="/time" className="hover:underline">Time</Link>
            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-3">
              <Link href="/dashboard" className="hover:underline" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Link href="/income" className="hover:underline" onClick={() => setIsOpen(false)}>Income</Link>
              <Link href="/expenses" className="hover:underline" onClick={() => setIsOpen(false)}>Expenses</Link>
              <Link href="/time" className="hover:underline" onClick={() => setIsOpen(false)}>Time</Link>
              {isAuthenticated ? (
                <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
                  Logout
                </Button>
              ) : (
                <Link href="/login" className="w-full" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Login</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}