'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageContainer, PageHeader, EmptyState, LoadingSkeleton } from "@/components"
import { Clock, Pause, Play, Check, Edit, Trash2 } from "lucide-react"
import { createBrowserClient } from '@supabase/ssr'
import { timeEntrySchema, type TimeEntryForm } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TimeEntry {
  id: string
  user_id: string
  description: string
  hours: number
  date: string
}

interface ActiveTimer {
  id: string
  description: string
  createdAt: string
  accumulatedSeconds: number
  startTimestamp: number | null
  pausedAt: number | null
  running: boolean
}

export default function TimePage() {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([])
  const [timerPanelOpen, setTimerPanelOpen] = useState(true)
  const [newTimerDescription, setNewTimerDescription] = useState('')
  const [rounding, setRounding] = useState<'none' | 'hour' | 'day'>('none')
  const [now, setNow] = useState(Date.now())
  const [timerError, setTimerError] = useState('')
  const [timerInfo, setTimerInfo] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [formData, setFormData] = useState<TimeEntryForm>({
    description: '',
    hours: 0,
    minutes: 0,
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
        setTimeEntries(data?.map(item => ({ ...item, hours: parseFloat(item.hours as string) })) || [])
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

  useEffect(() => {
    if (!activeTimers.some((timer) => timer.running)) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [activeTimers])

  const computeElapsedSeconds = (timer: ActiveTimer) => {
    let total = timer.accumulatedSeconds
    if (timer.running && timer.startTimestamp) {
      total += Math.floor((now - timer.startTimestamp) / 1000)
    }
    return total
  }

  const formatTimer = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatHours = (hoursValue: number) => {
    const hours = Math.floor(hoursValue)
    const minutes = Math.round((hoursValue - hours) * 60)
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }

  const roundHours = (hoursValue: number) => {
    if (rounding === 'hour') {
      return Number(hoursValue.toFixed(0))
    }
    if (rounding === 'day') {
      return Number((Math.round(hoursValue / 24) * 24).toFixed(2))
    }
    return Number(hoursValue.toFixed(2))
  }

  const canResume = (timer: ActiveTimer) => {
    if (!timer.pausedAt) return false
    return now - timer.pausedAt <= 3600000
  }

  const resumeWindow = (timer: ActiveTimer) => {
    if (!timer.pausedAt) return 0
    return Math.max(0, 3600000 - (now - timer.pausedAt))
  }

  const startNewTimer = () => {
    if (activeTimers.length >= 7) {
      setTimerError('Максимум 7 активных таймеров')
      return
    }

    const description = newTimerDescription.trim() || 'Timed session'
    const timerId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${activeTimers.length}`

    setActiveTimers((prev) => [
      ...prev,
      {
        id: timerId,
        description,
        createdAt: new Date().toISOString().split('T')[0],
        accumulatedSeconds: 0,
        startTimestamp: Date.now(),
        pausedAt: null,
        running: true,
      },
    ])
    setNewTimerDescription('')
    setTimerError('')
    setTimerInfo('Timer started')
  }

  const pauseTimer = (id: string) => {
    setActiveTimers((prev) => prev.map((timer) => {
      if (timer.id !== id) return timer
      return {
        ...timer,
        accumulatedSeconds: computeElapsedSeconds(timer),
        startTimestamp: null,
        pausedAt: Date.now(),
        running: false,
      }
    }))
    setTimerInfo('Timer paused')
    setTimerError('')
  }

  const resumeTimer = (id: string) => {
    setActiveTimers((prev) => prev.map((timer) => {
      if (timer.id !== id) return timer
      if (timer.pausedAt && now - timer.pausedAt > 3600000) {
        return timer
      }
      return {
        ...timer,
        startTimestamp: Date.now(),
        pausedAt: null,
        running: true,
      }
    }))
    setTimerError('')
    setTimerInfo('Timer resumed')
  }

  const endTimer = async (id: string) => {
    const timer = activeTimers.find((item) => item.id === id)
    if (!timer) return

    const seconds = computeElapsedSeconds(timer)
    const hoursValue = seconds / 3600
    const finalHours = roundHours(hoursValue)

    if (finalHours <= 0) {
      setTimerError('Нельзя добавить нулевой период')
      return
    }
    if (finalHours > 99.99) {
      setTimerError('Слишком длинный период для сохранения')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const payload = {
        description: timer.description,
        date: timer.createdAt,
        hours: finalHours,
        user_id: user.id,
      }

      const { error } = await supabase
        .from('time_entries')
        .insert(payload)
      if (error) {
        console.error('Timer save error:', error)
        throw error
      }

      setActiveTimers((prev) => prev.filter((item) => item.id !== id))
      setTimerInfo(`Saved ${formatHours(finalHours)} to history`)
      setTimerError('')
      loadTimeEntries()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setTimerError(error.message)
      } else {
        setTimerError('Failed to save timer')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const validatedData = timeEntrySchema.parse(formData)
      const totalHours = validatedData.hours + validatedData.minutes / 60

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        if (editingEntry) {
          const { error } = await supabase
            .from('time_entries')
            .update({
              description: validatedData.description,
              date: validatedData.date,
              hours: totalHours,
            })
            .eq('id', editingEntry.id)
          if (error) throw error
          setEditingEntry(null)
        } else {
          const { error } = await supabase
            .from('time_entries')
            .insert({
              description: validatedData.description,
              date: validatedData.date,
              hours: totalHours,
              user_id: user.id,
            })
          if (error) throw error
        }
        setFormData({
          description: '',
          hours: 0,
          minutes: 0,
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
    const parsedHours = Number(entry.hours)
    const hours = Math.floor(parsedHours)
    const minutes = Math.round((parsedHours - hours) * 60)
    setEditingEntry(entry)
    setFormData({
      description: entry.description,
      hours,
      minutes,
      date: entry.date,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string | number) => {
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
      entry.hours,
    ])
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
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
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setTimerPanelOpen((prev) => !prev)} size="sm">
              {timerPanelOpen ? 'Hide Timer Panel' : 'Show Timer Panel'}
            </Button>
            {timeEntries.length > 0 && (
              <Button variant="outline" onClick={handleExportCSV} size="sm">
                Export CSV
              </Button>
            )}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            Active timers: {activeTimers.length} / 7
          </div>
        </div>
      </PageHeader>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="grid flex-1 gap-3 md:grid-cols-[1fr_auto]">
              <div className="space-y-1">
                <label className="block text-sm font-medium">Timer name</label>
                <input
                  type="text"
                  value={newTimerDescription}
                  onChange={(e) => setNewTimerDescription(e.target.value)}
                  placeholder="Enter timer label"
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium">Round to</label>
                <select
                  value={rounding}
                  onChange={(e) => setRounding(e.target.value as 'none' | 'hour' | 'day')}
                  className="w-full rounded-md border px-3 py-2"
                >
                  <option value="none">Exact minutes</option>
                  <option value="hour">Hours</option>
                  <option value="day">Days</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={startNewTimer}
                disabled={activeTimers.length >= 7}
              >
                <Play className="h-4 w-4" /> Start timer
              </Button>
            </div>
          </div>

          {timerError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {timerError}
            </div>
          )}
          {timerInfo && (
            <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {timerInfo}
            </div>
          )}

          <div className={`${timerPanelOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-300`}>
            <div className="space-y-4">
              {activeTimers.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  No active timers yet. Start a timer to begin tracking.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTimers.map((timer) => {
                    const elapsedSeconds = computeElapsedSeconds(timer)
                    const elapsedHours = elapsedSeconds / 3600
                    const resumeAllowed = !timer.running && timer.pausedAt ? canResume(timer) : false
                    const remainingMs = !timer.running && timer.pausedAt ? resumeWindow(timer) : 0
                    return (
                      <Card key={timer.id}>
                        <CardContent className="grid gap-4 md:grid-cols-[1fr_auto]">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-base font-semibold">{timer.description}</p>
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                {timer.running ? 'Running' : 'Paused'}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-slate-500">Started: {timer.createdAt}</p>
                            <p className="mt-2 text-2xl font-bold">{formatTimer(elapsedSeconds)}</p>
                            <p className="mt-1 text-sm text-slate-500">{formatHours(elapsedHours)}</p>
                            {!timer.running && timer.pausedAt && (
                              <p className="mt-1 text-sm text-slate-500">
                                {resumeAllowed
                                  ? `Resume within ${Math.ceil(remainingMs / 60000)} min`
                                  : 'Resume window expired'}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {timer.running ? (
                              <Button variant="outline" size="sm" onClick={() => pauseTimer(timer.id)}>
                                <Pause className="h-4 w-4" /> Pause
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resumeTimer(timer.id)}
                                disabled={!resumeAllowed}
                              >
                                <Play className="h-4 w-4" /> Resume
                              </Button>
                            )}
                            <Button variant="destructive" size="sm" onClick={() => endTimer(timer.id)}>
                              <Check className="h-4 w-4" /> End
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Hours Tracked</p>
            <p className="text-3xl font-bold">{formatHours(totalHours)}</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hours</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Minutes</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="59"
                    value={formData.minutes}
                    onChange={(e) => setFormData({ ...formData, minutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  />
                </div>
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
                    <p className="text-lg font-bold">{formatHours(Number(entry.hours))}</p>
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
