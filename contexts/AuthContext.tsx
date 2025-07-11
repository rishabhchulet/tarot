import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, createTimeoutWrapper } from '@/utils/supabase';
import { getCurrentUser, type AuthUser } from '@/utils/auth';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { AstrologicalPlacements, getAstrologicalPlacements } from '@/utils/astrology';

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
  updateUser: (updates: Partial<AuthUser>) => void;
  placements: AstrologicalPlacements | null;
  calculatePlacements: () => void;
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
  const [placements, setPlacements] = useState<AstrologicalPlacements | null>(null);

  // CRITICAL: Use ref instead of state to avoid closure issues in auth listener
  const isSigningOutRef = React.useRef(false);

  const calculatePlacements = async (userForPlacements: AuthUser | null = user) => {
    if (userForPlacements && userForPlacements.birthDate && userForPlacements.birthTime && userForPlacements.birthLocation) {
      try {
        console.log('🔭 Calculating astrological placements for:', userForPlacements.name);
        const date = new Date(userForPlacements.birthDate);
        const time = userForPlacements.birthTime.split(':');
        const placementsResult = await getAstrologicalPlacements(
          userForPlacements.name,
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate(),
          parseInt(time[0]),
          parseInt(time[1]),
          userForPlacements.birthLocation,
          userForPlacements.latitude, // Pass coordinates
          userForPlacements.longitude
        );
        console.log('✅ Placements calculated successfully');
        setPlacements(placementsResult);
      } catch (error) {
        console.error('❌ Error calculating placements:', error);
        setPlacements(null); // Ensure placements are cleared on error
      }
    } else {
      console.log('ℹ️ Insufficient data to calculate placements.');
      setPlacements(null); // Clear placements if data is missing
    }
  };

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
        // CRITICAL FIX: Calculate placements immediately after user data is loaded
        if (currentUser.birthDate && currentUser.birthLocation && currentUser.birthTime) {
          console.log('✨ User has birth data, calculating placements...');
          calculatePlacements(currentUser); // Pass user to avoid state delay
        }
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
        setPlacements(null);
      }
    }
  };

  const retryConnection = async () => {
    console.log('🔄 Manual connection retry triggered...');
    setError(null);
    setConnectionStatus('connecting');
    await refreshUser();
  };

  const signOut = async () => {
    try {
      console.log('🚪 [signOut] Starting robust sign out process...');
      isSigningOutRef.current = true;
      
      let signOutSuccess = false;
      try {
        const { error: globalError } = await supabase.auth.signOut({ scope: 'global' });
        if (globalError) {
          console.warn('⚠️ [signOut] Global sign out failed, trying local. Error:', globalError.message);
          const { error: localError } = await supabase.auth.signOut();
          if (localError) {
            console.error('❌ [signOut] Local sign out also failed. Error:', localError.message);
          } else {
            signOutSuccess = true;
          }
        } else {
          signOutSuccess = true;
        }
      } catch (err) {
        console.error('💥 [signOut] Exception during Supabase sign out:', err);
      }
      
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
            console.log('🧹 [signOut] Clearing web storage...');
            const keys = Object.keys(localStorage);
            const supabaseKeys = keys.filter(key => key.startsWith('sb-'));
            supabaseKeys.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed localStorage key: ${key}`);
            });
        }
      } catch (storageError) {
          console.warn('⚠️ [signOut] Could not clear web storage:', storageError)
      }

      setUser(null);
      setSession(null);
      setError(null);
      setConnectionStatus('disconnected');
      setLastSuccessfulConnection(null);
      setRetryCount(0);
      setPlacements(null);

      console.log('📱 [signOut] Navigating to /auth...');
      router.replace('/auth');

    } catch (error) {
      console.error('💥 [signOut] Unexpected error during sign out:', error);
    } finally {
        // Delay resetting the flag to prevent race conditions on navigation
        setTimeout(() => {
            isSigningOutRef.current = false;
        }, 1500);
    }
  };

  const testSignOut = async () => {
    console.log('🚪 [testSignOut] Starting test sign out...');
    await signOut();
    console.log('🚪 [testSignOut] Test sign out complete.');
  };

  // Auth state change listener
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

  useEffect(() => {
    if (user && !placements) {
      calculatePlacements();
    }
  }, [user]);

  const contextValue = {
    user,
    session,
    loading,
    error,
    signOut,
    refreshUser,
    connectionStatus,
    retryConnection,
    testSignOut: signOut,
    updateUser: (updates: Partial<AuthUser>) => {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    },
    placements,
    calculatePlacements,
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
    console.error('[useAuth] AuthContext is undefined! Make sure your app is wrapped in <AuthProvider>.');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}