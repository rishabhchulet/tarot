import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  Easing 
} from 'react-native-reanimated';

export default function IndexScreen() {
  const { user, session, loading } = useAuth();
  const sparkleRotation = useSharedValue(0);

  useEffect(() => {
    sparkleRotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (!loading) {
      if (session && user) {
        // User is authenticated, go to main app
        router.replace('/(tabs)');
      } else {
        // No session, go to auth
        router.replace('/auth');
      }
    }
  }, [loading, session, user]);

  const animatedSparkleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${sparkleRotation.value}deg` }],
    };
  });

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
  },
  iconContainer: {
    marginBottom: 40,
  },
});