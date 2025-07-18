// CRITICAL FIX: Import polyfills before anything else
import '@/utils/polyfills';
import 'react-native-get-random-values';
// Import performance optimizations
import '@/utils/performanceConfig';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState, Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { 
  registerForPushNotificationsAsync, 
  scheduleSmartDailyNotifications,
  updateNotificationsWithFreshContent 
} from '@/utils/notifications';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { CouponProvider } from '@/contexts/CouponContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Inter-ExtraBold': Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      
      // Initialize notification system
      initializeNotificationSystem();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Handle app state changes for notification updates
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('📱 App became active, checking for notification updates...');
        updateNotificationsWithFreshContent();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => subscription?.remove();
  }, []);

  const initializeNotificationSystem = async () => {
    if (Platform.OS === 'web') {
      console.log('⚠️ Skipping notification setup on web platform');
      return;
    }

    try {
      console.log('🔔 Initializing enhanced notification system...');
      
      // Register for push notifications
      const token = await registerForPushNotificationsAsync();
      
      if (token) {
        console.log('✅ Push notifications registered successfully');
        
        // Set up smart daily notifications with remote + local fallback
        await scheduleSmartDailyNotifications();
        
        console.log('🌟 Smart notification system initialized!');
      } else {
        console.log('⚠️ Push notification permission not granted');
      }
    } catch (error) {
      console.error('❌ Error initializing notification system:', error);
      
      // Try basic fallback setup
      try {
        await scheduleSmartDailyNotifications();
        console.log('✅ Fallback notification system initialized');
      } catch (fallbackError) {
        console.error('❌ Even fallback notification setup failed:', fallbackError);
      }
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <CouponProvider>
            <Stack 
              screenOptions={{ 
                headerShown: false,
                // Smooth transitions optimized for mobile
                animationEnabled: true,
                animationTypeForReplace: 'push',
                gestureEnabled: Platform.OS === 'ios',
                ...(Platform.OS === 'android' 
                  ? {
                      // Android-optimized transitions
                      transitionSpec: {
                        open: {
                          animation: 'timing',
                          config: {
                            duration: 300,
                            easing: 'ease-out',
                          },
                        },
                        close: {
                          animation: 'timing',
                          config: {
                            duration: 250,
                            easing: 'ease-in',
                          },
                        },
                      },
                      cardStyleInterpolator: ({ current, layouts }) => {
                        return {
                          cardStyle: {
                            transform: [
                              {
                                translateX: current.progress.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [layouts.screen.width, 0],
                                }),
                              },
                            ],
                            opacity: current.progress.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0, 0.8, 1],
                            }),
                          },
                        };
                      },
                    }
                  : {
                      // iOS native slide transition
                      presentation: 'card',
                      transitionSpec: {
                        open: {
                          animation: 'timing',
                          config: {
                            duration: 350,
                            easing: 'ease-out',
                          },
                        },
                        close: {
                          animation: 'timing',
                          config: {
                            duration: 300,
                            easing: 'ease-in',
                          },
                        },
                      },
                    }),
              }}
            >
              <Stack.Screen name="auth" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="breathing" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="daily-question" />
              <Stack.Screen name="coupon-code" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="light" backgroundColor="#1F2937" />
          </CouponProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}