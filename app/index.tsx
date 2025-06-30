import { useEffect } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, CircleAlert as AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

export default function IndexScreen() {
  const { user, session, loading, error } = useAuth();
  const sparkleRotation = useSharedValue(0);

  useEffect(() => {
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    // CRITICAL FIX: Faster routing with better logic
    const navigationTimeout = setTimeout(() => {
      console.log('🔍 Routing check:', { 
        hasSession: !!session, 
        hasUser: !!user, 
        userFocusArea: user?.focusArea,
        userName: user?.name,
        loading,
        error
      });

      // Only route if not loading
      if (!loading) {
        try {
          if (session && user) {
            // User is authenticated and profile exists
            const focusArea = user.focusArea;
            const hasCompletedOnboarding = focusArea && typeof focusArea === 'string' && focusArea.trim().length > 0;
            
            console.log('🎯 Authenticated user routing:', { 
              focusArea: focusArea,
              hasCompletedOnboarding: hasCompletedOnboarding
            });
            
            if (!hasCompletedOnboarding) {
              console.log('📚 User needs onboarding - redirecting to quiz...');
              router.replace('/onboarding/quiz');
            } else {
              console.log('✅ User has completed onboarding - going to main app...');
              router.replace('/(tabs)');
            }
          } else {
            // FIXED: No session means new user - go to auth
            console.log('🔐 No session found - redirecting to auth (new user)...');
            router.replace('/auth');
          }
        } catch (navigationError) {
          console.error('❌ Navigation error:', navigationError);
          // Fallback to auth screen on any navigation error
          router.replace('/auth');
        }
      }
    }, 100); // Much faster timeout

    return () => clearTimeout(navigationTimeout);
  }, [loading, session, user, error]);

  const animatedSparkleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sparkleRotation.value}deg` }],
    };
  });

  const handleRefresh = () => {
    console.log('🔄 User requested refresh, reloading page...');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleGoToAuth = () => {
    console.log('🔐 User chose to go to auth manually...');
    router.replace('/auth');
  };

  // Only show error state for existing users with connection issues
  if (error && !loading && session) {
    const isConnectionError = error.includes('timeout') || error.includes('connection') || error.includes('network');
    
    return (
      <LinearGradient
        colors={['#1F2937', '#374151', '#6B46C1']}
        style={styles.container}
      >
        <View style={styles.content}>
          {isConnectionError ? (
            <WifiOff size={60} color="#EF4444" />
          ) : (
            <AlertCircle size={60} color="#EF4444" />
          )}
          
          <Text style={styles.errorTitle}>
            {isConnectionError ? 'Connection Issue' : 'Something went wrong'}
          </Text>
          
          <Text style={styles.errorText}>
            {isConnectionError 
              ? 'Unable to connect to our servers. Please check your internet connection and try again.'
              : error
            }
          </Text>
          
          {isConnectionError && (
            <View style={styles.connectionTips}>
              <Text style={styles.tipsTitle}>Try these steps:</Text>
              <Text style={styles.tipText}>• Check your internet connection</Text>
              <Text style={styles.tipText}>• Refresh the page</Text>
              <Text style={styles.tipText}>• Try again in a few moments</Text>
            </View>
          )}
          
          <View style={styles.errorActions}>
            <Pressable style={styles.refreshButton} onPress={handleRefresh}>
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.buttonGradient}
              >
                <RefreshCw size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Refresh</Text>
              </LinearGradient>
            </Pressable>
            
            <Pressable style={styles.authButton} onPress={handleGoToAuth}>
              <View style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>Continue to Sign In</Text>
              </View>
            </Pressable>
          </View>
          
          <Text style={styles.supportText}>
            Still having trouble? Contact support at support@dailyinner.com
          </Text>
        </View>
      </LinearGradient>
    );
  }

  // Show loading screen while checking auth state
  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedSparkleStyle]}>
          <Sparkles size={80} color="#F59E0B" strokeWidth={1.5} />
        </Animated.View>
        <Text style={styles.loadingText}>Connecting to your inner wisdom...</Text>
        
        {/* Show connection status */}
        <View style={styles.connectionStatus}>
          <Wifi size={16} color="#9CA3AF" />
          <Text style={styles.connectionText}>Establishing secure connection...</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    opacity: 0.7,
  },
  connectionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  errorTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    maxWidth: 320,
  },
  connectionTips: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    marginBottom: 4,
  },
  errorActions: {
    gap: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  authButton: {
    marginTop: 8,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  outlineButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
  supportText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});