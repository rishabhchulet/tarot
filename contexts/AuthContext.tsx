import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, createTimeoutWrapper } from '@/utils/supabase';
import { getCurrentUser, type AuthUser } from '@/utils/auth';
import { Platform } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';
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

  // Use ref to track sign out state and prevent race conditions
  const isSigningOutRef = React.useRef(false);
  // Add a ref to track token refresh attempts
  const tokenRefreshAttemptRef = React.useRef(0);
  // Add a ref to track the last auth check time
  const lastAuthCheckRef = React.useRef<Date | null>(null);

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
          focusArea: currentUser.focusArea 
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
          focusArea: undefined // Will be loaded later if possible
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
                .select('focus_area, name')
                .eq('id', authUser.id)
                .single(),
              5000, // INCREASED: 5 second timeout
              null
            );
            
            if (profileResult?.data) {
              setUser(prev => prev ? {
                ...prev,
                name: profileResult.data.name || prev.name,
                focusArea: profileResult.data.focus_area || undefined
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

  // ... existing code ...
  const signOut = async () => {
    try {
      console.log('🚪 Starting sign out process from AuthContext...');
      
      // Set signing out flag immediately to prevent race conditions
      isSigningOutRef.current = true;
      
      // Clear local state first for immediate UI feedback
      setUser(null);
      setSession(null);
      setError(null);
      setConnectionStatus('disconnected');
      
      console.log('🧹 Local state cleared, proceeding with Supabase sign out...');

      // Clear storage first for immediate effect
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          console.log('🧹 Clearing all auth storage...');
          const keys = Object.keys(localStorage);
          const authKeys = keys.filter(key => 
            key.includes('supabase') || 
            key.includes('sb-') || 
            key.includes('auth') ||
            key.includes('token')
          );
          
          authKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ Removed: ${key}`);
          });
          
          // Also clear session storage
          try { 
            sessionStorage.clear(); 
            console.log('🧹 Cleared session storage');
          } catch (e) { 
            console.warn('⚠️ Session storage clear error:', e);
          }
        }
      } catch (storageError) {
        console.warn('⚠️ Storage clearing error:', storageError);
      }

      // Try global sign out first (all devices)
      try {
        console.log('🔑 Attempting global sign out...');
        const { error } = await createTimeoutWrapper(
          () => supabase.auth.signOut({ scope: 'global' }),
          5000, // 5 second timeout
          { error: null } // Fallback to success
        );
        
        if (error) {
          console.warn('⚠️ Global sign out error:', error);
        } else {
          console.log('✅ Global sign out successful');
        }
      } catch (error) {
        console.warn('⚠️ Global sign out error:', error);
      }
      
      // Also try regular sign out as fallback
      try {
        console.log('🔑 Attempting regular sign out...');
        await createTimeoutWrapper(
          () => supabase.auth.signOut(),
          3000, // 3 second timeout
          { error: null } // Fallback to success
        );
      } catch (error) {
        console.warn('⚠️ Regular sign out error:', error);
      }

      // Force navigation to auth screen
      console.log('📱 Forcing navigation to auth screen...');
      try {
        router.replace('/auth');
      } catch (navError) {
        console.error('❌ Navigation error:', navError);
        
        // Web fallback - force page reload
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
      }
      
      console.log('✅ Sign out process completed');
      return;
    } catch (error) {
      console.error('❌ Unexpected error during sign out:', error);
      
      // Still try to navigate away
      try {
        router.replace('/auth');
      } catch (navError) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = '/auth';
        }
      }
    } finally {
      // Reset the signing out flag after a delay
      setTimeout(() => {
        isSigningOutRef.current = false;
        console.log('🔓 Reset signing out flag');
      }, 3000);
    }
  };
     
  useEffect(() => {
    console.log('🚀 AuthContext initializing...');
    setConnectionStatus('connecting');

    let mounted = true;
    let initializationTimeout: NodeJS.Timeout;

    // Set timeout for initialization
    initializationTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth initialization timeout (10s) - proceeding');
        setLoading(false);
        setError('Connection timeout. Please try again later.');
        setConnectionStatus('error');
      }
    }, 10000);

    const initializeAuth = async () => {
      try {
        console.log('🔍 Getting initial session...');
        
        // Use timeout wrapper for session check
        const sessionResult = await createTimeoutWrapper(
          () => supabase.auth.getSession(),
          6000, // 6 second timeout
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
        // Record the time of this auth check
        lastAuthCheckRef.current = new Date();
        
        // CRITICAL: Immediately ignore events during sign out process
        if (isSigningOutRef.current) {
          console.log('🚫 IGNORING auth state change during sign out:', { event, isSigningOut: isSigningOutRef.current });
          // Don't proceed with any state updates while signing out
          return; 
        }

        if (!mounted) return;

        try {
          console.log('🔔 Auth state changed:', { event, hasSession: !!session, timestamp: new Date().toISOString() });
          
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
            
            // Reset token refresh counter on successful auth
            tokenRefreshAttemptRef.current = 0;
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
              setUser(null); // Ensure user is cleared during sign out
            } 
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
    
    // Add a session refresh check interval to prevent unexpected sign-outs
    const sessionRefreshInterval = setInterval(async () => {
      // Skip if we're signing out or no session exists
      if (isSigningOutRef.current || !session) return;
      
      // Check if we haven't had an auth check in the last 5 minutes
      const now = new Date();
      const lastCheck = lastAuthCheckRef.current;
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      if (!lastCheck || lastCheck < fiveMinutesAgo) {
        console.log('🔄 Performing session refresh check...');
        tokenRefreshAttemptRef.current += 1;
        
        try {
          // This will trigger a token refresh if needed
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log('✅ Session refresh successful');
            lastAuthCheckRef.current = new Date();
          } else if (tokenRefreshAttemptRef.current > 3) {
            console.warn('⚠️ Multiple session refresh attempts failed');
          }
        } catch (error) {
          console.warn('⚠️ Session refresh check error:', error);
        }
      }
    }, 60000); // Check every minute

    return () => {
      mounted = false;
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
      subscription.unsubscribe(); 
      clearInterval(sessionRefreshInterval);
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

  const testSignOut = async () => {
    console.log('🧪 Test sign out triggered');
    await signOut();
  };

  const contextValue: AuthContextType = {
    // Define all the values to be provided by the context
    user,
    session,
    loading,
    error,
    signOut,
    refreshUser,
    connectionStatus,
    retryConnection,
    testSignOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}