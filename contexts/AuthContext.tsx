import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { getCurrentUser, type AuthUser } from '@/utils/auth';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      setUser(null);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Starting sign out process...');
      
      // Clear local state first
      setUser(null);
      setSession(null);
      
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
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 Initial session check:', { hasSession: !!session });
      setSession(session);
      if (session) {
        refreshUser();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', { event, hasSession: !!session });
        setSession(session);
        
        if (session) {
          await refreshUser();
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshUser }}>
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