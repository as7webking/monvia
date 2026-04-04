import { createServerSupabaseClient } from './supabase-server'

export interface Income {
  id: string
  amount: number
  description: string
  category: string
  date: string
}

export interface Expense {
  id: string
  amount: number
  description: string
  category: string
  date: string
}

export interface TimeEntry {
  id: string
  description: string
  hours: number
  date: string
}

export class IncomeRepository {
  static async getAll(userId: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) throw error
    return data
  }

  static async create(userId: string, income: Omit<Income, 'id'>) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('incomes')
      .insert({ ...income, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async update(id: string, income: Partial<Income>) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('incomes')
      .update(income)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async delete(id: string) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

export class ExpenseRepository {
  static async getAll(userId: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) throw error
    return data
  }

  static async create(userId: string, expense: Omit<Expense, 'id'>) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async update(id: string, expense: Partial<Expense>) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async delete(id: string) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

export class TimeEntryRepository {
  static async getAll(userId: string) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) throw error
    return data
  }

  static async create(userId: string, entry: Omit<TimeEntry, 'id'>) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('time_entries')
      .insert({ ...entry, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async update(id: string, entry: Partial<TimeEntry>) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('time_entries')
      .update(entry)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async delete(id: string) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}