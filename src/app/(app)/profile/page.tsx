'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { useCompany } from '@/contexts/company-context'
import { profileUpdateSchema, formatValidationError } from '@/lib/validations'
import { getAccountAccess } from '@/lib/account-access'
import { currencyOptions, normalizeCurrencyCode } from '@/lib/currency'
import { PageContainer, PageHeader } from '@/components'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, DollarSign, LogOut, BriefcaseBusiness } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  currency: string
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceCurrency, setWorkspaceCurrency] = useState('USD')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const { currentCompany, refreshCompanies } = useCompany()
  const accountAccess = getAccountAccess(profile?.email)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, currency, created_at')
          .eq('id', user.id)
          .single()

        if (error) throw error

        setProfile(data)
        setFullName(data.full_name)
        setCurrency(normalizeCurrencyCode(data.currency))
      } catch {
        setMessage('Error loading profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase, router])

  useEffect(() => {
    if (currentCompany) {
      setWorkspaceName(currentCompany.name)
      setWorkspaceCurrency(normalizeCurrencyCode(currentCompany.currency ?? 'USD'))
    }
  }, [currentCompany])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const validationResult = profileUpdateSchema.safeParse({
        full_name: fullName,
        currency: currency,
      })

      if (!validationResult.success) {
        setMessage(formatValidationError(validationResult.error))
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          currency: currency,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage('Profile updated successfully!')
      setProfile(prev => prev ? {
        ...prev,
        full_name: fullName,
        currency: currency,
      } : null)

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      if (error instanceof Error) {
        setMessage('Error: ' + error.message)
      } else {
        setMessage('Error updating profile')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      setMessage('Error logging out')
    }
  }

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentCompany) {
      setMessage('No workspace selected')
      return
    }

    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: workspaceName.trim() || currentCompany.name,
          currency: workspaceCurrency,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentCompany.id)

      if (error) throw error

      await refreshCompanies(currentCompany.id)
      setMessage('Workspace updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(error instanceof Error ? `Error: ${error.message}` : 'Error updating workspace')
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader
          title="Loading..."
          description="Please wait..."
        />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    )
  }

  if (!profile) {
    return (
      <PageContainer>
        <PageHeader
          title="Profile"
          description="Your account information"
        />
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-700">Unable to load your profile. Please try again later.</p>
          </CardContent>
        </Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Your Profile"
        description="Manage your account information"
      />

      <div className="grid w-full gap-6 lg:grid-cols-2">
        {/* Profile Information Card */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>View and update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {message && (
                <div className={`p-3 rounded-md text-sm ${
                  message.includes('Error')
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Default Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(normalizeCurrencyCode(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                >
                  {currencyOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.code} - {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5" />
              Current Workspace
            </CardTitle>
            <CardDescription>Manage the active workspace, currency, and access settings.</CardDescription>
          </CardHeader>
          <CardContent>
            {currentCompany ? (
              <form onSubmit={handleSaveWorkspace} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Workspace Name</label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Workspace name"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Workspace Type</label>
                    <input
                      type="text"
                      value={currentCompany.type}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed capitalize"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Workspace Currency</label>
                    <select
                      value={workspaceCurrency}
                      onChange={(e) => setWorkspaceCurrency(normalizeCurrencyCode(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    >
                      {currencyOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.code} - {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Access level: {accountAccess.badgeLabel}
                </div>

                <Button type="submit" className="w-full">Save Workspace</Button>
              </form>
            ) : (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Complete onboarding to create your first workspace.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">Account Created</span>
              <span className="text-sm font-medium">
                {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Account ID</span>
              <span className="text-xs font-mono text-gray-500 truncate max-w-xs">
                {profile.id}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-red-200 bg-red-50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-red-700">Sign Out</CardTitle>
            <CardDescription className="text-red-600">
              End your current session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-red-700 border-red-200 hover:bg-red-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
