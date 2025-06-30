/*
  # Fix Authentication Policies and User Creation

  1. Policy Updates
    - Fix user creation policies to work properly with auth triggers
    - Ensure RLS policies allow proper data access for authenticated users
    - Fix any policy conflicts that might be causing session issues

  2. Function Updates
    - Improve handle_new_user function to be more robust
    - Add better error handling and logging
    - Ensure function works with auth state changes

  3. Security
    - Maintain proper RLS protection
    - Ensure users can only access their own data
    - Fix any permission issues causing auth failures
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can create own profile during signup" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Recreate user policies with better logic
CREATE POLICY "Enable insert for authenticated users during signup"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable read access for users to own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users to own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure journal entries policies are correct
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can read own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;

CREATE POLICY "Enable insert for authenticated users on journal entries"
  ON public.journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for users to own journal entries"
  ON public.journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users to own journal entries"
  ON public.journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users to own journal entries"
  ON public.journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure subscriptions policies are correct
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can read own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;

CREATE POLICY "Enable insert for authenticated users on subscriptions"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for users to own subscriptions"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users to own subscriptions"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Improve the handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name text;
  user_email text;
BEGIN
  -- Extract user data safely
  user_email := COALESCE(NEW.email, '');
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');
  
  -- Validate required data
  IF user_email = '' THEN
    RAISE LOG 'Warning: User email is empty for user ID: %', NEW.id;
    user_email := 'user@example.com';
  END IF;
  
  IF user_name = '' OR user_name IS NULL THEN
    user_name := 'User';
  END IF;
  
  -- Insert user profile with proper error handling
  BEGIN
    INSERT INTO public.users (id, email, name, focus_area, created_at, updated_at)
    VALUES (
      NEW.id,
      user_email,
      user_name,
      NULL,
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Successfully created user profile for: % with email: %', NEW.id, user_email;
    
  EXCEPTION 
    WHEN unique_violation THEN
      -- User profile already exists, update it
      UPDATE public.users 
      SET 
        email = user_email,
        name = user_name,
        updated_at = NOW()
      WHERE id = NEW.id;
      
      RAISE LOG 'Updated existing user profile for: %', NEW.id;
      
    WHEN OTHERS THEN
      -- Log error but don't fail the auth process
      RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Add helpful indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active ON public.subscriptions(user_id, has_active_subscription);