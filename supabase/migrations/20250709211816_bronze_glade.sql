/*
  # Rename focus_area column to archetype in users table

  1. Changes
    - Rename `focus_area` column to `archetype` in the `users` table
    - This reflects the app's use of archetypes instead of focus areas

  2. Security
    - No changes to RLS policies needed as this is just a column rename
*/

-- Rename the focus_area column to archetype in the users table
ALTER TABLE public.users RENAME COLUMN focus_area TO archetype;

-- Update the comment to reflect the new column purpose
COMMENT ON COLUMN public.users.archetype IS 'The user selected archetype (e.g., alchemist, seer, creator, mirror, trickster, shapeshifter)';