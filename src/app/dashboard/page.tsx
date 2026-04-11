import { PageContainer, PageHeader } from "@/components"
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { convertToCurrency } from '@/lib/currency'
import { IncomeRepository, ExpenseRepository, TimeEntryRepository } from '@/lib/repositories'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in</div>
  }

  const profileRes = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user.id)
    .single()
  const userCurrency = profileRes.data?.currency ?? 'USD'

  const [incomes, expenses, timeEntries] = await Promise.all([
    IncomeRepository.getAll(user.id),
    ExpenseRepository.getAll(user.id),
    TimeEntryRepository.getAll(user.id),
  ])

  const totalIncome = incomes.reduce((sum, inc) => sum + convertToCurrency(Number(inc.amount), inc.currency ?? userCurrency, userCurrency), 0)
  const totalExpenses = expenses.reduce((sum, exp) => sum + convertToCurrency(Number(exp.amount), exp.currency ?? userCurrency, userCurrency), 0)
  const netIncome = totalIncome - totalExpenses
  const totalHours = timeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0)

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: userCurrency,
      minimumFractionDigits: 2,
    }).format(value)

  return (
    <PageContainer>
      <PageHeader title="Dashboard" description={`Your currency: ${userCurrency}`}/>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Total Income</h3>
          <p className="text-2xl">{formatMoney(totalIncome)}</p>
        </div>
        <div className="bg-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Total Expenses</h3>
          <p className="text-2xl">{formatMoney(totalExpenses)}</p>
        </div>
        <div className="bg-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Net Income</h3>
          <p className={`text-2xl ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatMoney(netIncome)}
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Total Hours</h3>
          <p className="text-2xl">{totalHours.toFixed(1)}h</p>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Incomes</h3>
          {incomes.slice(0, 3).map((income) => (
            <div key={income.id} className="flex justify-between py-2 border-b">
              <span>{income.description}</span>
              <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency }).format(convertToCurrency(Number(income.amount), income.currency ?? userCurrency, userCurrency))}</span>
            </div>
          ))}
          {incomes.length === 0 && <p className="text-muted-foreground">No incomes yet</p>}
        </div>
        <div className="bg-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
          {expenses.slice(0, 3).map((expense) => (
            <div key={expense.id} className="flex justify-between py-2 border-b">
              <span>{expense.description}</span>
              <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency }).format(convertToCurrency(Number(expense.amount), expense.currency ?? userCurrency, userCurrency))}</span>
            </div>
          ))}
          {expenses.length === 0 && <p className="text-muted-foreground">No expenses yet</p>}
        </div>
        <div className="bg-card p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Recent Time Entries</h3>
          {timeEntries.slice(0, 3).map((entry) => (
            <div key={entry.id} className="flex justify-between py-2 border-b">
              <span>{entry.description}</span>
              <span>{Number(entry.hours).toFixed(1)}h</span>
            </div>
          ))}
          {timeEntries.length === 0 && <p className="text-muted-foreground">No time entries yet</p>}
        </div>
      </div>
    </PageContainer>
  )
}