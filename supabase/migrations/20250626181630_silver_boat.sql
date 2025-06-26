/*
  # Fix user policies for proper authentication flow

  1. Policy Updates
    - Safely remove any conflicting policies
    - Create comprehensive policies for user management
    - Allow profile creation during signup process
    - Ensure authenticated users can manage their own data

  2. Security
    - Maintain RLS protection
    - Allow temporary profile creation for new signups
    - Restrict access to own data only
*/

-- Function to safely drop policies if they exist
DO $$ 
DECLARE
    policy_names text[] := ARRAY[
        'Users can insert own data',
        'Users can upsert own data', 
        'Allow signup profile creation',
        'Authenticated users can insert own profile',
        'Authenticated users can read own data',
        'Authenticated users can update own data',
        'Allow profile creation during signup',
        'Users can read own data',
        'Users can update own data'
    ];
    policy_name text;
BEGIN
    -- Drop each policy if it exists
    FOREACH policy_name IN ARRAY policy_names
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON users', policy_name);
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors if policy doesn't exist
            NULL;
        END;
    END LOOP;
END $$;

-- Create new comprehensive policies for user management

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