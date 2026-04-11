'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageContainer, PageHeader, EmptyState, LoadingSkeleton } from "@/components"
import { Plus, Edit, Trash2 } from "lucide-react"
import { createBrowserClient } from '@supabase/ssr'
import { expenseSchema, type ExpenseForm } from '@/lib/validations'
import { convertToCurrency, currencyOptions } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Expense extends ExpenseForm {
  id: string
  user_id: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Expense | null>(null)
  const [userCurrency, setUserCurrency] = useState('USD')
  const [formData, setFormData] = useState<ExpenseForm>({
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    currency: 'USD',
  })
  const [customCategory, setCustomCategory] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const categoryOptions = ['Food', 'Utilities', 'Rent', 'Other']
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadExpenses = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const userCurrencyFromMetadata = (user.user_metadata as { currency?: string })?.currency
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id,email,full_name')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          console.warn('Profile query failed, falling back to metadata or USD:', profileError)
        }

        setUserCurrency(userCurrencyFromMetadata ?? 'USD')

        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
        if (error) throw error
        setExpenses(data?.map(item => ({ ...item, amount: parseFloat(item.amount as string) })) || [])
      }
    } catch (error) {
      console.error('Failed to load expenses:', error)
      setErrorMessage('Failed to load expense data')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    try {
      // Validate required fields
      if (!formData.amount || formData.amount <= 0) {
        setErrorMessage('Amount must be greater than 0')
        return
      }
      if (!formData.description || formData.description.trim() === '') {
        setErrorMessage('Description is required')
        return
      }
      if (!formData.category || formData.category === '') {
        setErrorMessage('Category is required')
        return
      }
      if (!formData.date) {
        setErrorMessage('Date is required')
        return
      }
      if (!formData.currency || formData.currency === '') {
        setErrorMessage('Currency is required')
        return
      }

      const validatedData = expenseSchema.parse(formData)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const category = formData.category === 'Other' ? customCategory || 'Other' : formData.category

        const expenseData = {
          description: validatedData.description,
          date: validatedData.date,
          category,
          amount: Number(validatedData.amount.toFixed(2)),
          currency: validatedData.currency,
          user_id: user.id,
        }

        if (editingEntry) {
          const { error } = await supabase
            .from('expenses')
            .update({
              description: validatedData.description,
              date: validatedData.date,
              category,
              amount: Number(validatedData.amount.toFixed(2)),
              currency: validatedData.currency,
            })
            .eq('id', editingEntry.id)
          if (error) {
            console.error('Update error:', error)
            throw error
          }
          setSuccessMessage('Expense updated successfully!')
        } else {
          console.log('Inserting expense:', expenseData)
          const { error, data } = await supabase
            .from('expenses')
            .insert([expenseData])
          if (error) {
            console.error('Insert error:', error)
            console.error('Failed data:', expenseData)
            throw error
          }
          console.log('Insert success:', data)
          setSuccessMessage('Expense added successfully!')
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
        loadExpenses()
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error: unknown) {
      console.error('Form submission error:', error)
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('An error occurred')
      }
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const handleEdit = (entry: Expense) => {
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

  const handleDelete = async (id: string | number) => {
    if (!confirm('Delete this expense entry?')) return
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
      if (error) throw error
      loadExpenses()
      setSuccessMessage('Expense deleted')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      }
      setTimeout(() => setErrorMessage(''), 5000)
    }
  }

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      setErrorMessage('No data to export')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Currency']
    const rows = expenses.map(exp => [
      exp.date,
      exp.description,
      exp.category,
      exp.amount,
      exp.currency
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Expenses" description="Track your expenses" />
        <LoadingSkeleton />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader title="Expenses" description="Track your expenses">
        <div className="flex gap-2">
          {expenses.length > 0 && (
            <Button variant="outline" onClick={handleExportCSV} size="sm">
              Export CSV
            </Button>
          )}
          <Button onClick={() => { setShowForm(!showForm); setEditingEntry(null); }}>
            {showForm ? 'Cancel' : 'Add Expense'}
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
            <CardTitle>{editingEntry ? 'Edit Expense' : 'Add Expense'}</CardTitle>
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
              <Button type="submit">Save Expense</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {expenses.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No expenses recorded yet"
          description="Start tracking your expenses to manage your budget."
        />
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="flex justify-between items-center p-4">
                <div>
                  <h3 className="font-semibold">{expense.description}</h3>
                  <p className="text-sm text-muted-foreground">{expense.category} • {expense.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency }).format(
                        convertToCurrency(Number(expense.amount), expense.currency ?? userCurrency, userCurrency)
                      )}
                    </p>
                    {expense.currency && expense.currency !== userCurrency && (
                      <p className="text-sm text-muted-foreground">({new Intl.NumberFormat('en-US', { style: 'currency', currency: expense.currency }).format(Number(expense.amount))})</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(expense)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(String(expense.id))}
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