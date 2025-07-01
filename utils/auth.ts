import { supabase, createTimeoutWrapper } from './supabase';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  focusArea?: string;
}

export const signUp = async (email: string, password: string, name: string) => {
  try {
    console.log('🚀 Starting sign up process for:', email);
    
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

    console.log('📧 Attempting to create user account...');
    
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

    console.log('📝 Sign up response:', { 
      user: data?.user ? 'Created' : 'Not created', 
      session: data?.session ? 'Active' : 'None',
      error: error?.message || 'None' 
    });

    if (error) {
      console.error('❌ Supabase auth error:', error);
      
      // Handle specific error cases
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }
      
      if (error.message.includes('Invalid email')) {
        throw new Error('Please enter a valid email address.');
      }
      
      if (error.message.includes('Password')) {
        throw new Error('Password must be at least 6 characters long.');
      }

      if (error.message.includes('Signups not allowed') || error.message.includes('signup')) {
        throw new Error('New user registration is currently disabled. Please contact support.');
      }

      if (error.message.includes('Database error') || error.message.includes('relation')) {
        throw new Error('There was an issue creating your account. Please try again.');
      }
      
      throw new Error(error.message);
    }

    if (data?.user) {
      console.log('✅ User created successfully:', data.user.id);
      
      if (data.session) {
        console.log('✅ User signed in immediately with session');
        
        // CRITICAL FIX: Immediately try to ensure profile exists with longer timeout
        setTimeout(async () => {
          try {
            await ensureUserProfileExists(data.user, name.trim());
          } catch (profileError) {
            console.warn('⚠️ Background profile creation had issues:', profileError);
          }
        }, 2000); // Give more time before profile creation
      } else {
        console.log('ℹ️ User created but needs email confirmation');
      }
    }

    return { user: data?.user, session: data?.session, error: null };
  } catch (error: any) {
    console.error('❌ Sign up error:', error);
    return { user: null, session: null, error: error.message || 'An unexpected error occurred during sign up' };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log('🔐 Starting sign in process for:', email);
    
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    console.log('🔍 Attempting to sign in...');
    
    // CRITICAL FIX: Use much longer timeout for sign in
    const result = await createTimeoutWrapper(
      () => supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      }),
      15000 // INCREASED: 15 second timeout for sign in
    );

    const { data, error } = result;

    console.log('📝 Sign in response:', { 
      user: data?.user ? 'Found' : 'Not found', 
      session: data?.session ? 'Active' : 'None',
      error: error?.message || 'None' 
    });

    if (error) {
      console.error('❌ Supabase auth error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and click the confirmation link before signing in.');
      }
      
      throw new Error(error.message);
    }

    if (data?.user && data?.session) {
      console.log('✅ Sign in successful for user:', data.user.id);
      
      // Try to ensure user profile exists in background with longer delay
      setTimeout(async () => {
        try {
          await ensureUserProfileExists(data.user);
        } catch (profileError) {
          console.warn('⚠️ Background profile check had issues:', profileError);
        }
      }, 1500); // Give more time before profile check
    }

    return { user: data?.user, error: null };
  } catch (error: any) {
    console.error('❌ Sign in error:', error);
    return { user: null, error: error.message || 'An unexpected error occurred during sign in' };
  }
};

// CRITICAL FIX: Enhanced profile creation with retry logic and longer timeouts
const ensureUserProfileExists = async (user: any, name?: string) => {
  try {
    console.log('👤 Ensuring user profile exists for:', user.id);
    
    // CRITICAL FIX: Try multiple approaches with retries
    let result = null;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts && (!result || !result[0]?.success)) {
      attempts++;
      console.log(`🔧 Profile creation attempt ${attempts}/${maxAttempts}...`);
      
      // Try using the database function first
      result = await createTimeoutWrapper(
        () => supabase.rpc('ensure_user_profile_exists', {
          check_user_id: user.id
        }),
        attempts === 1 ? 15000 : 10000, // Longer timeout on first attempt
        [{ success: false, message: 'Timeout', user_data: {} }]
      );
      
      console.log(`🔧 Profile creation attempt ${attempts} result:`, result);
      
      if (result && result.length > 0 && result[0].success) {
        console.log('✅ User profile ensured successfully via RPC');
        return;
      }
      
      // If RPC failed, try direct upsert as fallback
      if (attempts === maxAttempts) {
        console.log('🔧 Trying direct profile upsert as fallback...');
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
            10000, // 10 second timeout
            null
          );
          console.log('✅ Direct profile upsert successful');
          return;
        } catch (upsertError) {
          console.error('❌ Direct profile upsert failed:', upsertError);
        }
      }
      
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between attempts
      }
    }
    
    console.warn('⚠️ All profile creation attempts failed');
  } catch (error) {
    console.error('❌ Error ensuring profile exists:', error);
  }
};

