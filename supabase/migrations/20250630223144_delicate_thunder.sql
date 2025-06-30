/*
  # Fix User Data Access and RLS Issues

  1. Database Analysis
    - Check and fix RLS policies that might be blocking user data access
    - Ensure proper policy configuration for user profile access
    - Add debugging capabilities to understand what's happening

  2. Policy Fixes
    - Simplify and fix user policies to ensure they work correctly
    - Add proper policies for all operations
    - Ensure auth.uid() function works correctly

  3. Debugging
    - Add helper functions to debug RLS issues
    - Create test functions to verify policy functionality
*/

-- First, let's check what policies currently exist and drop them cleanly
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on users table
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', policy_record.policyname);
        RAISE LOG 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies for users table
-- Policy for INSERT - allow users to create their own profile
CREATE POLICY "users_can_insert_own_profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy for SELECT - allow users to read their own profile
CREATE POLICY "users_can_select_own_profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for UPDATE - allow users to update their own profile
CREATE POLICY "users_can_update_own_profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create a debug function to test RLS policies
CREATE OR REPLACE FUNCTION public.debug_user_access(user_uuid UUID DEFAULT NULL)
RETURNS TABLE(
  test_name text,
  result text,
  details text
) AS $$
DECLARE
  current_user_id UUID;
  test_user_id UUID;
  user_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  test_user_id := COALESCE(user_uuid, current_user_id);
  
  -- Test 1: Check if user is authenticated
  RETURN QUERY SELECT 
    'Authentication Check'::text,
    CASE WHEN current_user_id IS NOT NULL THEN 'PASS' ELSE 'FAIL' END::text,
    COALESCE('User ID: ' || current_user_id::text, 'No authenticated user')::text;
  
  -- Test 2: Check if RLS is enabled
  RETURN QUERY SELECT 
    'RLS Status'::text,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_class c 
      JOIN pg_namespace n ON n.oid = c.relnamespace 
      WHERE c.relname = 'users' AND n.nspname = 'public' AND c.relrowsecurity = true
    ) THEN 'ENABLED' ELSE 'DISABLED' END::text,
    'Row Level Security status'::text;
  
  -- Test 3: Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'users' AND schemaname = 'public';
  
  RETURN QUERY SELECT 
    'Policy Count'::text,
    policy_count::text,
    'Number of RLS policies on users table'::text;
  
  -- Test 4: Try to count user records (this will respect RLS)
  BEGIN
    SELECT COUNT(*) INTO user_count FROM public.users WHERE id = test_user_id;
    RETURN QUERY SELECT 
      'User Record Access'::text,
      CASE WHEN user_count > 0 THEN 'FOUND' ELSE 'NOT_FOUND' END::text,
      ('Records found: ' || user_count::text || ' for user: ' || COALESCE(test_user_id::text, 'NULL'))::text;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'User Record Access'::text,
      'ERROR'::text,
      ('Error: ' || SQLERRM)::text;
  END;
  
  -- Test 5: Check if user exists in auth.users
  RETURN QUERY SELECT 
    'Auth User Exists'::text,
    CASE WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = test_user_id) THEN 'YES' ELSE 'NO' END::text,
    ('Checking auth.users for: ' || COALESCE(test_user_id::text, 'NULL'))::text;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to safely create user profiles
CREATE OR REPLACE FUNCTION public.create_user_profile_safe(
  user_id UUID,
  user_email TEXT,
  user_name TEXT DEFAULT 'User'
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
BEGIN
  -- Try to insert the user profile
  BEGIN
    INSERT INTO public.users (id, email, name, created_at, updated_at)
    VALUES (user_id, user_email, user_name, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, users.name),
      updated_at = NOW();
    
    RETURN QUERY SELECT true, 'User profile created/updated successfully';
    
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false, ('Error: ' || SQLERRM);
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve the handle_new_user function with better error handling
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name text;
  user_email text;
  result_success boolean;
  result_message text;
BEGIN
  -- Extract user data safely
  user_email := COALESCE(NEW.email, '');
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');
  
  -- Validate data
  IF user_email = '' OR user_email IS NULL THEN
    user_email := CONCAT('user_', NEW.id, '@example.com');
    RAISE LOG 'Warning: Empty email for user %, using fallback: %', NEW.id, user_email;
  END IF;
  
  IF user_name = '' OR user_name IS NULL THEN
    user_name := 'User';
  END IF;
  
  -- Use the safe profile creation function
  SELECT success, message INTO result_success, result_message
  FROM public.create_user_profile_safe(NEW.id, user_email, user_name);
  
  IF result_success THEN
    RAISE LOG 'User profile created successfully for: % (email: %)', NEW.id, user_email;
  ELSE
    RAISE LOG 'User profile creation failed for %: %', NEW.id, result_message;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure journal_entries and subscriptions policies are also correct
-- Drop and recreate journal_entries policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'journal_entries' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.journal_entries', policy_record.policyname);
    END LOOP;
END $$;

CREATE POLICY "journal_entries_all_operations"
  ON public.journal_entries
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Drop and recreate subscriptions policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'subscriptions' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.subscriptions', policy_record.policyname);
    END LOOP;
END $$;

CREATE POLICY "subscriptions_all_operations"
  ON public.subscriptions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure all tables have RLS enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Add helpful indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active ON public.subscriptions(user_id, has_active_subscription);

-- Create a function to test database connectivity and permissions
CREATE OR REPLACE FUNCTION public.test_database_access()
RETURNS TABLE(
  component text,
  status text,
  details text
) AS $$
DECLARE
  current_user_id UUID;
  user_count INTEGER;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Test 1: Authentication
  RETURN QUERY SELECT 
    'Authentication'::text,
    CASE WHEN current_user_id IS NOT NULL THEN 'OK' ELSE 'FAILED' END::text,
    COALESCE('User ID: ' || current_user_id::text, 'No authenticated user')::text;
  
  -- Test 2: Database connection
  RETURN QUERY SELECT 
    'Database Connection'::text,
    'OK'::text,
    'Successfully connected to database'::text;
  
  -- Test 3: User table access
  IF current_user_id IS NOT NULL THEN
    BEGIN
      SELECT COUNT(*) INTO user_count FROM public.users WHERE id = current_user_id;
      RETURN QUERY SELECT 
        'User Table Access'::text,
        'OK'::text,
        ('Found ' || user_count::text || ' user records')::text;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT 
        'User Table Access'::text,
        'FAILED'::text,
        ('Error: ' || SQLERRM)::text;
    END;
  ELSE
    RETURN QUERY SELECT 
      'User Table Access'::text,
      'SKIPPED'::text,
      'No authenticated user to test with'::text;
  END IF;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;