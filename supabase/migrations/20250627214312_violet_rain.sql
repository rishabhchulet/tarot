/*
  # Add daily question field to journal entries

  1. Changes
    - Add `daily_question` column to `journal_entries` table
    - This will store the "return to this question throughout the day" question
    - Allow users to access their daily question anytime after drawing their card

  2. Security
    - No changes to RLS policies needed as this is just adding a column
*/

-- Add daily_question column to journal_entries table
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS daily_question text;

-- Add comment to document the purpose
COMMENT ON COLUMN public.journal_entries.daily_question IS 'The daily reflection question that users can return to throughout the day';