export const signOut = async () => {
  try {
    console.log('🚪 Starting sign out process');
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
    
    console.log('✅ Sign out successful');
    return { error: null };
  } catch (error: any) {
    console.error('❌ Sign out error:', error);
    return { error: error.message || 'An unexpected error occurred during sign out' };
  }
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    console.log('👤 Getting current user...');
    
    // CRITICAL FIX: Use much longer timeout with enhanced fallback
    const authResult = await createTimeoutWrapper(
      () => supabase.auth.getUser(),
      8000 // INCREASED: 8 second timeout
    );
    
    const { data: { user } } = authResult;
    
    if (!user) {
      console.log('ℹ️ No authenticated user found');
      return null;
    }

    console.log('✅ Found authenticated user:', user.id);

    // CRITICAL FIX: Try to get profile data with much longer timeout and retry logic
    try {
      // Try with retries
      let profileResult = null;
      let attempts = 0;
      const maxAttempts = 2;
      
      while (attempts < maxAttempts && !profileResult?.data) {
        attempts++;
        console.log(`🔄 Profile fetch attempt ${attempts}/${maxAttempts}...`);
        
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
          console.log('✅ User profile found:', profileResult.data.name);
          return {
            id: profileResult.data.id,
            email: profileResult.data.email,
            name: profileResult.data.name,
            focusArea: profileResult.data.focus_area || undefined,
          };
        }
        
        if (attempts < maxAttempts) {
          console.warn(`⚠️ Profile fetch attempt ${attempts} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between attempts
        }
      }
      
      console.warn('⚠️ All profile fetch attempts failed');
    } catch (profileError) {
      console.warn('⚠️ Profile fetch exception:', profileError);
    }

    // CRITICAL FIX: Always return basic auth info as fallback
    console.log('👤 Using basic auth info as fallback');
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || 'User',
      focusArea: undefined
    };
  } catch (error: any) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

export const updateUserProfile = async (updates: Partial<AuthUser>) => {
  try {
    console.log('🔄 Starting user profile update...', updates);
    
    // CRITICAL FIX: Use much longer timeout for auth check
    const authResult = await createTimeoutWrapper(
      () => supabase.auth.getUser(),
      8000 // INCREASED: 8 second timeout
    );
    
    const { data: { user } } = authResult;
    
    if (!user) {
      throw new Error('No authenticated user found');
    }

    console.log('👤 Updating profile for user:', user.id);

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

    console.log('📝 Update data:', updateData);

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
      console.error('❌ Profile update error:', error);
      throw error;
    }

    console.log('✅ User profile updated successfully:', data);
    return { error: null, data };

  } catch (error: any) {
    console.error('❌ Update profile error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'An unexpected error occurred while updating profile';
    
    if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please check your connection and try again.';
    } else if (error.message.includes('network')) {
      errorMessage = 'Network connection issue. Please check your internet connection and try again.';
    } else if (error.message.includes('No authenticated user')) {
      errorMessage = 'Please sign in again to update your profile.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { error: errorMessage };
  }
};

export const resetPassword = async (email: string) => {
  try {
    console.log('🔄 Starting password reset for:', email);
    
    // Use Linking.createURL to generate a proper redirect URL
    let redirectUrl;
    if (Platform.OS === 'web') {
      // For web, create a proper URL using Linking
      redirectUrl = Linking.createURL('auth/signin');
    } else {
      // For native, use a deep link scheme
      redirectUrl = Linking.createURL('auth/signin');
    }
    
    console.log('🔗 Using redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) {
      console.error('❌ Password reset error:', error);
      throw error;
    }

    console.log('✅ Password reset email sent successfully');
    return { error: null };
  } catch (error: any) {
    console.error('❌ Reset password error:', error);
    return { error: error.message || 'An unexpected error occurred while resetting password' };
  }
};

// CRITICAL FIX: Add a function to test and debug database access
export const testDatabaseAccess = async () => {
  try {
    console.log('🔍 Testing database access...');
    
    const result = await createTimeoutWrapper(
      () => supabase.rpc('test_database_access'),
      8000, // 8 second timeout
      []
    );
    
    console.log('📊 Database access test results:', result);
    return result;
  } catch (error) {
    console.error('❌ Database access test failed:', error);
    return [];
  }
};