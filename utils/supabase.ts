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
}

// Custom storage adapter for Expo SecureStore with better error handling
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

// Create Supabase client with improved configuration
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': 'daily-tarot-reflection',
      },
      fetch: (url, options = {}) => {
        // Add timeout to all requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
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

// Enhanced connection test function with better timeout handling and retry logic
export const testSupabaseConnection = async (): Promise<{ connected: boolean; error: string | null }> => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      const error = 'Missing or invalid Supabase configuration';
      console.error('❌', error);
      return { connected: false, error };
    }
    
    // Test with retry logic
    let lastError = '';
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Connection attempt ${attempt}/${maxRetries}...`);
        
        // Create a more robust connection test with shorter timeout per attempt
        const connectionPromise = supabase
          .from('users')
          .select('count')
          .limit(1)
          .then(result => {
            // Even if the query fails due to RLS, it means we can connect to Supabase
            console.log('✅ Supabase connection test successful');
            return { connected: true, error: null };
          })
          .catch(error => {
            // Check if it's a connection error vs an auth/RLS error
            if (error.message?.includes('JWT') || error.message?.includes('RLS') || error.message?.includes('policy')) {
              // These errors mean we connected successfully but hit auth/RLS restrictions
              console.log('✅ Supabase connection test successful (auth/RLS restriction is expected)');
              return { connected: true, error: null };
            }
            
            console.error(`❌ Supabase connection test failed (attempt ${attempt}):`, error);
            throw error;
          });
        
        // Shorter timeout per attempt (5 seconds)
        const timeoutPromise = new Promise<{ connected: boolean; error: string }>((resolve) => 
          setTimeout(() => resolve({ connected: false, error: `Connection timeout (attempt ${attempt})` }), 5000)
        );
        
        const result = await Promise.race([connectionPromise, timeoutPromise]);
        
        if (result.connected) {
          return result;
        }
        
        lastError = result.error;
        
        // Wait before retry (except on last attempt)
        if (attempt < maxRetries) {
          console.log(`⏳ Waiting before retry...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error: any) {
        lastError = error.message || 'Connection failed';
        console.error(`❌ Attempt ${attempt} failed:`, lastError);
        
        // Wait before retry (except on last attempt)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // All attempts failed
    console.error('❌ All connection attempts failed');
    return { 
      connected: false, 
      error: lastError || 'Connection failed after multiple attempts'
    };
    
  } catch (error: any) {
    console.error('❌ Supabase connection test error:', error);
    return { connected: false, error: error.message || 'Connection failed' };
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
          focus_area: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          focus_area?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          focus_area?: string | null;
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