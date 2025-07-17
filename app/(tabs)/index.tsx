import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratingPlacements } from '@/components/GeneratingPlacements';
import { ProfileHeader } from '@/components/ProfileHeader';
import { TrialBanner } from '@/components/TrialBanner';
import { DailyReflectionCard } from '@/components/DailyReflectionCard';
import { NavCard } from '@/components/NavCard';
import { Users, Star } from 'lucide-react-native';
import { FreeReadingCard } from '@/components/FreeReadingCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CelestialInfo } from '@/components/CelestialInfo';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface AnimatedSectionHeaderProps {
  title: string;
  subtitle: string;
  delay: number;
}

// Animated section header component
const AnimatedSectionHeader: React.FC<AnimatedSectionHeaderProps> = ({ title, subtitle, delay }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
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

          {/* Subscription Status Banner */}
          <TrialBanner />

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
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  dailyReadingContainer: {
    marginBottom: 8,
  },
  exploreGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 8,
    gap: 16,
  },
  gridItem: {
    flex: 1,
    maxWidth: '48%', // Ensure proper width distribution
  },
  universeContainer: {
    marginBottom: 8,
  },
  celestialContainer: {
    marginBottom: 8,
  },
});