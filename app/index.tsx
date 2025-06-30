import { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, CircleAlert as AlertCircle, RefreshCw } from 'lucide-react-native';
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
    // Add a small delay to ensure auth state is properly loaded
    const navigationTimeout = setTimeout(() => {
      if (!loading && !error) {
        console.log('🔍 Routing check:', { 
          hasSession: !!session, 
          hasUser: !!user, 
          userFocusArea: user?.focusArea,
          userName: user?.name,
          loading,
          error
        });

        try {
          if (session && user) {
            // Check if user has completed onboarding
            const focusArea = user.focusArea;
            const hasCompletedOnboarding = focusArea && typeof focusArea === 'string' && focusArea.trim().length > 0;
            
            console.log('🎯 Onboarding check details:', { 
              focusArea: focusArea,
              focusAreaType: typeof focusArea,
              focusAreaLength: focusArea ? focusArea.length : 0,
              hasCompletedOnboarding: hasCompletedOnboarding
            });
            
            if (!hasCompletedOnboarding) {
              console.log('📚 User needs onboarding - redirecting to quiz...');
              router.replace('/onboarding/quiz');
            } else {
              console.log('✅ User has completed onboarding - going to main app...');
              router.replace('/(tabs)');
            }
          } else if (session && !user) {
            console.log('⚠️ Session exists but no user data - waiting for user refresh...');
            // Don't navigate yet, wait for user data to load
          } else {
            console.log('🔐 No session - redirecting to auth...');
            router.replace('/auth');
          }
        } catch (error) {
          console.error('❌ Navigation error:', error);
          // Fallback to auth screen on any navigation error
          router.replace('/auth');
        }
      } else if (error && !loading) {
        console.log('❌ Auth error detected, showing error state...');
        // Don't auto-redirect on error, let user see the error and refresh
      }
    }, 500); // Increased delay to ensure proper state loading

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

  // Show error state if there's an authentication error
  if (error && !loading) {
    return (
      <LinearGradient
        colors={['#1F2937', '#374151', '#6B46C1']}
        style={styles.container}
      >
        <View style={styles.content}>
          <AlertCircle size={60} color="#EF4444" />
          <Text style={styles.errorTitle}>Connection Issue</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Please check your internet connection</Text>
          
          <View style={styles.refreshButton} onTouchEnd={handleRefresh}>
            <RefreshCw size={20} color="#F59E0B" />
            <Text style={styles.refreshText}>Refresh</Text>
          </View>
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
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
    gap: 8,
  },
  refreshText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
});