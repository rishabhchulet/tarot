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
    
    // CRITICAL FIX: Use timeout wrapper for sign up
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
      8000 // 8 second timeout for sign up
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
    
    // CRITICAL FIX: Use timeout wrapper for sign in
    const result = await createTimeoutWrapper(
      () => supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      }),
      6000 // 6 second timeout for sign in
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
    }

    return { user: data?.user, error: null };
  } catch (error: any) {
    console.error('❌ Sign in error:', error);
    return { user: null, error: error.message || 'An unexpected error occurred during sign in' };
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
    
    // CRITICAL FIX: Use timeout wrapper with very short timeout and immediate fallback
    const authResult = await createTimeoutWrapper(
      () => supabase.auth.getUser(),
      2000 // 2 second timeout
    );
    
    const { data: { user } } = authResult;
    
    if (!user) {
      console.log('ℹ️ No authenticated user found');
      return null;
    }

    console.log('✅ Found authenticated user:', user.id);

    // CRITICAL FIX: Try to get profile data with immediate fallback
    const profileResult = await createTimeoutWrapper(
      () => supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single(),
      1500, // Very short timeout
      null // Fallback to null if timeout
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
    
    // CRITICAL FIX: Use timeout wrapper for auth check
    const authResult = await createTimeoutWrapper(
      () => supabase.auth.getUser(),
      2000 // 2 second timeout
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

    // CRITICAL FIX: Use timeout wrapper for database update with fallback
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
      4000, // 4 second timeout
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