/*
  # Fix Trial Start Function Issues

  1. Problem: 
     - Column reference 'trial_start_date' is ambiguous in start_user_trial function
     - Users cannot start yearly trials due to SQL error

  2. Solution:
     - Fix the start_user_trial function with proper table aliasing
     - Ensure all column references are unambiguous
     - Add better error handling
*/

-- Drop and recreate the start_user_trial function with fixed column references
DROP FUNCTION IF EXISTS public.start_user_trial(UUID, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION public.start_user_trial(
  user_id_input UUID,
  subscription_type_input TEXT,
  trial_days INTEGER DEFAULT 7
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_start_date timestamptz;
  trial_end_date timestamptz;
  update_result INTEGER;
BEGIN
  -- Calculate trial dates
  trial_start_date := NOW();
  trial_end_date := trial_start_date + (trial_days || ' days')::INTERVAL;
  
  -- Update subscription record to start trial (with explicit table alias)
  UPDATE public.subscriptions s
  SET
    subscription_type = subscription_type_input,
    trial_start_date = trial_start_date,
    trial_end_date = trial_end_date,
    has_active_subscription = false, -- Still in trial
    subscription_start_date = NULL, -- Will be set after trial
    updated_at = NOW()
  WHERE s.user_id = user_id_input;
  
  -- Check if the update affected any rows
  GET DIAGNOSTICS update_result = ROW_COUNT;
  
  IF update_result = 0 THEN
    -- No subscription record exists, create one
    INSERT INTO public.subscriptions (
      user_id,
      subscription_type,
      trial_start_date,
      trial_end_date,
      has_active_subscription,
      subscription_start_date,
      created_at,
      updated_at
    ) VALUES (
      user_id_input,
      subscription_type_input,
      trial_start_date,
      trial_end_date,
      false,
      NULL,
      NOW(),
      NOW()
    );
  END IF;
  
  -- Return success response
  RETURN json_build_object(
    'success', true,
    'subscription_type', subscription_type_input,
    'trial_start_date', trial_start_date,
    'trial_end_date', trial_end_date,
    'trial_days', trial_days,
    'message', 'Trial started successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to start trial: ' || SQLERRM,
      'error_code', 'TRIAL_START_ERROR'
    );
END;
$$;

-- Also fix the activate_user_subscription function for consistency
DROP FUNCTION IF EXISTS public.activate_user_subscription(UUID, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION public.activate_user_subscription(
  user_id_input UUID,
  subscription_type_input TEXT,
  duration_months INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamptz;
  end_date timestamptz;
  update_result INTEGER;
BEGIN
  start_date := NOW();
  
  -- Calculate end date based on subscription type
  IF subscription_type_input = 'lifetime' THEN
    end_date := NULL; -- Lifetime subscriptions never expire
  ELSIF subscription_type_input = 'yearly' THEN
    end_date := start_date + INTERVAL '1 year';
  ELSIF subscription_type_input = 'weekly' THEN
    end_date := start_date + INTERVAL '1 week';
  ELSIF duration_months IS NOT NULL THEN
    end_date := start_date + (duration_months || ' months')::INTERVAL;
  ELSE
    end_date := start_date + INTERVAL '1 year'; -- Default to yearly
  END IF;
  
  -- Update subscription record (with explicit table alias)
  UPDATE public.subscriptions s
  SET
    subscription_type = subscription_type_input,
    has_active_subscription = true,
    subscription_start_date = start_date,
    trial_end_date = start_date, -- End trial immediately when subscribing
    updated_at = NOW()
  WHERE s.user_id = user_id_input;
  
  -- Check if the update affected any rows
  GET DIAGNOSTICS update_result = ROW_COUNT;
  
  IF update_result = 0 THEN
    -- No subscription record exists, create one
    INSERT INTO public.subscriptions (
      user_id,
      subscription_type,
      trial_start_date,
      trial_end_date,
      has_active_subscription,
      subscription_start_date,
      created_at,
      updated_at
    ) VALUES (
      user_id_input,
      subscription_type_input,
      start_date,
      start_date, -- Trial ended immediately
      true,
      start_date,
      NOW(),
      NOW()
    );
  END IF;
  
  -- Return success response
  RETURN json_build_object(
    'success', true,
    'subscription_type', subscription_type_input,
    'start_date', start_date,
    'end_date', end_date,
    'message', 'Subscription activated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to activate subscription: ' || SQLERRM,
      'error_code', 'ACTIVATION_ERROR'
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.start_user_trial(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_user_subscription(UUID, TEXT, INTEGER) TO authenticated; 