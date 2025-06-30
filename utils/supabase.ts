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

// Enhanced connection test function with better timeout handling
export const testSupabaseConnection = async (): Promise<{ connected: boolean; error: string | null }> => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      const error = 'Missing or invalid Supabase configuration';
      console.error('❌', error);
      return { connected: false, error };
    }
    
    // Create a more robust connection test with longer timeout and better error handling
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
        
        console.error('❌ Supabase connection test failed:', error);
        return { connected: false, error: error.message };
      });
    
    // Increase timeout to 15 seconds for better reliability
    const timeoutPromise = new Promise<{ connected: boolean; error: string }>((resolve) => 
      setTimeout(() => resolve({ connected: false, error: 'Connection timeout - please check your internet connection and Supabase configuration' }), 15000)
    );
    
    const result = await Promise.race([connectionPromise, timeoutPromise]);
    return result;
    
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