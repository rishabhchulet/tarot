import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { hasDrawnCardToday } from './database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Types for notification system
interface NotificationTemplate {
  id: string;
  category: 'daily' | 'seasonal' | 'special' | 'milestone';
  title: string;
  body: string;
  emoji: string;
  active: boolean;
  priority: number;
  start_date?: string;
  end_date?: string;
  target_audience: string;
  ab_test_group?: string;
}

interface NotificationPreferences {
  enabled: boolean;
  preferredTime: string;
  messageStyle: 'mystical' | 'gentle' | 'motivational';
  weekendsEnabled: boolean;
  timezone: string;
  lastNotificationUpdate?: string;
}

// Local fallback messages (always available offline)
const LOCAL_FALLBACK_MESSAGES: NotificationTemplate[] = [
  {
    id: 'local-1',
    category: 'daily',
    title: '✨ Your inner wisdom awaits',
    body: 'Take a moment to connect with your intuition through the cards.',
    emoji: '✨',
    active: true,
    priority: 1,
    target_audience: 'all'
  },
  {
    id: 'local-2', 
    category: 'daily',
    title: '🌙 Listen to your soul',
    body: 'Your daily reflection is ready. What guidance will you receive?',
    emoji: '🌙',
    active: true,
    priority: 1,
    target_audience: 'all'
  },
  {
    id: 'local-3',
    category: 'daily', 
    title: '🔮 Ancient wisdom calls',
    body: 'The cards hold messages from your highest self. Draw and discover.',
    emoji: '🔮',
    active: true,
    priority: 1,
    target_audience: 'all'
  },
  {
    id: 'local-4',
    category: 'daily',
    title: '💫 Your spiritual practice',
    body: 'Consistency creates magic. Continue your journey of inner discovery.',
    emoji: '💫',
    active: true,
    priority: 1,
    target_audience: 'all'
  },
  {
    id: 'local-5',
    category: 'daily',
    title: '🌸 A moment of peace',
    body: 'In the midst of life\'s chaos, find stillness with your cards.',
    emoji: '🌸',
    active: true,
    priority: 1,
    target_audience: 'all'
  }
];

// Storage keys
const STORAGE_KEYS = {
  CACHED_MESSAGES: 'cached_notification_messages',
  LAST_UPDATE: 'last_notification_update',
  USER_PREFERENCES: 'notification_preferences'
};

export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === 'web') {
    return null; // Web doesn't support push notifications in this context
  }

  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }
  
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);

  return token;
};

// Fetch notification templates from remote server
export const fetchRemoteNotificationTemplates = async (): Promise<NotificationTemplate[]> => {
  try {
    console.log('🌐 Fetching remote notification templates...');
    
    const { data, error } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('❌ Error fetching remote templates:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ No remote templates found, using fallback');
      return LOCAL_FALLBACK_MESSAGES;
    }

    console.log(`✅ Fetched ${data.length} remote notification templates`);
    
    // Cache the remote messages locally
    await AsyncStorage.setItem(STORAGE_KEYS.CACHED_MESSAGES, JSON.stringify(data));
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_UPDATE, new Date().toISOString());
    
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch remote templates:', error);
    return await getCachedNotificationTemplates();
  }
};

// Get cached notification templates with fallback
export const getCachedNotificationTemplates = async (): Promise<NotificationTemplate[]> => {
  try {
    const cachedData = await AsyncStorage.getItem(STORAGE_KEYS.CACHED_MESSAGES);
    
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      console.log(`📱 Using ${parsed.length} cached notification templates`);
      return parsed;
    }
  } catch (error) {
    console.error('❌ Error reading cached templates:', error);
  }
  
  console.log('🔄 Using local fallback messages');
  return LOCAL_FALLBACK_MESSAGES;
};

// Get appropriate messages based on category and date
export const getNotificationMessages = async (category: string = 'daily'): Promise<NotificationTemplate[]> => {
  try {
    // Try remote first, then cached, then fallback
    let templates = await fetchRemoteNotificationTemplates();
    
    // Filter by category
    templates = templates.filter(template => template.category === category);
    
    // Filter by date range if applicable
    const today = new Date();
    templates = templates.filter(template => {
      if (template.start_date && new Date(template.start_date) > today) return false;
      if (template.end_date && new Date(template.end_date) < today) return false;
      return true;
    });
    
    // If no templates match, use fallback
    if (templates.length === 0) {
      console.log('⚠️ No matching templates, using fallback');
      return LOCAL_FALLBACK_MESSAGES.filter(t => t.category === category);
    }
    
    return templates;
  } catch (error) {
    console.error('❌ Error getting notification messages:', error);
    return LOCAL_FALLBACK_MESSAGES.filter(t => t.category === category);
  }
};

// Get a random message from available templates
export const getRandomNotificationMessage = async (category: string = 'daily'): Promise<NotificationTemplate> => {
  const messages = await getNotificationMessages(category);
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

// Get user notification preferences
export const getUserNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    // Try to get from user profile first
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('notification_preferences')
        .eq('id', user.id)
        .single();
      
      if (profile?.notification_preferences) {
        return profile.notification_preferences as NotificationPreferences;
      }
    }
    
    // Fallback to local storage
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('❌ Error getting user preferences:', error);
  }
  
  // Default preferences
  return {
    enabled: true,
    preferredTime: '09:00',
    messageStyle: 'mystical',
    weekendsEnabled: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  };
};

