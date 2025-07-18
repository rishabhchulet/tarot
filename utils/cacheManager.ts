/**
 * Cache Management Utility
 * Handles clearing various types of cache for users, especially iOS issues
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';

export interface CacheClearResult {
  success: boolean;
  clearedItems: string[];
  errors: string[];
}

/**
 * Clear all user cache data
 */
export const clearAllUserCache = async (): Promise<CacheClearResult> => {
  const result: CacheClearResult = {
    success: true,
    clearedItems: [],
    errors: []
  };

  console.log('🧹 Starting comprehensive cache clear...');

  // 1. Clear AsyncStorage
  try {
    const keys = await AsyncStorage.getAllKeys();
    if (keys.length > 0) {
      await AsyncStorage.multiRemove(keys);
      result.clearedItems.push(`AsyncStorage (${keys.length} items)`);
      console.log(`✅ Cleared ${keys.length} AsyncStorage items`);
    }
  } catch (error: any) {
    result.errors.push(`AsyncStorage: ${error.message}`);
    result.success = false;
  }

  // 2. Clear SecureStore (iOS specific)
  if (Platform.OS === 'ios') {
    try {
      // Common SecureStore keys used in the app
      const secureStoreKeys = [
        'supabase.auth.token',
        'sb-access-token',
        'sb-refresh-token',
        'user-session',
        'auth-token',
        'notification-token'
      ];

      for (const key of secureStoreKeys) {
        try {
          await SecureStore.deleteItemAsync(key);
          result.clearedItems.push(`SecureStore: ${key}`);
        } catch (error) {
          // Key might not exist, continue
        }
      }
      console.log('✅ Cleared iOS SecureStore items');
    } catch (error: any) {
      result.errors.push(`SecureStore: ${error.message}`);
    }
  }

  // 3. Clear web localStorage (if web)
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      const keys = Object.keys(localStorage);
      const supabaseKeys = keys.filter(key => 
        key.includes('supabase') || 
        key.includes('sb-') || 
        key.includes('auth') ||
        key.includes('notification') ||
        key.includes('ambient')
      );
      
      supabaseKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      result.clearedItems.push(`Web localStorage (${supabaseKeys.length} items)`);
      console.log(`✅ Cleared ${supabaseKeys.length} web localStorage items`);
    } catch (error: any) {
      result.errors.push(`Web localStorage: ${error.message}`);
    }
  }

  // 4. Clear Supabase client cache
  try {
    // Force sign out to clear auth cache
    await supabase.auth.signOut({ scope: 'global' });
    result.clearedItems.push('Supabase auth cache');
    console.log('✅ Cleared Supabase auth cache');
  } catch (error: any) {
    result.errors.push(`Supabase auth: ${error.message}`);
  }

  // 5. Clear notification cache
  try {
    if (Platform.OS !== 'web') {
      await AsyncStorage.removeItem('cached_notification_messages');
      await AsyncStorage.removeItem('last_notification_update');
      await AsyncStorage.removeItem('notification_preferences');
      result.clearedItems.push('Notification cache');
      console.log('✅ Cleared notification cache');
    }
  } catch (error: any) {
    result.errors.push(`Notification cache: ${error.message}`);
  }

  // 6. Clear ambient sound cache
  try {
    await AsyncStorage.removeItem('ambientSoundSettings');
    result.clearedItems.push('Ambient sound cache');
    console.log('✅ Cleared ambient sound cache');
  } catch (error: any) {
    result.errors.push(`Ambient sound cache: ${error.message}`);
  }

  console.log('🧹 Cache clear completed:', result);
  return result;
};

/**
 * Clear specific cache types
 */
export const clearSpecificCache = async (cacheTypes: string[]): Promise<CacheClearResult> => {
  const result: CacheClearResult = {
    success: true,
    clearedItems: [],
    errors: []
  };

  for (const cacheType of cacheTypes) {
    try {
      switch (cacheType) {
        case 'auth':
          await supabase.auth.signOut({ scope: 'global' });
          if (Platform.OS === 'ios') {
            await SecureStore.deleteItemAsync('supabase.auth.token');
          }
          result.clearedItems.push('Auth cache');
          break;

        case 'notifications':
          await AsyncStorage.removeItem('cached_notification_messages');
          await AsyncStorage.removeItem('last_notification_update');
          result.clearedItems.push('Notification cache');
          break;

        case 'sounds':
          await AsyncStorage.removeItem('ambientSoundSettings');
          result.clearedItems.push('Sound cache');
          break;

        case 'journal':
          // Don't clear actual journal data, just cache
          await AsyncStorage.removeItem('journal_cache');
          result.clearedItems.push('Journal cache');
          break;

        default:
          result.errors.push(`Unknown cache type: ${cacheType}`);
      }
    } catch (error: any) {
      result.errors.push(`${cacheType}: ${error.message}`);
      result.success = false;
    }
  }

  return result;
};

/**
 * Force app restart (iOS specific)
 */
export const forceAppRestart = async (): Promise<void> => {
  if (Platform.OS === 'ios') {
    // Clear all cache first
    await clearAllUserCache();
    
    // On iOS, we can't programmatically restart the app
    // But we can clear everything and navigate to a fresh state
    console.log('🔄 iOS app state reset - user should restart app manually');
  }
};

/**
 * Check cache size and health
 */
export const getCacheInfo = async (): Promise<{
  asyncStorageKeys: number;
  secureStoreItems: number;
  webStorageItems: number;
  totalEstimatedSize: string;
}> => {
  let asyncStorageKeys = 0;
  let secureStoreItems = 0;
  let webStorageItems = 0;

  try {
    const keys = await AsyncStorage.getAllKeys();
    asyncStorageKeys = keys.length;
  } catch (error) {
    // Ignore
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      webStorageItems = Object.keys(localStorage).length;
    } catch (error) {
      // Ignore
    }
  }

  // SecureStore doesn't have a way to list all keys, so we estimate
  if (Platform.OS === 'ios') {
    secureStoreItems = 5; // Estimated common items
  }

  return {
    asyncStorageKeys,
    secureStoreItems,
    webStorageItems,
    totalEstimatedSize: `~${(asyncStorageKeys + secureStoreItems + webStorageItems) * 0.5}KB`
  };
};