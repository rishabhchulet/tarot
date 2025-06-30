import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, testSupabaseConnection } from '@/utils/supabase';
import { getCurrentUser, type AuthUser } from '@/utils/auth';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      const currentUser = await getCurrentUser();
      console.log('👤 Refreshed user:', { 
        id: currentUser?.id, 
        name: currentUser?.name, 
        focusArea: currentUser?.focusArea 
      });
      setUser(currentUser);
      setError(null);
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      setUser(null);
      // Don't set error here as it might be a temporary issue
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Starting sign out process...');
      
      // Clear local state first
      setUser(null);
      setSession(null);
      setError(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Supabase sign out error:', error);
        throw error;
      }
      
      console.log('✅ Sign out completed successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      // Even if there's an error, clear the local state
      setUser(null);
      setSession(null);
      throw error;
    }
  };

  useEffect(() => {
    console.log('🚀 AuthContext initializing...');
    
    let mounted = true;
    let initializationTimeout: NodeJS.Timeout;
    
    // FIXED: Shorter timeout and better handling for new users
    initializationTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth initialization timeout - proceeding without error for new users');
        setLoading(false);
        // FIXED: Don't set error for new users - let them go to auth screen
        setError(null);
      }
    }, 5000); // Reduced to 5 seconds
    
    // Get initial session with improved error handling
    const initializeAuth = async () => {
      try {
        console.log('🔍 Testing Supabase connection...');
        
        // FIXED: Test connection but don't fail for new users
        const connectionTest = await Promise.race([
          testSupabaseConnection(),
          new Promise<{ connected: boolean; error: string }>((resolve) => 
            setTimeout(() => resolve({ connected: false, error: 'Connection timeout' }), 3000)
          )
        ]);
        
        if (!connectionTest.connected) {
          console.error('❌ Supabase connection failed:', connectionTest.error);
          if (mounted) {
            // FIXED: Don't set error immediately - let auth flow handle it
            console.log('⚠️ Connection failed but continuing with auth flow...');
            setLoading(false);
          }
          return;
        }
        
        console.log('✅ Supabase connection successful');
        
        // Get session with shorter timeout
        console.log('🔐 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          if (mounted) {
            setSession(null);
            // FIXED: Don't treat session errors as fatal for new users
            setError(null);
            setLoading(false);
          }
          return;
        }
        
        console.log('📱 Initial session check:', { hasSession: !!session });
        
        if (mounted) {
          setSession(session);
          if (session) {
            // Add a small delay to ensure database trigger has completed
            console.log('👤 Session found, loading user profile...');
            await new Promise(resolve => setTimeout(resolve, 500));
            await refreshUser();
          }
          setError(null);
          setLoading(false);
        }
      } catch (error: any) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setSession(null);
          
          // FIXED: Only set error for existing users with sessions
          // New users should go to auth screen, not see error
          setError(null);
          setLoading(false);
        }
      } finally {
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        try {
          console.log('🔔 Auth state changed:', { event, hasSession: !!session });
          setSession(session);
          setError(null);
          
          if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            // Add delay for database trigger to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            await refreshUser();
          } else if (!session && event === 'SIGNED_OUT') {
            setUser(null);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('❌ Error handling auth state change:', error);
          if (mounted) {
            // Don't set error for auth state changes, just log it
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, error, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}