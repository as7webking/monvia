'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageContainer, PageHeader, EmptyState, LoadingSkeleton } from "@/components"
import { Clock, Plus, Edit, Trash2 } from "lucide-react"
import { createBrowserClient } from '@supabase/ssr'
import { timeEntrySchema, type TimeEntryForm } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TimeEntry extends TimeEntryForm {
  id: string
  user_id: string
}

export default function TimePage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [formData, setFormData] = useState<TimeEntryForm>({
    description: '',
    hours: 0,
    date: new Date().toISOString().split('T')[0],
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadTimeEntries = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('time_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
        if (error) throw error
        setTimeEntries(data || [])
      }
    } catch (error) {
      console.error('Failed to load time entries:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadTimeEntries()
  }, [loadTimeEntries])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validate form data with Zod
      const validatedData = timeEntrySchema.parse(formData)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        if (editingEntry) {
          const { error } = await supabase
            .from('time_entries')
            .update(validatedData)
            .eq('id', editingEntry.id)
          if (error) throw error
          setEditingEntry(null)
        } else {
          const { error } = await supabase
            .from('time_entries')
            .insert({
              ...validatedData,
              user_id: user.id,
            })
          if (error) throw error
        }
        setFormData({
          description: '',
          hours: 0,
          date: new Date().toISOString().split('T')[0],
        })
        setShowForm(false)
        loadTimeEntries()
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('An error occurred')
      }
    }
  }

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setFormData({
      description: entry.description,
      hours: entry.hours,
      date: entry.date,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      try {
        const { error } = await supabase
          .from('time_entries')
          .delete()
          .eq('id', id)
        if (error) throw error
        loadTimeEntries()
      } catch (error: unknown) {
        if (error instanceof Error) {
          alert(error.message)
        } else {
          alert('An error occurred')
        }
      }
    }
  }

  const totalHours = timeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0)

  const handleExportCSV = () => {
    if (timeEntries.length === 0) {
      alert('No data to export')
      return
    }
    const headers = ['Date', 'Description', 'Hours']
    const rows = timeEntries.map(entry => [
      entry.date,
      entry.description,
      entry.hours
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `time-entries-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Time Tracking" description="Track your work hours" />
        <LoadingSkeleton />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader title="Time Tracking" description="Track your work hours">
        <div className="flex gap-2">
          {timeEntries.length > 0 && (
            <Button variant="outline" onClick={handleExportCSV} size="sm">
              Export CSV
            </Button>
          )}
          <Button onClick={() => { setShowForm(!showForm); setEditingEntry(null); }}>
            {showForm ? 'Cancel' : 'Add Time Entry'}
          </Button>
        </div>
      </PageHeader>

      {/* Total Hours Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Hours Tracked</p>
            <p className="text-3xl font-bold">{totalHours.toFixed(1)}h</p>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hours</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <Button type="submit">{editingEntry ? 'Update Entry' : 'Save Entry'}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {timeEntries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No time entries yet"
          description="Start tracking your time to see your productivity."
        />
      ) : (
        <div className="space-y-4">
          {timeEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <h3 className="font-semibold">{entry.description}</h3>
                  <p className="text-sm text-muted-foreground">{entry.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">{Number(entry.hours).toFixed(1)}h</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  )
}