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
    
    // Create the auth user with timeout
    const signUpPromise = supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
        // Disable email confirmation for immediate signup
        emailRedirectTo: undefined,
      }
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sign up timeout - please try again')), 10000)
    );

    const { data, error } = await Promise.race([signUpPromise, timeoutPromise]) as any;

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

      if (error.message.includes('Database error') || error.message.includes('relation')) {
        throw new Error('There was an issue creating your account. Please try again.');
      }
      
      throw new Error(error.message);
    }

    if (data?.user) {
      console.log('✅ User created successfully:', data.user.id);
      
      // If we have a session, the user profile should have been created by the trigger
      if (data.session) {
        console.log('✅ User signed in immediately with session');
        
        // Give the database trigger time to create the profile
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify the profile was created with retry logic
        await ensureUserProfileWithRetry(data.user, name.trim());
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
    
    // Sign in with timeout
    const signInPromise = supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sign in timeout - please try again')), 8000)
    );

    const { data, error } = await Promise.race([signInPromise, timeoutPromise]) as any;

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
      
      // Ensure user profile exists
      await ensureUserProfileWithRetry(data.user);
    }

    return { user: data?.user, error: null };
  } catch (error: any) {
    console.error('❌ Sign in error:', error);
    return { user: null, error: error.message || 'An unexpected error occurred during sign in' };
  }
};

// Enhanced helper function with retry logic and better error handling
const ensureUserProfileWithRetry = async (user: any, name?: string, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`👤 Checking user profile (attempt ${attempt}/${maxRetries})...`);
      
      const { data: existingProfile, error: selectError } = await supabase
        .from('users')
        .select('id, name, email, focus_area')
        .eq('id', user.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error(`❌ Error checking profile (attempt ${attempt}):`, selectError);
        if (attempt === maxRetries) {
          console.warn('⚠️ Could not verify profile creation, but continuing...');
          return; // Don't throw error to avoid blocking auth flow
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      if (!existingProfile) {
        console.log('👤 Creating missing user profile...');
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            name: name || user.user_metadata?.name || 'User',
          });

        if (insertError) {
          console.error(`❌ Error creating user profile (attempt ${attempt}):`, insertError);
          
          // If it's a unique constraint violation, the profile might have been created by another process
          if (insertError.code === '23505') {
            console.log('ℹ️ Profile already exists (created by another process)');
            break;
          }
          
          if (attempt === maxRetries) {
            console.warn('⚠️ Could not create profile, but continuing...');
            return; // Don't throw error to avoid blocking auth flow
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        } else {
          console.log('✅ User profile created successfully');
          break;
        }
      } else {
        console.log('✅ User profile already exists');
        break;
      }
    } catch (error) {
      console.error(`❌ Error in profile check (attempt ${attempt}):`, error);
      if (attempt === maxRetries) {
        console.warn('⚠️ Profile verification failed, but continuing...');
        return; // Don't throw error to avoid blocking auth flow
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
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
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('ℹ️ No authenticated user found');
      return null;
    }

    console.log('✅ Found authenticated user:', user.id);

    // Get user profile from our users table with retry logic
    let profile = null;
    
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error(`⚠️ Error fetching user profile (attempt ${attempt}):`, error);
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        } else if (data) {
          profile = data;
          break;
        } else {
          // No profile found, try to create one
          console.log('👤 No profile found, attempting to create...');
          await ensureUserProfileWithRetry(user);
          
          // Try to fetch again
          const { data: newData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (newData) {
            profile = newData;
            break;
          }
        }
      } catch (error) {
        console.error(`❌ Exception in profile fetch (attempt ${attempt}):`, error);
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!profile) {
      console.log('👤 No user profile found, returning basic auth info');
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || 'User',
      };
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      focusArea: profile.focus_area || undefined,
    };
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

export const updateUserProfile = async (updates: Partial<AuthUser>) => {
  try {
    console.log('🔄 Starting user profile update...', updates);
    
    const { data: { user } } = await supabase.auth.getUser();
    
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

    // Perform the update with timeout
    const updatePromise = supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Update timeout')), 5000)
    );

    const { data, error } = await Promise.race([updatePromise, timeoutPromise]) as any;

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