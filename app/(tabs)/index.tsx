import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { TarotCard } from '@/components/TarotCard';
import { IChing } from '@/components/IChing';
import { TrialBanner } from '@/components/TrialBanner';
import { MagicalCardDraw } from '@/components/MagicalCardDraw';
import { Sparkles } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getSubscriptionStatus } from '@/utils/database';

export default function TodayScreen() {
  const { user } = useAuth();
  const [hasDrawnToday, setHasDrawnToday] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const status = await getSubscriptionStatus();
    setSubscriptionStatus(status);
  };

  const handleCardPull = () => {
    if (subscriptionStatus && !subscriptionStatus.hasActiveSubscription && subscriptionStatus.trialExpired) {
      Alert.alert(
        'Trial Expired',
        'Your free trial has ended. Subscribe to continue your daily tarot practice.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Subscribe', onPress: () => router.push('/paywall') }
        ]
      );
      return;
    }
    
    setIsDrawing(true);
  };

  const handleDrawComplete = () => {
    setIsDrawing(false);
    setHasDrawnToday(true);
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#374151', '#6B46C1']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <TrialBanner subscriptionStatus={subscriptionStatus} />
        
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Good morning, {user?.name || 'friend'}
          </Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {isDrawing ? (
          <MagicalCardDraw onComplete={handleDrawComplete} />
        ) : !hasDrawnToday ? (
          <View style={styles.pullContainer}>
            <View style={styles.intentionBox}>
              <Sparkles size={24} color="#F59E0B" />
              <Text style={styles.intentionText}>
                Take a breath and ask your heart:
              </Text>
              <Text style={styles.intentionQuestion}>
                "Show me the message I most need today to connect with my True Self"
              </Text>
            </View>

            <Pressable style={styles.pullButton} onPress={handleCardPull}>
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.pullButtonGradient}
              >
                <Text style={styles.pullButtonText}>Draw Your Card</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cardContainer}>
            <TarotCard onReflectionComplete={() => {}} />
            <IChing />
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  pullContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  intentionBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 32,
    marginBottom: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  intentionText: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  intentionQuestion: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
  },
  pullButton: {
    borderRadius: 25,
    overflow: 'hidden',
    minWidth: 200,
  },
  pullButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
  },
  pullButtonText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  cardContainer: {
    paddingBottom: 100,
  },
});