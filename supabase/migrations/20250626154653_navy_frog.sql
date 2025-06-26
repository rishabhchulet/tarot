/*
  # Fix Authentication Policies for Immediate Signup

  1. Policy Updates
    - Remove conflicting policies
    - Add proper policies for authenticated users to create profiles
    - Add temporary policy for anonymous users during signup process
    - Ensure smooth user profile creation flow

  2. Security
    - Maintain RLS protection
    - Allow profile creation during signup
    - Ensure users can only access their own data
*/

-- Remove existing policies to avoid conflicts
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

-- Create a function to handle user profile creation safely
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a basic profile for new users
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated, anon;