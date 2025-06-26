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

    console.log('📧 Attempting to create user account...');
    
    const { data, error } = await supabase.auth.signUp({
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

    console.log('📝 Sign up response:', { 
      user: data.user ? 'Created' : 'Not created', 
      session: data.session ? 'Active' : 'None',
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
      
      throw new Error(error.message);
    }

    if (data.user) {
      console.log('✅ User created successfully:', data.user.id);
      
      // Only create profile if we have a session (user is confirmed)
      if (data.session) {
        console.log('👤 Creating user profile...');
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email!,
            name: name.trim(),
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('⚠️ Error creating user profile:', profileError);
          // Don't throw here as the auth user was created successfully
          console.log('User can still sign in, profile will be created on first login');
        } else {
          console.log('✅ User profile created successfully');
        }
      } else {
        console.log('ℹ️ User created but needs email confirmation');
      }
    }

    return { user: data.user, session: data.session, error: null };
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
      user: data.user ? 'Found' : 'Not found', 
      session: data.session ? 'Active' : 'None',
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

    if (data.user && data.session) {
      console.log('✅ Sign in successful for user:', data.user.id);
      
      // Ensure user profile exists
      await ensureUserProfile(data.user);
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('❌ Sign in error:', error);
    return { user: null, error: error.message || 'An unexpected error occurred during sign in' };
  }
};

// Helper function to ensure user profile exists
const ensureUserProfile = async (user: any) => {
  try {
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!existingProfile) {
      console.log('👤 Creating missing user profile...');
      const { error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'User',
        });

      if (error) {
        console.error('❌ Error creating user profile:', error);
      } else {
        console.log('✅ User profile created');
      }
    }
  } catch (error) {
    console.error('❌ Error ensuring user profile:', error);
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

    // Ensure profile exists
    await ensureUserProfile(user);

    // Get user profile from our users table
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('⚠️ Error fetching user profile:', error);
      // Return basic user info from auth if profile fetch fails
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || 'User',
      };
    }

    if (!profile) {
      console.log('👤 No user profile found after creation attempt');
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
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        focus_area: updates.focusArea,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }

    console.log('✅ User profile updated successfully');
    return { error: null };
  } catch (error: any) {
    console.error('❌ Update profile error:', error);
    return { error: error.message || 'An unexpected error occurred while updating profile' };
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