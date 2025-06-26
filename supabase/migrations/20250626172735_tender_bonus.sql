/*
  # Fix User Authentication Policies

  1. Policy Updates
    - Remove any conflicting policies safely
    - Create comprehensive policies for user signup and management
    - Allow both authenticated and anonymous users to create profiles during signup
    - Ensure proper RLS security for user data access

  2. Security
    - Maintain RLS protection
    - Allow profile creation during the signup process
    - Restrict data access to own user data only
*/

-- First, safely remove any existing conflicting policies
DO $$ 
BEGIN
    -- Drop policies if they exist (no error if they don't)
    DROP POLICY IF EXISTS "Users can insert own data" ON users;
    DROP POLICY IF EXISTS "Users can upsert own data" ON users;
    DROP POLICY IF EXISTS "Allow signup profile creation" ON users;
    DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON users;
    DROP POLICY IF EXISTS "Authenticated users can read own data" ON users;
    DROP POLICY IF EXISTS "Authenticated users can update own data" ON users;
    DROP POLICY IF EXISTS "Allow profile creation during signup" ON users;
    DROP POLICY IF EXISTS "Users can read own data" ON users;
    DROP POLICY IF EXISTS "Users can update own data" ON users;
END $$;

-- Create new comprehensive policies

-- Allow profile creation during signup (both anon and authenticated)
-- This handles the case where a user is created but profile doesn't exist yet
CREATE POLICY "Allow profile creation during signup"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Authenticated users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own data
CREATE POLICY "Authenticated users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);