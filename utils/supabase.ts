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

// Custom storage adapter for Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      SecureStore.deleteItemAsync(key);
    }
  },
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
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