/*
  # Rename focus_area column to archetype in users table

  1. Changes
    - Rename `focus_area` column to `archetype` in the `users` table
    - This aligns with the application's use of archetype instead of focus_area

  2. Notes
    - Uses IF EXISTS to prevent errors if the column doesn't exist
    - Preserves all existing data during the rename operation
*/

-- Check if the focus_area column exists before renaming it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' 
    AND column_name = 'focus_area'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE "public"."users" RENAME COLUMN "focus_area" TO "archetype";
  END IF;
END $$;