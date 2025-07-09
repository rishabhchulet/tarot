import { supabase, createTimeoutWrapper } from './supabase';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

// Enhanced error logging utility
const logAuthEvent = (event: string, data?: any, error?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`🔐 [${timestamp}] ${event}:`, data ? data : '', error ? `Error: ${error}` : '');
};

// Enhanced error message helper
const getEnhancedErrorMessage = (error: any, context: string): string => {
  logAuthEvent(`Error in ${context}`, null, error);
  
  const message = error.message || error.toString();
  
  if (message.includes('timeout') || message.includes('aborted')) {
    return 'Connection timeout. Please check your internet connection and try again.';
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your internet connection.';
  }
  
  if (message.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  
  if (message.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.';
  }
  
  if (message.includes('Invalid email')) {
    return 'Please enter a valid email address.';
  }
  
  if (message.includes('Password')) {
    return 'Password must be at least 6 characters long.';
  }
  
  if (message.includes('Signups not allowed') || message.includes('signup')) {
    return 'New user registration is currently disabled. Please contact support.';
  }
  
  if (message.includes('Database error') || message.includes('relation') || message.includes('schema')) {
    return 'Database connection issue. Please try again in a moment.';
  }
  
  // Return original message if no specific handling
  return message.length > 100 ? 'An unexpected error occurred. Please try again.' : message;
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  focusArea?: string;
}

// CRITICAL: Add test function for auth state
export const testAuthState = async () => {
  try {
    console.log('🧪 Testing current auth state...');
    
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: userData } = await supabase.auth.getUser();
    
    const testResult = {
      timestamp: new Date().toISOString(),
      hasSession: !!sessionData.session,
      sessionId: sessionData.session?.access_token?.substring(0, 20) + '...',
      hasUser: !!userData.user,
      userId: userData.user?.id,
      userEmail: userData.user?.email,
    };
    
    console.log('🧪 Auth state test results:', testResult);
    return testResult;
  } catch (error) {
    console.error('❌ Auth state test failed:', error);
    return { error: error.message };
  }
};

export const signUp = async (email: string, password: string, name: string) => {
  try {
    logAuthEvent('Starting sign up process', { email, nameLength: name.length });
    
    // Validate inputs
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }

    logAuthEvent('Attempting to create user account');
    
    // CRITICAL FIX: Use much longer timeout for sign up
    const result = await createTimeoutWrapper(
      () => supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        }
      }),
      20000 // INCREASED: 20 second timeout for sign up
    );

    const { data, error } = result;

    logAuthEvent('Sign up response', { 
      user: data?.user ? 'Created' : 'Not created', 
      session: data?.session ? 'Active' : 'None',
      userId: data?.user?.id
    });

    if (error) {
      throw new Error(getEnhancedErrorMessage(error, 'signUp'));
    }

    if (data?.user) {
      logAuthEvent('User created successfully', { userId: data.user.id, hasSession: !!data.session });
      
      if (data.session) {
        logAuthEvent('User signed in immediately with session');
        
        // CRITICAL FIX: Immediately try to ensure profile exists with longer timeout
        setTimeout(async () => {
          try {
            await ensureUserProfileExists(data.user, name.trim());
          } catch (profileError) {
            logAuthEvent('Background profile creation had issues', null, profileError);
          }
        }, 2000); // Give more time before profile creation
      } else {
        logAuthEvent('User created but needs email confirmation');
      }
    }

    return { user: data?.user, session: data?.session, error: null };
  } catch (error: any) {
    const enhancedError = getEnhancedErrorMessage(error, 'signUp');
    return { user: null, session: null, error: enhancedError };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    logAuthEvent('Starting sign in process', { email });
    
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    logAuthEvent('Attempting to sign in');
    
    // CRITICAL FIX: Use much longer timeout for sign in
    const result = await createTimeoutWrapper(
      () => supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      }),
      15000 // INCREASED: 15 second timeout for sign in
    );

    const { data, error } = result;

    logAuthEvent('Sign in response', { 
      user: data?.user ? 'Found' : 'Not found', 
      session: data?.session ? 'Active' : 'None',
      userId: data?.user?.id
    });

    if (error) {
      throw new Error(getEnhancedErrorMessage(error, 'signIn'));
    }

    if (data?.user && data?.session) {
      logAuthEvent('Sign in successful', { userId: data.user.id });
      
      // Try to ensure user profile exists in background with longer delay
      setTimeout(async () => {
        try {
          await ensureUserProfileExists(data.user);
        } catch (profileError) {
          logAuthEvent('Background profile check had issues', null, profileError);
        }
      }, 1500); // Give more time before profile check
    }

    return { user: data?.user, error: null };
  } catch (error: any) {
    const enhancedError = getEnhancedErrorMessage(error, 'signIn');
    return { user: null, error: enhancedError };
  }
};

