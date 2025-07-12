import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratingPlacements } from '@/components/GeneratingPlacements';
import { ChevronLeft, Star, Sun, Moon, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AstrologyChart from '@/components/AstrologyChart';
import { NorthNodeInsight } from '@/components/NorthNodeInsight';
import { getPlanetaryPositions, getZodiacSign, PlanetPosition } from '@/utils/astrologyCalculations';

// Detailed interpretations for each planet in each sign
const getDetailedInterpretation = (planet: string, sign: string) => {
  const interpretations: { [key: string]: { [key: string]: string } } = {
    Sun: {
      Aries: "Your core identity burns with pioneering fire. You're a natural leader who thrives on new challenges and adventures.",
      Taurus: "Your essence is grounded in stability and beauty. You find fulfillment through building lasting value and enjoying life's pleasures.",
      Gemini: "Your identity is multifaceted and communicative. You shine through learning, teaching, and connecting diverse ideas.",
      Cancer: "Your core self is nurturing and intuitive. You find purpose in caring for others and creating emotional security.",
      Leo: "Your identity radiates warmth and creativity. You're meant to shine and inspire others through your unique self-expression.",
      Virgo: "Your essence seeks perfection through service. You find fulfillment in helping others and improving systems.",
      Libra: "Your core identity seeks harmony and beauty. You thrive in partnerships and creating balance in all areas of life.",
      Scorpio: "Your essence is transformative and intense. You're called to explore life's mysteries and facilitate deep change.",
      Sagittarius: "Your identity is expansive and philosophical. You find purpose in exploring truth and sharing wisdom.",
      Capricorn: "Your core self is ambitious and disciplined. You're meant to build lasting structures and achieve mastery.",
      Aquarius: "Your essence is innovative and humanitarian. You shine by bringing unique perspectives to collective progress.",
      Pisces: "Your identity is compassionate and intuitive. You find fulfillment through spiritual connection and creative expression."
    },
    Moon: {
      Aries: "Your emotional nature is spontaneous and direct. You process feelings quickly and need independence to feel secure.",
      Taurus: "Your inner world craves stability and comfort. You find emotional security through consistency and sensual pleasures.",
      Gemini: "Your emotional nature is curious and changeable. You process feelings through communication and mental stimulation.",
      Cancer: "Your inner world is deeply nurturing and protective. You find security through family bonds and emotional intimacy.",
      Leo: "Your emotional nature is warm and expressive. You need appreciation and creative outlets to feel emotionally fulfilled.",
      Virgo: "Your inner world seeks order and usefulness. You find emotional security through being helpful and organized.",
      Libra: "Your emotional nature craves harmony and partnership. You feel most secure in balanced, beautiful relationships.",
      Scorpio: "Your inner world is intense and transformative. You process emotions deeply and need authentic connections.",
      Sagittarius: "Your emotional nature is adventurous and optimistic. You find security through freedom and philosophical exploration.",
      Capricorn: "Your inner world is structured and ambitious. You find emotional security through achievement and respect.",
      Aquarius: "Your emotional nature is detached yet humanitarian. You process feelings through intellectual understanding and group connections.",
      Pisces: "Your inner world is compassionate and intuitive. You find emotional security through spiritual connection and creative expression."
    }
  };

  return interpretations[planet]?.[sign] || `Your ${planet} in ${sign} brings unique gifts to your cosmic blueprint.`;
};

export default function AstrologyChartScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  if (!user || !user.birthDate || !user.birthTime || !user.birthLocation) {
    return <GeneratingPlacements message="Reading your cosmic blueprint..." />;
  }

  const [year, month, day] = user.birthDate.split('-').map(Number);
  const [hour, minute] = user.birthTime.split(':').map(Number);
  const { latitude, longitude } = user.birthLocation;

  const positions = getPlanetaryPositions(
    year,
    month,
    day,
    hour,
    minute,
    latitude,
    longitude
  );

  // Get the most significant placements for detailed interpretation
  const sunPosition = positions.find(p => p.name === 'Sun');
  const moonPosition = positions.find(p => p.name === 'Moon');
  const sunSign = sunPosition ? getZodiacSign(sunPosition.longitude) : 'Aries';
  const moonSign = moonPosition ? getZodiacSign(moonPosition.longitude) : 'Aries';

  const PersonalizedInsights = () => (
    <View style={styles.insightsContainer}>
      <View style={styles.insightHeader}>
        <Sparkles size={20} color="#FFD700" />
        <Text style={styles.insightTitle}>Your Personal Cosmic Story</Text>
      </View>

      {/* Sun Sign Insight */}
      <View style={styles.insightCard}>
        <LinearGradient
          colors={['rgba(255,215,0,0.1)', 'rgba(255,215,0,0.05)']}
          style={styles.insightGradient}
        >
          <View style={styles.insightCardHeader}>
            <Sun size={18} color="#FFD700" />
            <Text style={styles.insightCardTitle}>Sun in {sunSign}</Text>
            <Text style={styles.insightDegree}>
              {sunPosition ? `${Math.floor(sunPosition.longitude % 30)}°` : '0°'}
            </Text>
          </View>
          <Text style={styles.insightText}>
            {getDetailedInterpretation('Sun', sunSign)}
          </Text>
        </LinearGradient>
      </View>

      {/* Moon Sign Insight */}
      <View style={styles.insightCard}>
        <LinearGradient
          colors={['rgba(230,230,250,0.1)', 'rgba(230,230,250,0.05)']}
          style={styles.insightGradient}
        >
          <View style={styles.insightCardHeader}>
            <Moon size={18} color="#E6E6FA" />
            <Text style={styles.insightCardTitle}>Moon in {moonSign}</Text>
            <Text style={styles.insightDegree}>
              {moonPosition ? `${Math.floor(moonPosition.longitude % 30)}°` : '0°'}
            </Text>
          </View>
          <Text style={styles.insightText}>
            {getDetailedInterpretation('Moon', moonSign)}
          </Text>
        </LinearGradient>
      </View>

      {/* Planetary Summary */}
      <View style={styles.summaryCard}>
        <LinearGradient
          colors={['rgba(138,43,226,0.1)', 'rgba(138,43,226,0.05)']}
          style={styles.summaryGradient}
        >
          <View style={styles.summaryHeader}>
            <Star size={18} color="#A78BFA" />
            <Text style={styles.summaryTitle}>Your Cosmic Signature</Text>
          </View>
          <Text style={styles.summaryText}>
            Born under a {sunSign} Sun and {moonSign} Moon, your chart reveals a unique blend of 
            {sunSign === moonSign ? ' harmonious' : ' complementary'} energies. Your {sunSign} Sun drives your 
            core identity and life purpose, while your {moonSign} Moon governs your emotional nature and 
            inner world. This combination creates a distinctive personality that balances 
            {sunSign === 'Aries' || sunSign === 'Leo' || sunSign === 'Sagittarius' ? ' fiery passion' : 
             sunSign === 'Taurus' || sunSign === 'Virgo' || sunSign === 'Capricorn' ? ' earthy practicality' :
             sunSign === 'Gemini' || sunSign === 'Libra' || sunSign === 'Aquarius' ? ' airy intellect' : ' watery intuition'} 
            with 
            {moonSign === 'Aries' || moonSign === 'Leo' || moonSign === 'Sagittarius' ? ' dynamic emotional responses' : 
             moonSign === 'Taurus' || moonSign === 'Virgo' || moonSign === 'Capricorn' ? ' stable emotional foundations' :
             moonSign === 'Gemini' || moonSign === 'Libra' || moonSign === 'Aquarius' ? ' intellectual emotional processing' : ' deep emotional sensitivity'}.
          </Text>
        </LinearGradient>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#f8fafc" />
        </Pressable>
        <Text style={styles.title}>Your Cosmic Blueprint</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.chartContainer}>
          <AstrologyChart positions={positions} />
        </View>
        
        <PersonalizedInsights />
        <NorthNodeInsight />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    fontFamily: 'Inter-Bold',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  insightsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  insightCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  insightGradient: {
    padding: 16,
  },
  insightCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    flex: 1,
  },
  insightDegree: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Medium',
  },
  insightText: {
    fontSize: 14,
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  summaryCard: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(138,43,226,0.2)',
  },
  summaryGradient: {
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 15,
    color: '#E5E7EB',
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
}); 