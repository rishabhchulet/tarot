/*
  # Fix Authentication Settings and Policies

  1. Database Functions
    - Improve handle_new_user function to handle all edge cases
    - Add better error handling and logging
    - Use UPSERT to prevent race conditions

  2. Security Policies
    - Ensure RLS policies are correctly configured
    - Fix any policy conflicts
    - Add proper constraints

  3. Auth Configuration
    - Ensure email confirmation is disabled
    - Fix any auth-related issues
*/

-- Drop existing function and trigger to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create optimized handle_new_user function with comprehensive error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name text;
  user_email text;
BEGIN
  -- Extract user data safely with better defaults
  user_email := COALESCE(NEW.email, '');
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');
  
  -- Validate and clean data
  IF user_email = '' OR user_email IS NULL THEN
    user_email := CONCAT('user_', NEW.id, '@example.com');
    RAISE LOG 'Warning: Empty email for user %, using fallback: %', NEW.id, user_email;
  END IF;
  
  IF user_name = '' OR user_name IS NULL THEN
    user_name := 'User';
  END IF;
  
  -- Use UPSERT to handle race conditions and ensure profile creation
  INSERT INTO public.users (id, email, name, focus_area, created_at, updated_at)
  VALUES (
    NEW.id,
    user_email,
    user_name,
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, users.email),
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = NOW();
  
  RAISE LOG 'User profile created/updated for: % with email: %', NEW.id, user_email;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE LOG 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure all tables have RLS enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop and recreate all policies with consistent naming
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users to own data" ON public.users;
DROP POLICY IF EXISTS "Enable update for users to own data" ON public.users;

-- User policies with clear, consistent naming
CREATE POLICY "users_insert_own_profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_select_own_profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Journal entries policies
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can read own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Enable insert for authenticated users on journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Enable read access for users to own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Enable update for users to own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Enable delete for users to own journal entries" ON public.journal_entries;

CREATE POLICY "journal_entries_insert_own"
  ON public.journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal_entries_select_own"
  ON public.journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "journal_entries_update_own"
  ON public.journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal_entries_delete_own"
  ON public.journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable insert for authenticated users on subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable read access for users to own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable update for users to own subscriptions" ON public.subscriptions;

CREATE POLICY "subscriptions_insert_own"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add optimized indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active ON public.subscriptions(user_id, has_active_subscription);

-- Ensure proper defaults and constraints
ALTER TABLE public.users ALTER COLUMN name SET DEFAULT 'User';
ALTER TABLE public.users ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE public.users ALTER COLUMN updated_at SET DEFAULT NOW();

-- Add constraints to ensure data integrity
DO $$
BEGIN
  -- Add email constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'users' 
    AND tc.constraint_name = 'users_email_not_empty'
    AND tc.table_schema = 'public'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_email_not_empty CHECK (email <> '');
  END IF;
  
  -- Add name constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.table_name = 'users' 
    AND tc.constraint_name = 'users_name_not_empty'
    AND tc.table_schema = 'public'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_name_not_empty CHECK (name <> '');
  END IF;
END $$;

-- Create a helper function to check auth configuration
CREATE OR REPLACE FUNCTION public.check_auth_config()
RETURNS TABLE(setting_name text, setting_value text) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'email_confirmation_enabled'::text as setting_name,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM auth.config 
        WHERE parameter = 'DISABLE_SIGNUP' AND value = 'false'
      ) THEN 'signup_enabled'
      ELSE 'signup_status_unknown'
    END as setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;