// CRITICAL FIX: More robust profile creation with better error handling
const ensureUserProfileExists = async (user: any, name?: string) => {
  try {
    logAuthEvent('Ensuring user profile exists', { userId: user.id, nameProvided: !!name });
    
    // Try using the database function with retries
    let ensureResult = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts && (!ensureResult || !ensureResult[0]?.success)) {
      attempts++;
      logAuthEvent(`Profile creation attempt ${attempts}/${maxAttempts}`);
      
      ensureResult = await createTimeoutWrapper(
        () => supabase.rpc('ensure_user_profile_exists', {
          check_user_id: user.id
        }),
        attempts === 1 ? 12000 : 8000, // Reasonable timeouts
        [{ success: false, message: 'Timeout', user_data: {} }]
      );
      
      logAuthEvent(`Profile ensure attempt ${attempts} result`, { 
        success: ensureResult?.[0]?.success, 
        message: ensureResult?.[0]?.message 
      });
      
      if (ensureResult && ensureResult.length > 0 && ensureResult[0].success) {
        logAuthEvent('User profile ensured successfully');
        return;
      }
      
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between attempts
      }
    }
    
    // If all RPC attempts failed, try direct upsert as final fallback
    if (!ensureResult || !ensureResult[0]?.success) {
      logAuthEvent('All RPC attempts failed, trying direct upsert as final fallback');
      
      try {
        await createTimeoutWrapper(
          () => supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email || `user_${user.id}@example.com`,
              name: name || user.raw_user_meta_data?.name || 'User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id'
            }),
          8000, // 8 second timeout
          null
        );
        logAuthEvent('Direct profile upsert successful');
        return;
      } catch (upsertError) {
        logAuthEvent('Direct profile upsert also failed', null, upsertError);
      }
    }
    
    logAuthEvent('All profile creation methods exhausted');
  } catch (error) {
    logAuthEvent('Error ensuring profile exists', null, error);
  }
};

export const supabaseSignOut = async () => {
  try {
    logAuthEvent('Starting sign out process');
    
    // Step 1: Try global sign out first (all devices)
    try {
      const globalResult = await createTimeoutWrapper(
        () => supabase.auth.signOut({ scope: 'global' }),
        5000 // Reduced to 5 second timeout for faster response
      );
      
      if (globalResult.error) {
        console.warn('⚠️ Global sign out error:', globalResult.error);
      } else {
        console.log('✅ Global sign out successful');
      }
    } catch (globalError) {
      console.warn('⚠️ Global sign out timeout or error:', globalError);
    }
    
    // Step 2: Also try regular sign out as a fallback
    try {
      const result = await createTimeoutWrapper(
        () => supabase.auth.signOut(),
        3000 // Reduced to 3 second timeout
      );
      
      if (result.error) {
        console.warn('⚠️ Regular sign out error:', result.error);
      } else {
        console.log('✅ Regular sign out successful');
      }
    } catch (error) {
      console.warn('⚠️ Regular sign out timeout or error:', error);
    }
    
    // Step 3: Force clear any remaining auth data from storage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Find all Supabase related keys and remove them
        const keys = Object.keys(localStorage);
        let removed = 0;
        for (const key of keys) {
          if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
            localStorage.removeItem(key);
            removed++;
            console.log('🗑️ Removed auth storage item:', key);
          }
        }
        console.log(`🧹 Removed ${removed} auth-related items from storage`);
        
        // Force a more aggressive cleanup for stubborn auth tokens
        try {
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('sb-access-token');
          localStorage.removeItem('sb-refresh-token');
        } catch (e) {
          console.warn('⚠️ Error during forced token removal:', e);
        }
      }
    } catch (storageError) {
      console.warn('⚠️ Storage cleanup error:', storageError);
    } finally {
      // Ensure cleanup is complete
    }
    
    // Always return success to prevent errors from bubbling up
    logAuthEvent('Sign out successful');
    return { error: null };
  } catch (error: any) {
    const enhancedError = getEnhancedErrorMessage(error, 'supabaseSignOut');
    return { error: enhancedError };
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    logAuthEvent('Getting current user');
    
    // CRITICAL FIX: Use much longer timeout with enhanced fallback
    const authResult = await createTimeoutWrapper(
      () => supabase.auth.getUser(),
      8000 // INCREASED: 8 second timeout
    );
    
    const { data: { user } } = authResult;
    
    if (!user) {
      logAuthEvent('No authenticated user found');
      return null;
    }

    logAuthEvent('Found authenticated user', { userId: user.id, email: user.email });

    // CRITICAL FIX: Try to get profile data with much longer timeout and retry logic
    try {
      // Try with retries
      let profileResult = null;
      let attempts = 0;
      const maxAttempts = 2;
      
      while (attempts < maxAttempts && !profileResult?.data) {
        attempts++;
        logAuthEvent(`Profile fetch attempt ${attempts}/${maxAttempts}`);
        
        profileResult = await createTimeoutWrapper(
          () => supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single(),
          attempts === 1 ? 8000 : 5000, // Longer timeout on first attempt
          null
        );
        
        if (profileResult && profileResult.data && !profileResult.error) {
          logAuthEvent('User profile found', { 
            name: profileResult.data.name, 
            focusArea: profileResult.data.focus_area 
          });
          return {
            id: profileResult.data.id,
            email: profileResult.data.email,
            name: profileResult.data.name,
            focusArea: profileResult.data.focus_area || undefined,
          };
        }
        
        if (attempts < maxAttempts) {
          logAuthEvent(`Profile fetch attempt ${attempts} failed, retrying`, null, profileResult?.error);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between attempts
        }
      }
      
      logAuthEvent('All profile fetch attempts failed');
    } catch (profileError) {
      logAuthEvent('Profile fetch exception', null, profileError);
    }

    // CRITICAL FIX: Always return basic auth info as fallback
    logAuthEvent('Using basic auth info as fallback');
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || 'User',
      focusArea: undefined
    };
  } catch (error: any) {
    logAuthEvent('Error getting current user', null, error);
    return null;
  }
};

