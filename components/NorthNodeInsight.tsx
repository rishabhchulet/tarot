import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { getAIInsight } from '@/utils/ai';
import { Sparkles } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';

export function NorthNodeInsight() {
  const { placements } = useAuth();
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);
  
  const opacity = useSharedValue(0);

  useEffect(() => {
    const fetchInsight = async () => {
      if (placements?.northNode) {
        setLoading(true);
        try {
          const { sign, house } = placements.northNode;
          const prompt = `Provide a concise, one-paragraph insight (around 50-70 words) about a North Node in ${sign} in the ${house} house. Focus on the core life lesson and soul's purpose. The tone should be inspiring and affirming.`;
          const generatedInsight = await getAIInsight(prompt);
          setInsight(generatedInsight);
          opacity.value = withTiming(1, { duration: 500 });
        } catch (error) {
          console.error('Error fetching North Node insight:', error);
          setInsight('Could not load insight. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInsight();
  }, [placements]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#FBC638" />
          <Text style={styles.loadingText}>Generating your soul's purpose...</Text>
        </View>
      );
    }
    return <Text style={styles.infoText}>{insight}</Text>;
  }

  return (
    <Animated.View style={[styles.infoBox, animatedStyle]}>
        <LinearGradient
          colors={['rgba(251, 191, 56, 0.15)', 'rgba(251, 191, 56, 0.05)']}
          style={styles.gradient}
        />
        <View style={styles.infoTitleContainer}>
            <Sparkles size={22} color="#FBC638" />
            <Text style={styles.infoTitle}>About Your North Node</Text>
        </View>
        {renderContent()}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    marginTop: 24,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 56, 0.3)',
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  infoTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FBC638',
    marginLeft: 8,
  },
  infoText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: '#FEFCE8',
    lineHeight: 23,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: '#FEFCE8',
    marginLeft: 12,
  }
}); 