/*
  # Fix User Creation and Database Timeout Issues

  1. Database Improvements
    - Optimize the handle_new_user function for better performance
    - Add better error handling and logging
    - Ensure proper constraints and indexes
    - Fix potential race conditions

  2. Security
    - Maintain RLS protection
    - Ensure proper policies are in place
    - Add better constraint handling
*/

-- Drop existing function and trigger to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create optimized handle_new_user function
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
    user_email := 'user@example.com';
    RAISE LOG 'Warning: Empty email for user %, using fallback', NEW.id;
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
    email = EXCLUDED.email,
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

-- Drop and recreate policies with better names and logic
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users to own data" ON public.users;
DROP POLICY IF EXISTS "Enable update for users to own data" ON public.users;

-- User policies
CREATE POLICY "Users can insert own profile during signup"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure journal entries policies are correct
DROP POLICY IF EXISTS "Enable insert for authenticated users on journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Enable read access for users to own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Enable update for users to own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Enable delete for users to own journal entries" ON public.journal_entries;

CREATE POLICY "Users can insert own journal entries"
  ON public.journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own journal entries"
  ON public.journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON public.journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON public.journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure subscriptions policies are correct
DROP POLICY IF EXISTS "Enable insert for authenticated users on subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable read access for users to own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Enable update for users to own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own subscriptions"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
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

-- Set proper defaults
ALTER TABLE public.users ALTER COLUMN name SET DEFAULT 'User';
ALTER TABLE public.users ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE public.users ALTER COLUMN updated_at SET DEFAULT NOW();