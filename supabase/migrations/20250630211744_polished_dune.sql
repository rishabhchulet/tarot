/*
  # Fix Sign-up Issues and Optimize Database

  1. Database Optimizations
    - Simplify the handle_new_user function
    - Remove complex error handling that might cause timeouts
    - Ensure proper UPSERT logic for user creation

  2. Policy Simplification
    - Ensure all policies are correctly named and functional
    - Remove any conflicting or duplicate policies

  3. Performance Improvements
    - Add proper indexes for faster queries
    - Optimize trigger function for better performance
*/

-- Drop existing function and trigger to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create a much simpler and more reliable handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple UPSERT to create or update user profile
  INSERT INTO public.users (id, email, name, focus_area, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, CONCAT('user_', NEW.id, '@example.com')),
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, users.email),
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = NOW();
  
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

-- Drop all existing policies to recreate them cleanly
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users to own data" ON public.users;
DROP POLICY IF EXISTS "Enable update for users to own data" ON public.users;

-- Create clean, simple user policies
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

-- Clean up journal entries policies
DROP POLICY IF EXISTS "journal_entries_insert_own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_entries_select_own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_entries_update_own" ON public.journal_entries;
DROP POLICY IF EXISTS "journal_entries_delete_own" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can read own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;

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

-- Clean up subscriptions policies
DROP POLICY IF EXISTS "subscriptions_insert_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;

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

-- Ensure proper defaults and constraints
ALTER TABLE public.users ALTER COLUMN name SET DEFAULT 'User';
ALTER TABLE public.users ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE public.users ALTER COLUMN updated_at SET DEFAULT NOW();

-- Add optimized indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active ON public.subscriptions(user_id, has_active_subscription);

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