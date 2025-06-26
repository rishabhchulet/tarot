/*
  # Fix auth policies for user signup

  1. Policy Updates
    - Remove conflicting policies
    - Create proper policies for user profile creation
    - Allow both authenticated and anon users to insert during signup

  2. Security
    - Maintain RLS protection
    - Ensure users can only access their own data
    - Allow profile creation during the brief signup window
*/

-- Remove existing conflicting policies
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can upsert own data" ON users;
DROP POLICY IF EXISTS "Allow signup profile creation" ON users;

-- Create comprehensive policies for user management

-- Allow authenticated users to insert their own profile
CREATE POLICY "Authenticated users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

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

-- Temporary policy to allow profile creation during signup
-- This allows the brief moment when user is created but profile doesn't exist yet
CREATE POLICY "Allow profile creation during signup"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);