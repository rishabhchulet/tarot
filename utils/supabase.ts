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
  throw new Error('Missing required Supabase environment variables. Please check your .env file.');
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

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'daily-tarot-reflection',
      },
    },
  }
);

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