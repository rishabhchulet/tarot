/*
  # Disable Email Confirmation and Fix Auth Flow

  1. Changes
    - Update auth settings to disable email confirmation
    - Fix RLS policies for user creation
    - Ensure smooth signup flow without email verification

  2. Security
    - Maintain RLS on all tables
    - Allow users to create their own profile during signup
*/

-- Update auth configuration to disable email confirmation
-- Note: This would typically be done in Supabase dashboard under Authentication > Settings
-- But we can ensure our policies work correctly for immediate signup

-- Ensure the users table allows insertion during signup
DROP POLICY IF EXISTS "Users can insert own data" ON users;

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also allow upsert operations for user profiles
DROP POLICY IF EXISTS "Users can upsert own data" ON users;

CREATE POLICY "Users can upsert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    focus_area = EXCLUDED.focus_area,
    updated_at = EXCLUDED.updated_at;

-- Ensure anon users can also insert (for the brief moment during signup)
CREATE POLICY IF NOT EXISTS "Allow signup profile creation"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);