// Update user notification preferences
export const updateUserNotificationPreferences = async (preferences: Partial<NotificationPreferences>) => {
  try {
    const currentPrefs = await getUserNotificationPreferences();
    const updatedPrefs = { ...currentPrefs, ...preferences };
    
    // Update in database if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('users')
        .update({ notification_preferences: updatedPrefs })
        .eq('id', user.id);
      
      if (error) {
        console.error('❌ Error updating preferences in database:', error);
      } else {
        console.log('✅ Notification preferences updated in database');
      }
    }
    
    // Also store locally as backup
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPrefs));
    
    // Reschedule notifications with new preferences
    await scheduleSmartDailyNotifications();
    
    return updatedPrefs;
  } catch (error) {
    console.error('❌ Error updating notification preferences:', error);
    throw error;
  }
};

// Check if notifications need to be updated
export const shouldUpdateNotifications = async (): Promise<boolean> => {
  try {
    const lastUpdate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_UPDATE);
    
    if (!lastUpdate) return true;
    
    const lastUpdateDate = new Date(lastUpdate);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60);
    
    // Update if more than 6 hours have passed
    return hoursSinceUpdate > 6;
  } catch (error) {
    console.error('❌ Error checking update time:', error);
    return true;
  }
};

// Smart notification scheduling with remote updates
export const scheduleSmartDailyNotifications = async () => {
  if (Platform.OS === 'web') {
    console.log('⚠️ Notifications not supported on web');
    return;
  }

  try {
    console.log('🔔 Setting up smart daily notifications...');
    
    // Get user preferences
    const preferences = await getUserNotificationPreferences();
    
    if (!preferences.enabled) {
      console.log('🔕 Notifications disabled by user');
      await cancelAllNotifications();
      return;
    }
    
    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Parse preferred time
    const [hour, minute] = preferences.preferredTime.split(':').map(Number);
    
    // Get random message based on style preference
    const categoryMap = {
      'mystical': 'daily',
      'gentle': 'daily', 
      'motivational': 'daily'
    };
    
    const message = await getRandomNotificationMessage(categoryMap[preferences.messageStyle]);
    
    // Schedule notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${message.emoji} ${message.title}`,
        body: message.body,
        sound: 'default',
        badge: 1,
        data: { 
          type: 'daily_card_reminder',
          messageId: message.id,
          category: message.category,
          timestamp: Date.now()
        },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
    
    console.log(`✅ Scheduled daily notification for ${hour}:${minute.toString().padStart(2, '0')}`);
    console.log(`📝 Message: "${message.title}" - "${message.body}"`);
    
    // Update last schedule time
    await AsyncStorage.setItem('last_notification_schedule', new Date().toISOString());
    
  } catch (error) {
    console.error('❌ Error scheduling smart notifications:', error);
    
    // Fallback to basic notification
    await scheduleBasicNotification();
  }
};

// Fallback basic notification (if smart scheduling fails)
const scheduleBasicNotification = async () => {
  try {
    const fallbackMessage = LOCAL_FALLBACK_MESSAGES[0];
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${fallbackMessage.emoji} ${fallbackMessage.title}`,
        body: fallbackMessage.body,
        sound: 'default',
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
    
    console.log('✅ Scheduled fallback notification for 9:00 AM');
  } catch (error) {
    console.error('❌ Error scheduling fallback notification:', error);
  }
};

// Update notifications with fresh content (call this when app becomes active)
export const updateNotificationsWithFreshContent = async () => {
  try {
    if (await shouldUpdateNotifications()) {
      console.log('🔄 Updating notifications with fresh content...');
      await scheduleSmartDailyNotifications();
    } else {
      console.log('✅ Notifications are up to date');
    }
  } catch (error) {
    console.error('❌ Error updating notifications:', error);
  }
};

// Schedule special notification (for milestones, events, etc.)
export const scheduleSpecialNotification = async (
  title: string, 
  body: string, 
  delay: number = 0,
  emoji: string = '🌟'
) => {
  if (Platform.OS === 'web') return;
  
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${emoji} ${title}`,
        body,
        sound: 'default',
        badge: 1,
        data: { 
          type: 'special_notification',
          timestamp: Date.now()
        },
      },
      trigger: delay > 0 ? { seconds: delay } : null,
    });
    
    console.log(`✅ Scheduled special notification: "${title}"`);
  } catch (error) {
    console.error('❌ Error scheduling special notification:', error);
  }
};

// Legacy function for backward compatibility (but now with smart features)
export const scheduleNotification = async (hour: number = 9, minute: number = 0) => {
  if (Platform.OS === 'web') {
    return; // Web doesn't support scheduled notifications
  }

  // Update preferences and use smart scheduling
  await updateUserNotificationPreferences({
    preferredTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  });
};

export const cancelAllNotifications = async () => {
  if (Platform.OS === 'web') {
    return;
  }
  
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('🔕 All notifications cancelled');
};