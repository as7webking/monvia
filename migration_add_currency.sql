-- Migration: Add currency columns to incomes and expenses tables
-- This adds the missing currency column if it doesn't exist (safe for both old and new schemas)

ALTER TABLE public.incomes ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD';

-- Verify the columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'incomes' AND column_name = 'currency';

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'expenses' AND column_name = 'currency';
