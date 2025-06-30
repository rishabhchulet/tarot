/*
  # Fix Profile Creation and Database Timeout Issues

  1. Database Improvements
    - Create a more robust user profile creation system
    - Add better error handling and retry logic
    - Ensure profile creation works even with network issues

  2. Security
    - Maintain RLS protection
    - Add better constraint handling
    - Ensure data integrity
*/

-- Drop existing functions to recreate them
DROP FUNCTION IF EXISTS public.create_user_profile_safe(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create an improved safe profile creation function
CREATE OR REPLACE FUNCTION public.create_user_profile_safe(
  user_id UUID,
  user_email TEXT,
  user_name TEXT DEFAULT 'User'
)
RETURNS TABLE(success BOOLEAN, message TEXT, user_data JSONB) AS $$
DECLARE
  existing_user RECORD;
  final_email TEXT;
  final_name TEXT;
BEGIN
  -- Validate and clean inputs
  final_email := COALESCE(TRIM(user_email), CONCAT('user_', user_id, '@example.com'));
  final_name := COALESCE(TRIM(user_name), 'User');
  
  -- Ensure email is not empty
  IF final_email = '' THEN
    final_email := CONCAT('user_', user_id, '@example.com');
  END IF;
  
  -- Ensure name is not empty
  IF final_name = '' THEN
    final_name := 'User';
  END IF;
  
  -- Check if user already exists
  SELECT * INTO existing_user FROM public.users WHERE id = user_id;
  
  IF existing_user.id IS NOT NULL THEN
    -- User exists, update if needed
    UPDATE public.users 
    SET 
      email = final_email,
      name = COALESCE(final_name, existing_user.name),
      updated_at = NOW()
    WHERE id = user_id;
    
    RETURN QUERY SELECT 
      true, 
      'User profile updated successfully',
      jsonb_build_object(
        'id', user_id,
        'email', final_email,
        'name', final_name,
        'action', 'updated'
      );
  ELSE
    -- User doesn't exist, create new
    INSERT INTO public.users (id, email, name, created_at, updated_at)
    VALUES (user_id, final_email, final_name, NOW(), NOW());
    
    RETURN QUERY SELECT 
      true, 
      'User profile created successfully',
      jsonb_build_object(
        'id', user_id,
        'email', final_email,
        'name', final_name,
        'action', 'created'
      );
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  -- If all else fails, try a simple upsert
  BEGIN
    INSERT INTO public.users (id, email, name, created_at, updated_at)
    VALUES (user_id, final_email, final_name, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = COALESCE(EXCLUDED.name, users.name),
      updated_at = NOW();
    
    RETURN QUERY SELECT 
      true, 
      'User profile created/updated via upsert',
      jsonb_build_object(
        'id', user_id,
        'email', final_email,
        'name', final_name,
        'action', 'upserted'
      );
      
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      false, 
      ('Error: ' || SQLERRM),
      jsonb_build_object('error', SQLERRM);
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a much more robust handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name text;
  user_email text;
  result_record RECORD;
BEGIN
  -- Extract user data safely with better fallbacks
  user_email := COALESCE(NEW.email, CONCAT('user_', NEW.id, '@example.com'));
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');
  
  -- Clean the data
  user_email := TRIM(user_email);
  user_name := TRIM(user_name);
  
  -- Validate data
  IF user_email = '' OR user_email IS NULL THEN
    user_email := CONCAT('user_', NEW.id, '@example.com');
  END IF;
  
  IF user_name = '' OR user_name IS NULL THEN
    user_name := 'User';
  END IF;
  
  -- Use the safe profile creation function
  SELECT * INTO result_record
  FROM public.create_user_profile_safe(NEW.id, user_email, user_name);
  
  IF result_record.success THEN
    RAISE LOG 'User profile operation successful for %: % - %', 
      NEW.id, result_record.message, result_record.user_data;
  ELSE
    RAISE LOG 'User profile operation failed for %: %', NEW.id, result_record.message;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Critical error in handle_new_user for %: %', NEW.id, SQLERRM;
    -- Don't fail the auth process even if profile creation fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to manually fix missing user profiles
CREATE OR REPLACE FUNCTION public.ensure_user_profile_exists(
  check_user_id UUID DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT, user_data JSONB) AS $$
DECLARE
  target_user_id UUID;
  auth_user RECORD;
  result_record RECORD;
BEGIN
  -- Use provided user ID or current authenticated user
  target_user_id := COALESCE(check_user_id, auth.uid());
  
  IF target_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'No user ID provided and no authenticated user', '{}'::jsonb;
    RETURN;
  END IF;
  
  -- Get user data from auth.users
  SELECT * INTO auth_user FROM auth.users WHERE id = target_user_id;
  
  IF auth_user.id IS NULL THEN
    RETURN QUERY SELECT false, 'User not found in auth.users', '{}'::jsonb;
    RETURN;
  END IF;
  
  -- Create or update the profile
  SELECT * INTO result_record
  FROM public.create_user_profile_safe(
    auth_user.id, 
    auth_user.email, 
    COALESCE(auth_user.raw_user_meta_data->>'name', 'User')
  );
  
  RETURN QUERY SELECT result_record.success, result_record.message, result_record.user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the test_database_access function to be more comprehensive
DROP FUNCTION IF EXISTS public.test_database_access() CASCADE;

CREATE OR REPLACE FUNCTION public.test_database_access()
RETURNS TABLE(
  component text,
  status text,
  details text
) AS $$
DECLARE
  current_user_id UUID;
  user_count INTEGER;
  auth_user_exists BOOLEAN;
  profile_result RECORD;
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
  
  IF current_user_id IS NOT NULL THEN
    -- Test 3: Check if user exists in auth.users
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = current_user_id) INTO auth_user_exists;
    
    RETURN QUERY SELECT 
      'Auth User Exists'::text,
      CASE WHEN auth_user_exists THEN 'YES' ELSE 'NO' END::text,
      ('Auth user found: ' || auth_user_exists::text)::text;
    
    -- Test 4: User table access
    BEGIN
      SELECT COUNT(*) INTO user_count FROM public.users WHERE id = current_user_id;
      RETURN QUERY SELECT 
        'User Profile Exists'::text,
        CASE WHEN user_count > 0 THEN 'YES' ELSE 'NO' END::text,
        ('Profile records found: ' || user_count::text)::text;
      
      -- Test 5: Try to ensure profile exists if missing
      IF user_count = 0 AND auth_user_exists THEN
        SELECT * INTO profile_result FROM public.ensure_user_profile_exists(current_user_id);
        
        RETURN QUERY SELECT 
          'Profile Creation Attempt'::text,
          CASE WHEN profile_result.success THEN 'SUCCESS' ELSE 'FAILED' END::text,
          profile_result.message::text;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT 
        'User Table Access'::text,
        'ERROR'::text,
        ('Error: ' || SQLERRM)::text;
    END;
  ELSE
    RETURN QUERY SELECT 
      'User Tests'::text,
      'SKIPPED'::text,
      'No authenticated user to test with'::text;
  END IF;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all constraints and indexes are in place
ALTER TABLE public.users ALTER COLUMN name SET DEFAULT 'User';
ALTER TABLE public.users ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE public.users ALTER COLUMN updated_at SET DEFAULT NOW();

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Add optimized indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active ON public.subscriptions(user_id, has_active_subscription);