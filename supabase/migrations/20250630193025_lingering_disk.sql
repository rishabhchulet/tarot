/*
  # Fix user creation and profile handling

  1. Function Updates
    - Improve handle_new_user function with better error handling
    - Add proper logging and fallback mechanisms
    - Handle edge cases in user creation

  2. Security
    - Maintain RLS protection
    - Ensure proper error handling without exposing sensitive data
    - Add better constraint handling
*/

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name text;
  user_email text;
BEGIN
  -- Safely extract user data with proper fallbacks
  user_email := COALESCE(NEW.email, '');
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');
  
  -- Validate required data
  IF user_email = '' THEN
    RAISE LOG 'Warning: User email is empty for user ID: %', NEW.id;
    user_email := 'user@example.com'; -- Fallback email
  END IF;
  
  IF user_name = '' OR user_name IS NULL THEN
    user_name := 'User'; -- Fallback name
  END IF;
  
  -- Insert user profile with comprehensive error handling
  BEGIN
    INSERT INTO public.users (id, email, name, focus_area, created_at, updated_at)
    VALUES (
      NEW.id,
      user_email,
      user_name,
      NULL, -- focus_area will be set during onboarding
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Successfully created user profile for: % with email: %', NEW.id, user_email;
    
  EXCEPTION 
    WHEN unique_violation THEN
      -- User profile already exists, update it instead
      BEGIN
        UPDATE public.users 
        SET 
          email = user_email,
          name = user_name,
          updated_at = NOW()
        WHERE id = NEW.id;
        
        RAISE LOG 'Updated existing user profile for: %', NEW.id;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'Error updating existing user profile for %: %', NEW.id, SQLERRM;
      END;
      
    WHEN OTHERS THEN
      -- Log the error but don't fail the auth creation
      RAISE LOG 'Error creating user profile for % (email: %): %', NEW.id, user_email, SQLERRM;
      
      -- Try a minimal insert as fallback using ON CONFLICT
      BEGIN
        INSERT INTO public.users (id, email, name)
        VALUES (NEW.id, user_email, user_name)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          updated_at = NOW();
          
        RAISE LOG 'Fallback insert successful for: %', NEW.id;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'Fallback insert also failed for %: %', NEW.id, SQLERRM;
          -- Don't re-raise to avoid blocking auth user creation
      END;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure proper defaults and constraints
ALTER TABLE public.users ALTER COLUMN name SET DEFAULT 'User';
ALTER TABLE public.users ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE public.users ALTER COLUMN updated_at SET DEFAULT NOW();

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Verify all necessary policies exist
DO $$
BEGIN
  -- Check if the profile creation policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can create own profile during signup'
    AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Users can create own profile during signup"
      ON public.users
      FOR INSERT
      TO public
      WITH CHECK (auth.uid() = id);
  END IF;
  
  -- Check if the profile read policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can read own profile'
    AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
  
  -- Check if the profile update policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can update own profile'
    AND schemaname = 'public'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;