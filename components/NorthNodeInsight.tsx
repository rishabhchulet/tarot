import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Moon, Sun, Sparkles, Heart, Eye, Compass } from 'lucide-react-native';

export function NorthNodeInsight() {
  const insights = [
    {
      icon: Sun,
      title: "Your Solar Path",
      description: "Your Sun placement reveals your core identity and life purpose. This is where your authentic self shines brightest.",
      color: "#FFD700",
      gradient: ["#FFD700", "#FFA500"]
    },
    {
      icon: Moon,
      title: "Lunar Wisdom",
      description: "Your Moon sign governs your emotional nature and intuitive responses. This is your inner sanctuary.",
      color: "#E6E6FA",
      gradient: ["#E6E6FA", "#D8BFD8"]
    },
    {
      icon: Star,
      title: "Rising Sign Energy",
      description: "Your Ascendant shapes how others perceive you and how you approach new experiences in life.",
      color: "#C4B5FD",
      gradient: ["#C4B5FD", "#A78BFA"]
    },
    {
      icon: Compass,
      title: "North Node Calling",
      description: "Your North Node points toward your soul's growth direction. This is where transformation awaits.",
      color: "#60A5FA",
      gradient: ["#60A5FA", "#3B82F6"]
    }
  ];

  const cosmicMessages = [
    "The planets at your birth moment created a unique energetic signature that influences your life path.",
    "Your chart reveals both challenges and gifts - each placement offers wisdom for your journey.",
    "The cosmic dance continues as current planetary movements activate different aspects of your natal chart.",
    "Understanding your chart helps you align with your natural rhythms and highest potential."
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Sparkles size={24} color="#FFD700" />
        </View>
        <Text style={styles.headerTitle}>Your Cosmic Blueprint</Text>
        <Text style={styles.headerSubtitle}>
          Discover the celestial influences that shape your unique path
        </Text>
      </View>

      {/* Insights Grid */}
      <View style={styles.insightsContainer}>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <LinearGradient
              colors={[`${insight.color}15`, `${insight.color}05`]}
              style={styles.insightGradient}
            >
              <View style={styles.insightHeader}>
                <View style={[styles.insightIcon, { backgroundColor: `${insight.color}20` }]}>
                  <insight.icon size={20} color={insight.color} />
                </View>
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>

      {/* Cosmic Wisdom Section */}
      <View style={styles.wisdomSection}>
        <View style={styles.wisdomHeader}>
          <Eye size={20} color="#A78BFA" />
          <Text style={styles.wisdomTitle}>Cosmic Wisdom</Text>
        </View>
        
        {cosmicMessages.map((message, index) => (
          <View key={index} style={styles.wisdomItem}>
            <View style={styles.wisdomBullet}>
              <Star size={12} color="#FFD700" fill="#FFD700" />
            </View>
            <Text style={styles.wisdomText}>{message}</Text>
          </View>
        ))}
      </View>

      {/* Personal Guidance Section */}
      <View style={styles.guidanceSection}>
        <LinearGradient
          colors={['rgba(138,43,226,0.1)', 'rgba(138,43,226,0.05)']}
          style={styles.guidanceGradient}
        >
          <View style={styles.guidanceHeader}>
            <Heart size={20} color="#F87171" />
            <Text style={styles.guidanceTitle}>Your Personal Guidance</Text>
          </View>
          
          <Text style={styles.guidanceText}>
            Your birth chart is a sacred map of your soul's journey. Each planetary placement 
            offers unique gifts and lessons. Trust in the cosmic timing of your life - 
            you are exactly where you need to be for your highest growth.
          </Text>
          
          <View style={styles.guidanceFooter}>
            <Text style={styles.guidanceFooterText}>
              ✨ The stars incline, they do not compel ✨
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Chart Accuracy Note */}
      <View style={styles.accuracyNote}>
        <Text style={styles.accuracyTitle}>Chart Precision</Text>
        <Text style={styles.accuracyText}>
          Your chart is calculated using precise astronomical data and your exact birth information. 
          The planetary positions shown reflect the actual celestial configuration at your moment of birth.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 24,
  },
  insightsContainer: {
    marginBottom: 24,
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  insightDescription: {
    fontSize: 15,
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  wisdomSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  wisdomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  wisdomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  wisdomItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  wisdomBullet: {
    marginRight: 12,
    marginTop: 4,
  },
  wisdomText: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  guidanceSection: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(138,43,226,0.2)',
  },
  guidanceGradient: {
    padding: 20,
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  guidanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  guidanceText: {
    fontSize: 15,
    color: '#E5E7EB',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 16,
  },
  guidanceFooter: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  guidanceFooterText: {
    fontSize: 14,
    color: '#A78BFA',
    fontFamily: 'Inter-Medium',
    fontStyle: 'italic',
  },
  accuracyNote: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  accuracyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22C55E',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  accuracyText: {
    fontSize: 14,
    color: '#D1D5DB',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
}); 