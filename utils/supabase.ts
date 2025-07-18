// CRITICAL FIX: Apply structuredClone polyfill DIRECTLY before any Supabase imports
// This ensures it's available before Supabase tries to use it
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = function structuredClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map((item) => structuredClone(item));
    if (typeof obj === 'object') {
      const cloned: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          cloned[key] = structuredClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  };
  console.log('✅ structuredClone polyfill applied for React Native compatibility');
}

import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Check if environment variables are available
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration Check:');
console.log('URL:', supabaseUrl ? `Set (${supabaseUrl.substring(0, 30)}...)` : 'Missing');
console.log('Anon Key:', supabaseAnonKey ? `Set (${supabaseAnonKey.length} chars)` : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure these are set in your .env file:');
  console.log('EXPO_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  throw new Error(
    'Missing Supabase environment variables. Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Custom storage adapter for Expo SecureStore with better error handling and size optimization
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    try {
      if (Platform.OS === 'web') {
        // Check if we're in a browser environment
        if (typeof window !== 'undefined' && window.localStorage) {
          return localStorage.getItem(key);
        }
        // Return null if localStorage is not available (e.g., server-side rendering)
        return null;
      }
      return SecureStore.getItemAsync(key);
    } catch (error) {
      console.warn('Storage getItem error:', error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        // Check if we're in a browser environment
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(key, value);
        }
        // Do nothing if localStorage is not available
      } else {
        // Check value size before storing in SecureStore
        if (value.length > 2048) {
          console.warn('⚠️ Large value being stored in SecureStore, consider optimization');
          // For large values, we could implement chunking or use a different storage method
          // For now, we'll still store it but warn the user
        }
        SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.warn('Storage setItem error:', error);
    }
  },
  removeItem: (key: string) => {
    try {
      if (Platform.OS === 'web') {
        // Check if we're in a browser environment
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(key);
        }
        // Do nothing if localStorage is not available
      } else {
        SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.warn('Storage removeItem error:', error);
    }
  },
};

// CRITICAL FIX: Create Supabase client with optimized longer timeouts
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey, 
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true, // Keep this true for normal operation
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': 'daily-tarot-reflection',
      },
      // CRITICAL FIX: Increase timeout to 20 seconds for all requests
      fetch: (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // INCREASED: 20 second timeout
        
        return fetch(url, {
          ...options,
          signal: controller.signal,
        }).finally(() => {
          clearTimeout(timeoutId);
        });
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// CRITICAL FIX: Create a wrapper for database operations with optimized longer timeouts
export const createTimeoutWrapper = <T>(
  operation: () => Promise<T>,
  timeoutMs: number = 12000, // INCREASED: default to 12 seconds
  fallbackValue?: T
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (fallbackValue !== undefined) {
        console.warn(`⚠️ Operation timeout (${timeoutMs}ms), using fallback`);
        resolve(fallbackValue);
      } else {
        reject(new Error(`Operation timeout after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    operation()
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        if (fallbackValue !== undefined) {
          console.warn(`⚠️ Operation failed, using fallback:`, error);
          resolve(fallbackValue);
        } else {
          reject(error);
        }
      });
  });
};

// CRITICAL FIX: Simplified connection test function
export const testSupabaseConnection = async (): Promise<{ connected: boolean; error: string | null }> => {
  try {
    console.log('🔍 Testing Supabase connection...');

    // CRITICAL: Add function to forcibly clear auth storage
    if (typeof window !== 'undefined') {
      (window as any).clearSupabaseAuth = () => {
        try {
          const keys = Object.keys(localStorage);
          const supabaseKeys = keys.filter(key => 
            key.includes('supabase') || 
            key.includes('sb-') || 
            key.includes('auth')
          );
          
          console.log('🧹 Manual auth cleanup - keys to remove:', supabaseKeys);
          
          supabaseKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log('🗑️ Removed:', key);
          });
          
          return `Cleared ${supabaseKeys.length} auth keys`;
        } catch (e) {
          console.error('❌ Error clearing auth:', e);
          return `Error: ${e}`;
        }
      };
      
      console.log('🔧 Registered clearSupabaseAuth() in window for manual cleanup');
    }

    // CRITICAL: Add function to forcibly clear auth storage
    if (typeof window !== 'undefined') {
      (window as any).clearSupabaseAuth = () => {
        try {
          const keys = Object.keys(localStorage);
          const supabaseKeys = keys.filter(key => 
            key.includes('supabase') || 
            key.includes('sb-') || 
            key.includes('auth')
          );
          
          console.log('🧹 Manual auth cleanup - keys to remove:', supabaseKeys);
          
          supabaseKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log('🗑️ Removed:', key);
          });
          
          return `Cleared ${supabaseKeys.length} auth keys`;
        } catch (e) {
          console.error('❌ Error clearing auth:', e);
          return `Error: ${e}`;
        }
      };
      
      console.log('🔧 Registered clearSupabaseAuth() in window for manual cleanup');
    }
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      const error = 'Missing or invalid Supabase configuration';
      console.error('❌', error);
      return { connected: false, error };
    }
    
    // CRITICAL FIX: Use a very simple health check with 5 second timeout
    const result = await createTimeoutWrapper(
      async () => {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        // Any response (even 404) means we can connect to Supabase
        if (response.status < 500) {
          return true;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      },
      5000, // 5 second timeout
      false // No fallback, we want to know if it fails
    );
    
    if (result) {
      console.log('✅ Supabase connection test successful');
      return { connected: true, error: null };
    } else {
      throw new Error('Connection test failed');
    }
    
  } catch (error: any) {
    console.error('❌ Supabase connection test error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Connection failed';
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      errorMessage = 'Connection timeout';
    } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
      errorMessage = 'Network error - check your internet connection';
    } else if (error.message?.includes('CORS')) {
      errorMessage = 'CORS error - check Supabase configuration';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { connected: false, error: errorMessage };
  }
};

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          archetype: string | null;
          birth_date: string | null;
          birth_time: string | null;
          birth_location: string | null;
          latitude: number | null;
          longitude: number | null;
          onboarding_step: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          archetype?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          onboarding_step?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          archetype?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          onboarding_step?: string | null;
          updated_at?: string;
        };
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          card_name: string;
          card_keywords: string[] | null;
          first_impressions: string;
          personal_meaning: string;
          reflection: string;
          voice_memo_path: string | null;
          created_at: string;
          updated_at: string;
          daily_question: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          card_name: string;
          card_keywords?: string[] | null;
          first_impressions: string;
          personal_meaning: string;
          reflection: string;
          voice_memo_path?: string | null;
          created_at?: string;
          updated_at?: string;
          daily_question?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          card_name?: string;
          card_keywords?: string[] | null;
          first_impressions?: string;
          personal_meaning?: string;
          reflection?: string;
          voice_memo_path?: string | null;
          updated_at?: string;
          daily_question?: string | null;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          subscription_type: string | null;
          trial_start_date: string;
          trial_end_date: string;
          has_active_subscription: boolean;
          subscription_start_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_type?: string | null;
          trial_start_date: string;
          trial_end_date: string;
          has_active_subscription?: boolean;
          subscription_start_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subscription_type?: string | null;
          trial_start_date?: string;
          trial_end_date?: string;
          has_active_subscription?: boolean;
          subscription_start_date?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}