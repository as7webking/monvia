'use client'

import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useCompany } from '@/contexts/company-context'
import { getAccountAccess } from '@/lib/account-access'
import { Button } from '@/components/ui/button'
import { BriefcaseBusiness, Menu, X, User } from 'lucide-react'

export function Nav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [accountEmail, setAccountEmail] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  const { companies, currentCompanyId, loading, setCurrentCompanyId } = useCompany()
  const accountAccess = getAccountAccess(accountEmail)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (mounted) {
        setIsAuthenticated(!!data.session)
        setAccountEmail(data.session?.user?.email ?? null)
      }
    }

    loadSession()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session)
        setAccountEmail(session?.user?.email ?? null)
      }
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
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-bold" onClick={() => setIsOpen(false)}>Monvia</Link>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              {accountAccess.badgeLabel}
            </span>
            <div className="min-w-[220px]">
              <label htmlFor="company-selector" className="sr-only">Current company</label>
              <select
                id="company-selector"
                value={currentCompanyId ?? ''}
                onChange={(e) => setCurrentCompanyId(e.target.value)}
                disabled={loading || companies.length === 0}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {companies.length === 0 ? (
                  <option value="">Create your first workspace</option>
                ) : (
                  companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} ({company.type})
                    </option>
                  ))
                )}
              </select>
            </div>
            <Link href="/dashboard" className="hover:underline text-sm">Dashboard</Link>
            <Link href="/onboarding" className="hover:underline text-sm">Add Workspace</Link>
            <Link href="/income" className="hover:underline text-sm">Income</Link>
            <Link href="/expenses" className="hover:underline text-sm">Expenses</Link>
            <Link href="/time" className="hover:underline text-sm">Time</Link>
            {isAuthenticated && (
              <Link href="/profile" className="hover:underline text-sm flex items-center gap-1">
                <User className="h-4 w-4" />
                Profile
              </Link>
            )}
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
              <select
                value={currentCompanyId ?? ''}
                onChange={(e) => setCurrentCompanyId(e.target.value)}
                disabled={loading || companies.length === 0}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {companies.length === 0 ? (
                  <option value="">Create your first workspace</option>
                ) : (
                  companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} ({company.type})
                    </option>
                  ))
                )}
              </select>
              <Link href="/dashboard" className="hover:underline" onClick={() => setIsOpen(false)}>Dashboard</Link>
              <Link href="/onboarding" className="hover:underline" onClick={() => setIsOpen(false)}>Add Workspace</Link>
              <Link href="/income" className="hover:underline" onClick={() => setIsOpen(false)}>Income</Link>
              <Link href="/expenses" className="hover:underline" onClick={() => setIsOpen(false)}>Expenses</Link>
              <Link href="/time" className="hover:underline" onClick={() => setIsOpen(false)}>Time</Link>
              {isAuthenticated && (
                <Link href="/profile" className="hover:underline flex items-center gap-1" onClick={() => setIsOpen(false)}>
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              )}
              <div className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600">
                {accountAccess.badgeLabel}
              </div>
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
