import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratingPlacements } from '@/components/GeneratingPlacements';
import { ChevronLeft, Star, Sun, Moon, Sparkles, Calendar, MapPin } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AstrologyChart from '@/components/AstrologyChart';
import { NorthNodeInsight } from '@/components/NorthNodeInsight';
import { SubscriptionGate } from '@/components/SubscriptionGate';
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

  // Format birth data for display
  const formatDate = () => {
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = () => {
    const time = new Date();
    time.setHours(hour, minute);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const PersonalizedInsights = () => (
    <View style={styles.insightsContainer}>
      <View style={styles.insightHeader}>
        <Sparkles size={20} color="#fbbf24" />
        <Text style={styles.insightTitle}>Your Personal Cosmic Story</Text>
      </View>

      {/* Sun Sign Insight */}
      <View style={styles.insightCard}>
        <LinearGradient
          colors={['rgba(251,191,36,0.1)', 'rgba(251,191,36,0.05)']}
          style={styles.insightGradient}
        >
          <View style={styles.insightCardHeader}>
            <Sun size={18} color="#fbbf24" />
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
            <Moon size={18} color="#e2e8f0" />
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
          colors={['rgba(139,92,246,0.1)', 'rgba(139,92,246,0.05)']}
          style={styles.summaryGradient}
        >
          <View style={styles.summaryHeader}>
            <Star size={18} color="#8b5cf6" />
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

      {/* Enhanced Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#f8fafc" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Your Cosmic Blueprint</Text>
          <Text style={styles.subtitle}>Natal Chart Analysis</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Birth Data Card */}
      <View style={styles.birthDataContainer}>
        <View style={styles.birthDataCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
            style={styles.birthDataGradient}
          >
            <View style={styles.birthDataRow}>
              <View style={styles.birthDataItem}>
                <Calendar size={16} color="#64748b" />
                <Text style={styles.birthDataLabel}>Birth Date</Text>
                <Text style={styles.birthDataValue}>{formatDate()}</Text>
              </View>
              <View style={styles.birthDataItem}>
                <MapPin size={16} color="#64748b" />
                <Text style={styles.birthDataLabel}>Birth Time</Text>
                <Text style={styles.birthDataValue}>{formatTime()}</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <MapPin size={16} color="#64748b" />
              <Text style={styles.locationText}>{user.birthLocation}</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SubscriptionGate
          feature="Complete Astrology Chart"
          description="Unlock your full cosmic blueprint with detailed planetary positions, aspects, and personalized insights."
          requiredPlan="trial"
          fallbackContent={
            <View style={styles.basicChart}>
              <Text style={styles.basicChartTitle}>Basic Sun & Moon Information</Text>
              <Text style={styles.basicChartText}>
                Your Sun is in {sunSign} and your Moon is in {moonSign}. 
                Upgrade to see your complete planetary chart with detailed insights.
              </Text>
            </View>
          }
        >
          <View style={styles.chartContainer}>
            <AstrologyChart positions={positions} />
          </View>
          
          <PersonalizedInsights />
          <NorthNodeInsight />
        </SubscriptionGate>
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
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  birthDataContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  birthDataCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  birthDataGradient: {
    padding: 16,
  },
  birthDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  birthDataItem: {
    alignItems: 'center',
    flex: 1,
  },
  birthDataLabel: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
    marginBottom: 2,
  },
  birthDataValue: {
    fontSize: 14,
    color: '#f8fafc',
    fontFamily: 'Inter-SemiBold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  locationText: {
    fontSize: 13,
    color: '#94a3b8',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
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
    color: '#f8fafc',
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  insightCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
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
    color: '#f8fafc',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
    flex: 1,
  },
  insightDegree: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'Inter-Medium',
  },
  insightText: {
    fontSize: 14,
    color: '#d1d5db',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  summaryCard: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
    backgroundColor: 'rgba(255,255,255,0.02)',
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
    color: '#f8fafc',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 15,
    color: '#e2e8f0',
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  basicChart: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  basicChartTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    marginBottom: 12,
    textAlign: 'center',
  },
  basicChartText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    lineHeight: 20,
    textAlign: 'center',
  },
}); 