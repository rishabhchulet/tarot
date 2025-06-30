import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
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
      
      // CRITICAL FIX: Use a much shorter timeout and better fallback strategy
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('User refresh timeout')), 3000); // Reduced to 3 seconds
      });
      
      const userPromise = getCurrentUser();
      
      let currentUser: AuthUser | null = null;
      
      try {
        currentUser = await Promise.race([userPromise, timeoutPromise]) as AuthUser | null;
      } catch (timeoutError) {
        console.warn('⚠️ User refresh timeout, using session fallback...');
        
        // CRITICAL FIX: Immediate fallback to session data
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            currentUser = {
              id: authUser.id,
              email: authUser.email || '',
              name: authUser.user_metadata?.name || 'User',
              focusArea: undefined // Will be loaded later
            };
            console.log('✅ Using session fallback user data');
          }
        } catch (fallbackError) {
          console.error('❌ Session fallback failed:', fallbackError);
          throw timeoutError; // Re-throw original timeout error
        }
      }
      
      console.log('👤 User data result:', { 
        id: currentUser?.id, 
        name: currentUser?.name, 
        focusArea: currentUser?.focusArea 
      });
      
      setUser(currentUser);
      setError(null);
      
      // CRITICAL FIX: Try to load full profile data in background without blocking
      if (currentUser && !currentUser.focusArea) {
        setTimeout(async () => {
          try {
            console.log('🔄 Background profile fetch...');
            const { data } = await supabase
              .from('users')
              .select('focus_area, name')
              .eq('id', currentUser.id)
              .single();
            
            if (data) {
              setUser(prev => prev ? {
                ...prev,
                name: data.name || prev.name,
                focusArea: data.focus_area || undefined
              } : null);
              console.log('✅ Background profile update successful');
            }
          } catch (bgError) {
            console.warn('⚠️ Background profile fetch failed:', bgError);
          }
        }, 500);
      }
      
    } catch (error: any) {
      console.error('❌ Error refreshing user:', error);
      
      // Only clear user if we don't have existing data
      if (!user) {
        setUser(null);
      }
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
    
    // CRITICAL FIX: Much shorter timeout for faster UX
    initializationTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth initialization timeout - proceeding');
        setLoading(false);
        setError(null);
      }
    }, 2000); // Reduced to 2 seconds
    
    // Get initial session with aggressive timeout
    const initializeAuth = async () => {
      try {
        console.log('🔍 Getting initial session...');
        
        // CRITICAL FIX: Very short timeout for session check
        const sessionTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session check timeout')), 2000);
        });
        
        const sessionPromise = supabase.auth.getSession();
        
        let sessionResult;
        try {
          sessionResult = await Promise.race([sessionPromise, sessionTimeoutPromise]) as any;
        } catch (timeoutError) {
          console.warn('⚠️ Session check timeout, proceeding without session');
          if (mounted) {
            setSession(null);
            setLoading(false);
            setError(null);
          }
          return;
        }
        
        const { data: { session }, error } = sessionResult;
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          if (mounted) {
            setSession(null);
            setError(null);
            setLoading(false);
          }
          return;
        }
        
        console.log('📱 Initial session check:', { hasSession: !!session });
        
        if (mounted) {
          setSession(session);
          if (session) {
            console.log('👤 Session found, loading user profile...');
            // CRITICAL FIX: Don't wait for user data - load it in background
            setLoading(false); // Set loading false immediately
            
            // Load user data in background
            setTimeout(() => {
              if (mounted) {
                refreshUser();
              }
            }, 100);
          } else {
            setLoading(false);
          }
          setError(null);
        }
      } catch (error: any) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setSession(null);
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

    // Listen for auth changes with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        try {
          console.log('🔔 Auth state changed:', { event, hasSession: !!session });
          setSession(session);
          setError(null);
          
          if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            // CRITICAL FIX: Don't block on user data loading
            setLoading(false);
            
            // Load user data in background
            setTimeout(() => {
              if (mounted) {
                refreshUser();
              }
            }, 100);
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