-- Migration: Add work_start_date and work_end_date to workers table
-- This allows defining the period when a worker is employed

ALTER TABLE workers ADD COLUMN IF NOT EXISTS work_start_date DATE;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS work_end_date DATE;

-- Update existing records to have dates (optional - set to current date range)
UPDATE workers 
SET 
  work_start_date = CURRENT_DATE,
  work_end_date = CURRENT_DATE + INTERVAL '1 year'
WHERE work_start_date IS NULL;
