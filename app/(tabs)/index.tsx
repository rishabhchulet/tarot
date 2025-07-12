import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratingPlacements } from '@/components/GeneratingPlacements';
import { ProfileHeader } from '@/components/ProfileHeader';
import { DailyReflectionCard } from '@/components/DailyReflectionCard';
import { NavCard } from '@/components/NavCard';
import { Users, Star, BookOpen, Sparkles, Zap, Moon, Sun } from 'lucide-react-native';
import { FreeReadingCard } from '@/components/FreeReadingCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CelestialInfo } from '@/components/CelestialInfo';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Floating cosmic elements component
const FloatingCosmicElements = () => {
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);
  const rotate1 = useSharedValue(0);
  const rotate2 = useSharedValue(0);
  const pulse1 = useSharedValue(0.8);
  const pulse2 = useSharedValue(0.9);

  useEffect(() => {
    // Floating animations
    float1.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );

    float2.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );

    float3.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );

    // Rotation animations
    rotate1.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1, false
    );

    rotate2.value = withRepeat(
      withTiming(-360, { duration: 15000, easing: Easing.linear }),
      -1, false
    );

    // Pulse animations
    pulse1.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );

    pulse2.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ), -1, true
    );
  }, []);

  const animatedFloat1 = useAnimatedStyle(() => ({
    transform: [
      { translateY: float1.value },
      { rotate: `${rotate1.value}deg` },
      { scale: pulse1.value }
    ],
  }));

  const animatedFloat2 = useAnimatedStyle(() => ({
    transform: [
      { translateY: float2.value },
      { rotate: `${rotate2.value}deg` },
      { scale: pulse2.value }
    ],
  }));

  const animatedFloat3 = useAnimatedStyle(() => ({
    transform: [{ translateY: float3.value }],
  }));

  return (
    <View style={styles.floatingElements}>
      {/* Floating sparkles */}
      <Animated.View style={[styles.floatingElement1, animatedFloat1]}>
        <Sparkles size={16} color="#fbbf24" fill="rgba(251, 191, 36, 0.3)" />
      </Animated.View>
      
      <Animated.View style={[styles.floatingElement2, animatedFloat2]}>
        <Star size={12} color="#f59e0b" fill="rgba(245, 158, 11, 0.4)" />
      </Animated.View>
      
      <Animated.View style={[styles.floatingElement3, animatedFloat3]}>
        <Moon size={14} color="#fbbf24" fill="rgba(251, 191, 36, 0.2)" />
      </Animated.View>
      
      <Animated.View style={[styles.floatingElement4, animatedFloat1]}>
        <Zap size={10} color="#f59e0b" fill="rgba(245, 158, 11, 0.3)" />
      </Animated.View>
      
      <Animated.View style={[styles.floatingElement5, animatedFloat2]}>
        <Sun size={18} color="#fbbf24" fill="rgba(251, 191, 36, 0.2)" />
      </Animated.View>
    </View>
  );
};

// Enhanced section header with animations
const AnimatedSectionHeader = ({ title, subtitle, delay = 0 }) => {
  const fadeIn = useSharedValue(0);
  const slideUp = useSharedValue(30);

  useEffect(() => {
    fadeIn.value = withDelay(delay, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    slideUp.value = withDelay(delay, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  return (
    <Animated.View style={[styles.sectionHeader, animatedStyle]}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.titleAccent} />
      </View>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // Main content animations
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  useEffect(() => {
    if (user) {
      contentOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
      contentTranslateY.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.cubic) });
    }
  }, [user]);

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  if (!user) {
    return <GeneratingPlacements />;
  }

  return (
    <View style={styles.container}>
      {/* Enhanced gradient background */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155', '#1e293b', '#0f172a']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Floating cosmic elements */}
      <FloatingCosmicElements />
      
      {/* Ambient glow effects */}
      <View style={styles.ambientGlow1} />
      <View style={styles.ambientGlow2} />
      <View style={styles.ambientGlow3} />
      
      <Animated.View style={[styles.contentContainer, animatedContentStyle]}>
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent, 
            { 
              paddingTop: insets.top + 24, 
              paddingBottom: insets.bottom + 32 
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Header Section */}
          <View style={styles.headerSection}>
            <ProfileHeader />
          </View>

          {/* Daily Reading Section with enhanced styling */}
          <View style={styles.section}>
            <AnimatedSectionHeader 
              title="Your Daily Reading"
              subtitle="Connect with your inner wisdom"
              delay={200}
            />
            <View style={styles.dailyReadingContainer}>
              <DailyReflectionCard />
            </View>
          </View>

          {/* Enhanced Explore Section */}
          <View style={styles.section}>
            <AnimatedSectionHeader 
              title="Explore"
              subtitle="Discover your cosmic blueprint"
              delay={400}
            />
            <View style={styles.exploreGrid}>
              <View style={styles.gridItem}>
                <NavCard 
                  title="My Chart"
                  subtitle="Your astrology"
                  href="/astrology-chart"
                  icon={<Star size={24} color="#fbbf24" />}
                />
              </View>
              <View style={styles.gridItem}>
                <NavCard 
                  title="Compatibility"
                  subtitle="Cosmic connections"
                  href="/compatibility"
                  icon={<Users size={24} color="#8b5cf6" />}
                />
              </View>
            </View>
          </View>

          {/* Enhanced Ask the Universe Section */}
          <View style={styles.section}>
            <AnimatedSectionHeader 
              title="Ask the Universe"
              subtitle="Get guidance on any question"
              delay={600}
            />
            <View style={styles.universeContainer}>
              <FreeReadingCard />
            </View>
          </View>

          {/* Enhanced Celestial Info Section */}
          <View style={styles.lastSection}>
            <AnimatedSectionHeader 
              title="Cosmic Insights"
              subtitle="Current celestial energies"
              delay={800}
            />
            <View style={styles.celestialContainer}>
              <CelestialInfo />
            </View>
          </View>

        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  floatingElement1: {
    position: 'absolute',
    top: '15%',
    right: '10%',
    opacity: 0.6,
  },
  floatingElement2: {
    position: 'absolute',
    top: '25%',
    left: '8%',
    opacity: 0.5,
  },
  floatingElement3: {
    position: 'absolute',
    top: '45%',
    right: '15%',
    opacity: 0.4,
  },
  floatingElement4: {
    position: 'absolute',
    top: '65%',
    left: '12%',
    opacity: 0.7,
  },
  floatingElement5: {
    position: 'absolute',
    top: '80%',
    right: '8%',
    opacity: 0.5,
  },
  ambientGlow1: {
    position: 'absolute',
    top: '10%',
    left: '20%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    opacity: 0.6,
  },
  ambientGlow2: {
    position: 'absolute',
    top: '50%',
    right: '10%',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    opacity: 0.8,
  },
  ambientGlow3: {
    position: 'absolute',
    bottom: '20%',
    left: '10%',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(251, 191, 36, 0.04)',
    opacity: 0.7,
  },
  contentContainer: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerSection: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 36,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#f8fafc',
    marginRight: 12,
  },
  titleAccent: {
    width: 30,
    height: 3,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#94a3b8',
    lineHeight: 22,
  },
  dailyReadingContainer: {
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  exploreGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  gridItem: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  universeContainer: {
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  celestialContainer: {
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
});