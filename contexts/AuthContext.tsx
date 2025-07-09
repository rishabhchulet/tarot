import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, createTimeoutWrapper } from '@/utils/supabase';
import { getCurrentUser, type AuthUser } from '@/utils/auth';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  retryConnection: () => Promise<void>;
  testSignOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const [lastSuccessfulConnection, setLastSuccessfulConnection] = useState<Date | null>(null);

  // CRITICAL: Use ref instead of state to avoid closure issues in auth listener
  const isSigningOutRef = React.useRef(false);

  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      setConnectionStatus('connecting');
      
      // CRITICAL FIX: Use much longer timeout with progressive fallback
      const currentUser = await createTimeoutWrapper(
        () => getCurrentUser(),
        8000, // INCREASED: 8 second timeout
        null // Fallback to null
      );
      
      if (currentUser) {
        console.log('👤 User data refreshed:', { 
          id: currentUser.id, 
          name: currentUser.name, 
          archetype: currentUser.archetype 
        });
        setUser(currentUser);
        setError(null);
        setConnectionStatus('connected');
        setLastSuccessfulConnection(new Date());
        setRetryCount(0); // Reset retry count on success
        return;
      }
      
      // CRITICAL FIX: If getCurrentUser fails, try session fallback with longer timeout
      console.warn('⚠️ getCurrentUser failed, trying session fallback...');
      
      const sessionResult = await createTimeoutWrapper(
        () => supabase.auth.getUser(),
        3000, // INCREASED: 3 second timeout
        null
      );
      
      if (sessionResult?.data?.user) {
        const authUser = sessionResult.data.user;
        const fallbackUser: AuthUser = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || 'User',
          archetype: undefined // Will be loaded later if possible
        };
        
        console.log('✅ Using session fallback user data');
        setUser(fallbackUser);
        setError(null);
        setConnectionStatus('connected');
        setLastSuccessfulConnection(new Date());
        setRetryCount(0);
        
        // CRITICAL FIX: Try to load full profile data in background with longer timeout
        setTimeout(async () => {
          try {
            console.log('🔄 Background profile fetch...');
            const profileResult = await createTimeoutWrapper(
              () => supabase
                .from('users')
                .select('archetype, name')
                .eq('id', authUser.id)
                .single(),
              5000, // INCREASED: 5 second timeout
              null
            );
            
            if (profileResult?.data) {
              setUser(prev => prev ? {
                ...prev,
                name: profileResult.data.name || prev.name,
                archetype: profileResult.data.archetype || undefined
              } : null);
              console.log('✅ Background profile update successful');
            }
          } catch (bgError) {
            console.warn('⚠️ Background profile fetch failed:', bgError);
          }
        }, 1000); // Give more time before background fetch
      } else {
        console.log('ℹ️ No user data available');
        setUser(null);
        setConnectionStatus('disconnected');
      }
      
    } catch (error: any) {
      console.error('❌ Error refreshing user:', error);
      setConnectionStatus('error');
      setRetryCount(prev => prev + 1);
      
      // Enhanced error handling with user-friendly messages
      let userFriendlyError = 'Connection issue. Please check your internet connection.';
      
      if (error.message?.includes('timeout')) {
        userFriendlyError = 'Connection is slow. Please wait or try again.';
      } else if (error.message?.includes('network')) {
        userFriendlyError = 'Network error. Please check your internet connection.';
      } else if (error.message?.includes('auth')) {
        userFriendlyError = 'Authentication error. Please try signing in again.';
      }
      
      setError(userFriendlyError);
      
      // Only clear user if we don't have existing data
      if (!user) {
        setUser(null);
      }
    }
  };

  const retryConnection = async () => {
    console.log('🔄 Manual connection retry triggered...');
    setError(null);
    setConnectionStatus('connecting');
    await refreshUser();
  };

  // Move the original signOut logic to a private function
  const _doSignOut = async () => {
    try {
      console.log('[AuthContext signOut] Context sign out called');
      let test = 1 + 1;
      console.log('[AuthContext signOut] Test log after first line');
      console.log('[AuthContext signOut] Before isSigningOutRef.current = true');
      isSigningOutRef.current = true;
      console.log('[AuthContext signOut] After isSigningOutRef.current = true');
      console.log('[AuthContext signOut] Before starting sign out process log');
      console.log('🚪 [signOut] Starting sign out process...');

      // Step 1: Attempt Supabase sign out (global, then fallback)
      let signOutSuccess = false;
      let lastError = null;
      try {
        console.log('📤 [signOut] Signing out from Supabase (global)...');
        const { error: globalError } = await supabase.auth.signOut({ scope: 'global' });
        if (globalError) {
          console.warn('⚠️ [signOut] Global sign out error:', globalError);
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.warn('⚠️ [signOut] Regular sign out error:', error);
            lastError = error;
          } else {
            signOutSuccess = true;
          }
        } else {
          signOutSuccess = true;
        }
      } catch (err) {
        console.error('❌ [signOut] Exception during Supabase sign out:', err);
        lastError = err;
      }

      // Step 2: Manually clear all storage
      try {
        console.log('🧹 [signOut] Manually clearing storage...');
        if (typeof window !== 'undefined' && window.localStorage) {
          const keys = Object.keys(localStorage);
          const supabaseKeys = keys.filter(key => 
            key.includes('supabase') || 
            key.includes('sb-') || 
            key.includes('auth-token')
          );
          supabaseKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log('🗑️ [signOut] Removed localStorage key:', key);
          });
          try {
            sessionStorage.clear();
            console.log('��️ [signOut] Cleared session storage');
          } catch (e) {
            console.warn('⚠️ [signOut] Session storage clear error:', e);
          }
        }
      } catch (storageError) {
        console.warn('⚠️ [signOut] Storage clearing error:', storageError);
      }

      // Step 3: Clear local state
      setUser(null);
      setSession(null);
      setError(null);
      setConnectionStatus('disconnected');
      setLastSuccessfulConnection(null);
      setRetryCount(0);

      // Step 4: Navigation
      if (signOutSuccess) {
        console.log('📱 [signOut] Navigating to /auth (success)...');
        router.replace('/auth');
      } else {
        console.error('❌ [signOut] Sign out failed, not navigating.');
        if (typeof window !== 'undefined' && window.alert) {
          window.alert('Sign out failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('❌ [signOut] Unexpected error during sign out:', error);
      setUser(null);
      setSession(null);
      setError(null);
      setConnectionStatus('disconnected');
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Sign out failed due to an unexpected error.');
      }
    } finally {
      setTimeout(() => {
        console.log('🔓 [signOut] Resetting sign out flag after delay');
        isSigningOutRef.current = false;
      }, 3000);
    }
  };

  const signOut = async () => {
    console.log('[AuthContext signOut] testSignOut logic called');
    const beforeState = {
      hasUser: !!user,
      hasSession: !!session,
      userId: user?.id
    };
    console.log('[AuthContext signOut] State before sign out:', beforeState);
    await _doSignOut();
  };

  const contextValue = {
    user,
    session,
    loading,
    error,
    signOut,
    refreshUser,
    connectionStatus,
    retryConnection,
    testSignOut: signOut
  };

  useEffect(() => {
    console.log('🚀 AuthContext initializing...');
    setConnectionStatus('connecting');
    
    let mounted = true;
    let initializationTimeout: NodeJS.Timeout;
    
    // CRITICAL FIX: Much longer timeout for better reliability
    initializationTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth initialization timeout (10s) - proceeding');
        setLoading(false);
        setError(null);
        setConnectionStatus('error');
      }
    }, 10000); // INCREASED: 10 seconds for initialization
    
    // Get initial session with reasonable timeout
    const initializeAuth = async () => {
      try {
        console.log('🔍 Getting initial session...');
        
        // CRITICAL FIX: Use longer timeout for session check
        const sessionResult = await createTimeoutWrapper(
          () => supabase.auth.getSession(),
          6000, // INCREASED: 6 second timeout
          { data: { session: null }, error: null } // Fallback to no session
        );
        
        const { data: { session }, error } = sessionResult;
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
          if (mounted) {
            setSession(null);
            setError(null);
            setConnectionStatus('error');
            setLoading(false);
          }
          return;
        }
        
        console.log('📱 Initial session check:', { hasSession: !!session });
        
        if (mounted) {
          setSession(session);
          setLoading(false); // Set loading false after session check
          setError(null);
          setConnectionStatus(session ? 'connected' : 'disconnected');
          if (session) {
            setLastSuccessfulConnection(new Date());
          }
          
          if (session) {
            console.log('👤 Session found, loading user profile in background...');
            // Load user data in background with longer timeout
            setTimeout(() => {
              if (mounted) {
                refreshUser();
              }
            }, 500); // Give more time before profile fetch
          }
        }
      } catch (error: any) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setSession(null);
          setError(null);
          setConnectionStatus('error');
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
        // CRITICAL: Immediately ignore events during sign out process
        if (isSigningOutRef.current) {
          console.log('🚫 IGNORING auth state change during sign out:', { event, isSigningOut: isSigningOutRef.current });
          // Don't proceed with any state updates while signing out
          return;
        }
        
        if (!mounted) return;
        
        try {
          console.log('🔔 Auth state changed:', { event, hasSession: !!session });
          
          if (event === 'SIGNED_OUT') {
            console.log('👋 Explicit SIGNED_OUT event, clearing all state...');
            setSession(null);
            setUser(null);
            setError(null);
            setLoading(false);
            setConnectionStatus('disconnected');
            return;
          }
          
          setSession(session);
          setError(null);
          setLoading(false); // Always set loading false on auth state change
          setConnectionStatus(session ? 'connected' : 'disconnected');
          
          if (session) {
            setLastSuccessfulConnection(new Date());
            setRetryCount(0);
          }
          
          if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            // Do not load user data if we're signing out
            if (!isSigningOutRef.current) {
              console.log('🔄 Loading user data for session...');
              // Load user data in background without blocking
              setTimeout(() => {
                if (mounted) {
                  refreshUser().catch(error => {
                    console.warn('⚠️ Background user refresh failed:', error);
                  });
                }
              }, 500); // Give more time before profile fetch
            } else {
              console.log('🚫 Skipping user data load during sign out');
            }
            setUser(null);
          }
        } catch (error) {
          console.error('❌ Error handling auth state change:', error);
          setConnectionStatus('error');
          setError('Connection issue during authentication.');
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
  }, []); // Remove isSigningOut dependency to prevent re-creation

  // Auto-retry mechanism for connection errors
  useEffect(() => {
    if (connectionStatus === 'error' && retryCount < 3 && !loading) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
      console.log(`🔄 Auto-retry in ${retryDelay}ms (attempt ${retryCount + 1}/3)...`);
      
      const retryTimer = setTimeout(() => {
        if (connectionStatus === 'error') {
          console.log('🔄 Executing auto-retry...');
          refreshUser();
        }
      }, retryDelay);
      
      return () => clearTimeout(retryTimer);
    }
  }, [connectionStatus, retryCount, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.error('[useAuth] AuthContext is undefined! Make sure your app is wrapped in <AuthProvider>.');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}