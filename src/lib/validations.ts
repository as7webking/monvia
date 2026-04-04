import { z } from 'zod'

export const incomeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  currency: z.string().min(1, 'Currency is required'),
})

export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  currency: z.string().min(1, 'Currency is required'),
})

export const timeEntrySchema = z.object({
  description: z.string().min(1, 'Description is required'),
  hours: z.number().positive('Hours must be positive'),
  date: z.string().min(1, 'Date is required'),
})

export type IncomeForm = z.infer<typeof incomeSchema>
export type ExpenseForm = z.infer<typeof expenseSchema>
export type TimeEntryForm = z.infer<typeof timeEntrySchema>