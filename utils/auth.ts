import { supabase } from './supabase';
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
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
      }
    });

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
        
        // CRITICAL FIX: Don't wait for profile creation - let it happen in background
        // The trigger function will handle profile creation
        try {
          // Quick attempt to ensure profile exists, but don't block on it
          setTimeout(() => {
            ensureUserProfileExists(data.user, name.trim()).catch(error => {
              console.warn('⚠️ Background profile creation had issues:', error);
            });
          }, 100);
        } catch (error) {
          console.warn('⚠️ Profile creation scheduling failed:', error);
        }
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
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

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
      
      // Try to ensure user profile exists, but don't fail if it doesn't work
      try {
        setTimeout(() => {
          ensureUserProfileExists(data.user).catch(error => {
            console.warn('⚠️ Background profile check had issues:', error);
          });
        }, 100);
      } catch (profileError) {
        console.warn('⚠️ Profile check scheduling failed:', profileError);
      }
    }

    return { user: data?.user, error: null };
  } catch (error: any) {
    console.error('❌ Sign in error:', error);
    return { user: null, error: error.message || 'An unexpected error occurred during sign in' };
  }
};

// CRITICAL FIX: Increased timeouts and better error handling
const ensureUserProfileExists = async (user: any, name?: string) => {
  try {
    console.log('👤 Checking if user profile exists...');
    
    // CRITICAL FIX: Increased timeout to 8 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile check timeout')), 8000);
    });
    
    const profilePromise = supabase
      .from('users')
      .select('id, name, email, focus_area')
      .eq('id', user.id)
      .single();

    const { data: existingProfile, error: selectError } = await Promise.race([
      profilePromise,
      timeoutPromise
    ]) as any;

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Error checking profile:', selectError);
      return; // Don't throw error to avoid blocking auth flow
    }

    if (!existingProfile) {
      console.log('👤 Creating missing user profile...');
      
      // CRITICAL FIX: Increased timeout for profile creation
      const upsertTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile creation timeout')), 8000);
      });
      
      const upsertPromise = supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: name || user.user_metadata?.name || 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      const { error: upsertError } = await Promise.race([
        upsertPromise,
        upsertTimeoutPromise
      ]) as any;

      if (upsertError) {
        console.error('❌ Error creating user profile:', upsertError);
        // Don't throw error to avoid blocking auth flow
      } else {
        console.log('✅ User profile created successfully');
      }
    } else {
      console.log('✅ User profile already exists');
    }
  } catch (error: any) {
    console.error('❌ Error in profile check:', error);
    // Don't throw error to avoid blocking auth flow
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
    
    // CRITICAL FIX: Increased timeout to 15 seconds
    const authTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth user check timeout')), 15000);
    });
    
    const authPromise = supabase.auth.getUser();
    
    const { data: { user } } = await Promise.race([
      authPromise,
      authTimeoutPromise
    ]) as any;
    
    if (!user) {
      console.log('ℹ️ No authenticated user found');
      return null;
    }

    console.log('✅ Found authenticated user:', user.id);

    // Get user profile from our users table with increased timeout
    try {
      const profileTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 15000);
      });
      
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data, error } = await Promise.race([
        profilePromise,
        profileTimeoutPromise
      ]) as any;

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('⚠️ Error fetching user profile:', error);
      }

      if (data) {
        console.log('✅ User profile found:', data.name);
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          focusArea: data.focus_area || undefined,
        };
      }
    } catch (error: any) {
      console.error('❌ Exception in profile fetch:', error);
    }

    // Fallback to basic auth info if profile doesn't exist
    console.log('👤 No user profile found, returning basic auth info');
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || 'User',
    };
  } catch (error: any) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

export const updateUserProfile = async (updates: Partial<AuthUser>) => {
  try {
    console.log('🔄 Starting user profile update...', updates);
    
    // CRITICAL FIX: Increased timeout for auth check to 15 seconds
    const authTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth check timeout')), 15000);
    });
    
    const authPromise = supabase.auth.getUser();
    
    const { data: { user } } = await Promise.race([
      authPromise,
      authTimeoutPromise
    ]) as any;
    
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

    // CRITICAL FIX: Increased timeout for database update to 20 seconds
    const updateTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile update timeout')), 20000);
    });

    const updatePromise = supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        ...updateData,
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    const { data, error } = await Promise.race([
      updatePromise,
      updateTimeoutPromise
    ]) as any;

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