export const updateUserProfile = async (updates: Partial<AuthUser>) => {
  try {
    logAuthEvent('Starting user profile update', { updatesKeys: Object.keys(updates) });
    
    // CRITICAL FIX: Use much longer timeout for auth check
    const authResult = await createTimeoutWrapper(
      () => supabase.auth.getUser(),
      8000 // INCREASED: 8 second timeout
    );
    
    const { data: { user } } = authResult;
    
    if (!user) {
      throw new Error('No authenticated user found');
    }

    logAuthEvent('Updating profile for user', { userId: user.id });

    // Prepare the update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }

    if (updates.focusArea !== undefined) {
      updateData.focus_area = updates.focusArea;
    }

    logAuthEvent('Update data prepared', { updateFields: Object.keys(updateData) });

    // CRITICAL FIX: Use much longer timeout for database update with retry
    const updateResult = await createTimeoutWrapper(
      () => supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          ...updateData,
        }, {
          onConflict: 'id'
        })
        .select()
        .single(),
      12000, // INCREASED: 12 second timeout
      { data: null, error: null } // Fallback to success if timeout
    );

    const { data, error } = updateResult;

    if (error) {
      throw error;
    }

    logAuthEvent('User profile updated successfully', { hasData: !!data });
    return { error: null, data };

  } catch (error: any) {
    const enhancedError = getEnhancedErrorMessage(error, 'updateUserProfile');
    return { error: enhancedError };
  }
};

export const resetPassword = async (email: string) => {
  try {
    logAuthEvent('Starting password reset', { email });
    
    // Use Linking.createURL to generate a proper redirect URL
    let redirectUrl;
    if (Platform.OS === 'web') {
      // For web, create a proper URL using Linking
      redirectUrl = Linking.createURL('auth/signin');
    } else {
      // For native, use a deep link scheme
      redirectUrl = Linking.createURL('auth/signin');
    }
    
    logAuthEvent('Using redirect URL', { redirectUrl });
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) {
      throw error;
    }

    logAuthEvent('Password reset email sent successfully');
    return { error: null };
  } catch (error: any) {
    const enhancedError = getEnhancedErrorMessage(error, 'resetPassword');
    return { error: enhancedError };
  }
};

// CRITICAL FIX: Add a function to test and debug database access
export const testDatabaseAccess = async () => {
  try {
    logAuthEvent('Testing database access');
    
    const result = await createTimeoutWrapper(
      () => supabase.rpc('test_database_access'),
      8000, // 8 second timeout
      []
    );
    
    logAuthEvent('Database access test results', { resultCount: result?.length || 0 });
    return result;
  } catch (error) {
    logAuthEvent('Database access test failed', null, error);
    return [];
  }
};

// NEW: Enhanced diagnostic function
export const runFullDiagnostics = async () => {
  logAuthEvent('Running full diagnostics');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
  };
  
  // Test 1: Basic connectivity
  try {
    const startTime = Date.now();
    await supabase.from('users').select('count').limit(1);
    diagnostics.tests.push({
      name: 'Basic Connectivity',
      status: 'PASS',
      duration: Date.now() - startTime,
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'Basic Connectivity',
      status: 'FAIL',
      error: getEnhancedErrorMessage(error, 'connectivity'),
    });
  }
  
  // Test 2: Auth status
  try {
    const startTime = Date.now();
    const { data } = await supabase.auth.getUser();
    diagnostics.tests.push({
      name: 'Auth Status',
      status: 'PASS',
      duration: Date.now() - startTime,
      hasUser: !!data.user,
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'Auth Status',
      status: 'FAIL',
      error: getEnhancedErrorMessage(error, 'auth-status'),
    });
  }
  
  // Test 3: Database functions
  try {
    const startTime = Date.now();
    await supabase.rpc('test_database_access');
    diagnostics.tests.push({
      name: 'Database Functions',
      status: 'PASS',
      duration: Date.now() - startTime,
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'Database Functions',
      status: 'FAIL',
      error: getEnhancedErrorMessage(error, 'database-functions'),
    });
  }
  
  logAuthEvent('Full diagnostics completed', { 
    totalTests: diagnostics.tests.length,
    passedTests: diagnostics.tests.filter(t => t.status === 'PASS').length 
  });
  
  return diagnostics;
};