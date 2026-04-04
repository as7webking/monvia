'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageContainer, PageHeader, EmptyState, LoadingSkeleton } from "@/components"
import { Plus, Edit, Trash2 } from "lucide-react"
import { createBrowserClient } from '@supabase/ssr'
import { incomeSchema, type IncomeForm } from '@/lib/validations'
import { convertToCurrency, currencyOptions } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Income extends IncomeForm {
  id: string
  user_id: string
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Income | null>(null)
  const [userCurrency, setUserCurrency] = useState('USD')
  const [formData, setFormData] = useState<IncomeForm>({
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    currency: 'USD',
  })
  const [customCategory, setCustomCategory] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const categoryOptions = ['Salary', 'Freelance', 'Investment', 'Other']

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadIncomes = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('currency')
          .eq('id', user.id)
          .single()
        if (profileError) {
          await supabase
            .from('profiles')
            .insert({ id: user.id, email: user.email, currency: 'USD' })
          setUserCurrency('USD')
        } else {
          setUserCurrency(profileData?.currency ?? 'USD')
        }
        const { data, error } = await supabase
          .from('incomes')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
        if (error) throw error
        setIncomes(data || [])
      }
    } catch (error) {
      console.error('Failed to load incomes:', error)
      setErrorMessage('Failed to load income data')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadIncomes()
  }, [loadIncomes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    try {
      const validatedData = incomeSchema.parse(formData)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const category = formData.category === 'Other' ? customCategory || 'Other' : formData.category
        const convertedAmount = convertToCurrency(validatedData.amount, validatedData.currency, userCurrency)

        if (editingEntry) {
          const { error } = await supabase
            .from('incomes')
            .update({
              ...validatedData,
              category,
              amount: convertedAmount,
              currency: userCurrency,
            })
            .eq('id', editingEntry.id)
          if (error) throw error
          setSuccessMessage('Income updated successfully!')
        } else {
          const { error } = await supabase
            .from('incomes')
            .insert({
              ...validatedData,
              category,
              amount: convertedAmount,
              currency: userCurrency,
              user_id: user.id,
            })
          if (error) throw error
          setSuccessMessage('Income added successfully!')
        }
        setFormData({
          amount: 0,
          description: '',
          category: '',
          currency: userCurrency,
          date: new Date().toISOString().split('T')[0],
        })
        setCustomCategory('')
        setShowForm(false)
        setEditingEntry(null)
        loadIncomes()
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('An error occurred')
      }
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const handleEdit = (entry: Income) => {
    setEditingEntry(entry)
    setFormData({
      amount: entry.amount,
      description: entry.description,
      category: entry.category,
      date: entry.date,
      currency: entry.currency,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this income entry?')) return
    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id)
      if (error) throw error
      loadIncomes()
      setSuccessMessage('Income deleted')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      }
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const handleExportCSV = () => {
    if (incomes.length === 0) {
      setErrorMessage('No data to export')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency']
    const rows = incomes.map(inc => [
      inc.date,
      inc.description,
      inc.category,
      inc.amount,
      inc.currency
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `incomes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Income" description="Track your income sources" />
        <LoadingSkeleton />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader title="Income" description="Track your income sources">
        <div className="flex gap-2">
          {incomes.length > 0 && (
            <Button variant="outline" onClick={handleExportCSV} size="sm">
              Export CSV
            </Button>
          )}
          <Button onClick={() => { setShowForm(!showForm); setEditingEntry(null); }}>
            {showForm ? 'Cancel' : 'Add Income'}
          </Button>
        </div>
      </PageHeader>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{errorMessage}</p>
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingEntry ? 'Edit Income' : 'Add Income'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
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
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {formData.category === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="mt-2 w-full px-3 py-2 border rounded-md"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {currencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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
              <Button type="submit">Save Income</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {incomes.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No income recorded yet"
          description="Start tracking your income to see your financial overview."
        />
      ) : (
        <div className="space-y-4">
          {incomes.map((income) => (
            <Card key={income.id}>
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <h3 className="font-semibold">{income.description}</h3>
                  <p className="text-sm text-muted-foreground">{income.category} • {income.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: income.currency || userCurrency }).format(Number(income.amount))}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(income)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(String(income.id))}
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