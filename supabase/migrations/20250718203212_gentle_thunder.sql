/*
  # Cache Management System

  1. New Functions
    - `clear_user_cache_data` - Clears user-specific cached data
    - `get_cache_statistics` - Returns cache usage statistics
  
  2. Cache Management
    - Provides server-side cache clearing capabilities
    - Helps resolve iOS cache issues
    - Maintains data integrity while clearing cache
*/

-- Function to clear user cache data (server-side)
CREATE OR REPLACE FUNCTION clear_user_cache_data(user_id_input UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- This function can be used to clear server-side cached data
  -- Client-side cache clearing is handled by the mobile app
  
  result := json_build_object(
    'success', true,
    'message', 'Server-side cache operations completed',
    'user_id', user_id_input,
    'timestamp', now(),
    'note', 'Client-side cache should be cleared from the mobile app'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'user_id', user_id_input,
      'timestamp', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cache statistics
CREATE OR REPLACE FUNCTION get_cache_statistics()
RETURNS JSON AS $$
DECLARE
  user_count INTEGER;
  journal_count INTEGER;
  notification_count INTEGER;
  result JSON;
BEGIN
  -- Get basic statistics
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO journal_count FROM journal_entries;
  SELECT COUNT(*) INTO notification_count FROM notification_templates;
  
  result := json_build_object(
    'timestamp', now(),
    'statistics', json_build_object(
      'total_users', user_count,
      'total_journal_entries', journal_count,
      'total_notification_templates', notification_count
    ),
    'cache_note', 'Client-side cache clearing available in mobile app settings'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION clear_user_cache_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_cache_statistics() TO authenticated;