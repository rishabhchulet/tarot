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
      
      // CRITICAL FIX: Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('User refresh timeout')), 5000);
      });
      
      const userPromise = getCurrentUser();
      
      const currentUser = await Promise.race([userPromise, timeoutPromise]) as AuthUser | null;
      
      console.log('👤 Refreshed user:', { 
        id: currentUser?.id, 
        name: currentUser?.name, 
        focusArea: currentUser?.focusArea 
      });
      
      setUser(currentUser);
      setError(null);
    } catch (error: any) {
      console.error('❌ Error refreshing user:', error);
      
      // CRITICAL FIX: Don't set user to null if it's just a timeout
      // Keep existing user data if we have it
      if (error.message?.includes('timeout') && user) {
        console.log('⚠️ User refresh timeout, keeping existing user data');
        return;
      }
      
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
    
    // CRITICAL FIX: Much shorter timeout and better error handling
    initializationTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth initialization timeout - proceeding');
        setLoading(false);
        setError(null);
      }
    }, 3000); // 3 seconds max
    
    // Get initial session with better error handling
    const initializeAuth = async () => {
      try {
        console.log('🔍 Getting initial session...');
        
        // CRITICAL FIX: Add timeout to session check
        const sessionTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session check timeout')), 3000);
        });
        
        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise, 
          sessionTimeoutPromise
        ]) as any;
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          if (mounted) {
            setSession(null);
            setError(null); // Don't treat session errors as fatal
            setLoading(false);
          }
          return;
        }
        
        console.log('📱 Initial session check:', { hasSession: !!session });
        
        if (mounted) {
          setSession(session);
          if (session) {
            console.log('👤 Session found, loading user profile...');
            // CRITICAL FIX: Don't await this - let it happen in background
            refreshUser().finally(() => {
              if (mounted) {
                setLoading(false);
              }
            });
          } else {
            setLoading(false);
          }
          setError(null);
        }
      } catch (error: any) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setSession(null);
          setError(null); // Don't set error for new users
          setLoading(false);
        }
      } finally {
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        try {
          console.log('🔔 Auth state changed:', { event, hasSession: !!session });
          setSession(session);
          setError(null);
          
          if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            // CRITICAL FIX: Don't await this - let it happen in background
            refreshUser().finally(() => {
              if (mounted) {
                setLoading(false);
              }
            });
          } else if (!session && event === 'SIGNED_OUT') {
            setUser(null);
            setLoading(false);
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error('❌ Error handling auth state change:', error);
          if (mounted) {
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