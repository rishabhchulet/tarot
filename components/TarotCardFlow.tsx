import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate 
} from 'react-native-reanimated';
import { TAROT_CARDS } from '@/data/tarotCards';
import { I_CHING_HEXAGRAMS } from '@/data/iChing';
import { ReflectionPrompt } from './ReflectionPrompt';
import { AIInterpretation } from './AIInterpretation';

type FlowStep = 'card-back' | 'card-and-iching' | 'keywords-only' | 'reflection-questions';

export function TarotCardFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('card-back');
  const [selectedCard] = useState(() => {
    const randomIndex = Math.floor(Math.random() * TAROT_CARDS.length);
    return TAROT_CARDS[randomIndex];
  });
  const [selectedHexagram] = useState(() => {
    const randomIndex = Math.floor(Math.random() * I_CHING_HEXAGRAMS.length);
    return I_CHING_HEXAGRAMS[randomIndex];
  });

  const flipAnimation = useSharedValue(0);

  const handleRevealCard = () => {
    flipAnimation.value = withTiming(1, { duration: 800 });
    setTimeout(() => {
      setCurrentStep('card-and-iching');
    }, 400);
  };

  const handleShowKeywords = () => {
    setCurrentStep('keywords-only');
  };

  const handleShowReflection = () => {
    setCurrentStep('reflection-questions');
  };

  const handleReflectionComplete = () => {
    // Handle completion - could navigate somewhere or reset
    console.log('Reflection completed');
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 1], [0, 180], 'clamp');
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity: interpolate(flipAnimation.value, [0, 0.5], [1, 0], 'clamp'),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 1], [180, 360], 'clamp');
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
      opacity: interpolate(flipAnimation.value, [0.5, 1], [0, 1], 'clamp'),
    };
  });

  // Get a simple one-word essence of the I Ching hexagram
  const getIChingEssence = (hexagram: any) => {
    const essenceMap: { [key: string]: string } = {
      'The Creative': 'Creation',
      'The Receptive': 'Receptivity',
      'Difficulty at the Beginning': 'Challenge',
      'Youthful Folly': 'Learning',
      'Waiting': 'Patience',
      'Conflict': 'Resolution',
      'The Army': 'Leadership',
      'Holding Together': 'Unity',
      'Small Taming': 'Restraint',
      'Treading': 'Caution',
      'Peace': 'Harmony',
      'Standstill': 'Stillness',
      'Fellowship': 'Community',
      'Great Possession': 'Abundance',
      'Modesty': 'Humility',
      'Enthusiasm': 'Inspiration',
      'Following': 'Adaptation',
      'Work on the Decayed': 'Healing',
      'Approach': 'Progress',
      'Contemplation': 'Reflection'
    };
    
    return essenceMap[hexagram.name] || 'Wisdom';
  };

  // Get I Ching keywords based on the hexagram
  const getIChingKeywords = (hexagram: any) => {
    const keywordMap: { [key: string]: string[] } = {
      'The Creative': ['Initiative', 'Leadership', 'Power'],
      'The Receptive': ['Acceptance', 'Nurturing', 'Support'],
      'Difficulty at the Beginning': ['Perseverance', 'Growth', 'Breakthrough'],
      'Youthful Folly': ['Learning', 'Guidance', 'Wisdom'],
      'Waiting': ['Patience', 'Timing', 'Trust'],
      'Conflict': ['Resolution', 'Balance', 'Harmony'],
      'The Army': ['Organization', 'Strategy', 'Discipline'],
      'Holding Together': ['Unity', 'Cooperation', 'Bond'],
      'Small Taming': ['Restraint', 'Gentleness', 'Patience'],
      'Treading': ['Caution', 'Respect', 'Mindfulness'],
      'Peace': ['Harmony', 'Balance', 'Prosperity'],
      'Standstill': ['Stillness', 'Reflection', 'Pause'],
      'Fellowship': ['Community', 'Friendship', 'Collaboration'],
      'Great Possession': ['Abundance', 'Responsibility', 'Sharing'],
      'Modesty': ['Humility', 'Grace', 'Simplicity'],
      'Enthusiasm': ['Inspiration', 'Energy', 'Motivation'],
      'Following': ['Adaptation', 'Flow', 'Flexibility'],
      'Work on the Decayed': ['Healing', 'Restoration', 'Renewal'],
      'Approach': ['Progress', 'Advancement', 'Growth'],
      'Contemplation': ['Reflection', 'Insight', 'Understanding']
    };
    
    return keywordMap[hexagram.name] || ['Wisdom', 'Growth', 'Understanding'];
  };

  const renderCardBack = () => (
    <View style={styles.centeredContainer}>
      <Pressable style={styles.cardContainer} onPress={handleRevealCard}>
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
          <LinearGradient
            colors={['#6B46C1', '#8B5CF6']}
            style={styles.cardBack}
          >
            <View style={styles.cardPattern}>
              <Text style={styles.cardBackText}>✦</Text>
            </View>
            <Text style={styles.tapHint}>Tap to reveal</Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );

  const renderCardAndIching = () => (
    <View style={styles.fullContainer}>
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.card, styles.cardFront, backAnimatedStyle]}>
          <Image
            source={{ uri: selectedCard.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{selectedCard.name}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.ichingContainer}>
        <Text style={styles.ichingTitle}>Your I Ching Guidance</Text>
        <View style={styles.ichingCard}>
          <Text style={styles.ichingNumber}>#{selectedHexagram.number}</Text>
          <Text style={styles.ichingName}>{selectedHexagram.name}</Text>
          <View style={styles.hexagramSymbol}>
            {selectedHexagram.lines.map((line: boolean, index: number) => (
              <View
                key={index}
                style={[
                  styles.line,
                  line ? styles.solidLine : styles.brokenLine
                ]}
              />
            ))}
          </View>
          <Text style={styles.ichingEssence}>{getIChingEssence(selectedHexagram)}</Text>
        </View>
      </View>

      <Pressable style={styles.continueButton} onPress={handleShowKeywords}>
        <LinearGradient
          colors={['#F59E0B', '#D97706']}
          style={styles.continueButtonGradient}
        >
          <Text style={styles.continueButtonText}>Show Keywords</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  const renderKeywordsOnly = () => (
    <View style={styles.fullContainer}>
      <View style={styles.keywordsMainContainer}>
        <Text style={styles.keywordsTitle}>Your Spiritual Keywords</Text>
        <Text style={styles.keywordsSubtitle}>
          These energies are guiding you today
        </Text>

        {/* Tarot Keywords */}
        <View style={styles.keywordSection}>
          <View style={styles.keywordSectionHeader}>
            <Text style={styles.keywordSectionTitle}>Tarot: {selectedCard.name}</Text>
          </View>
          <View style={styles.keywordGrid}>
            {selectedCard.keywords.map((keyword, index) => (
              <View key={index} style={styles.tarotKeyword}>
                <Text style={styles.tarotKeywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* I Ching Keywords */}
        <View style={styles.keywordSection}>
          <View style={styles.keywordSectionHeader}>
            <Text style={styles.keywordSectionTitle}>I Ching: {selectedHexagram.name}</Text>
          </View>
          <View style={styles.keywordGrid}>
            {getIChingKeywords(selectedHexagram).map((keyword, index) => (
              <View key={index} style={styles.ichingKeyword}>
                <Text style={styles.ichingKeywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Combined Essence */}
        <View style={styles.essenceContainer}>
          <Text style={styles.essenceTitle}>Today's Essence</Text>
          <Text style={styles.essenceText}>
            {selectedCard.keywords[0]} • {getIChingEssence(selectedHexagram)}
          </Text>
        </View>
      </View>

      <Pressable style={styles.continueButton} onPress={handleShowReflection}>
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.continueButtonGradient}
        >
          <Text style={styles.continueButtonText}>Begin Reflection</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  const renderReflectionQuestions = () => (
    <View style={styles.fullContainer}>
      <ReflectionPrompt
        card={selectedCard}
        hexagram={selectedHexagram}
        onComplete={handleReflectionComplete}
      />
    </View>
  );

  switch (currentStep) {
    case 'card-back':
      return renderCardBack();
    case 'card-and-iching':
      return renderCardAndIching();
    case 'keywords-only':
      return renderKeywordsOnly();
    case 'reflection-questions':
      return renderReflectionQuestions();
    default:
      return renderCardBack();
  }
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 500,
  },
  fullContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  cardContainer: {
    width: 250,
    height: 400,
    position: 'relative',
    marginBottom: 24,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  cardPattern: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  cardBackText: {
    fontSize: 60,
    color: '#F59E0B',
    fontFamily: 'CormorantGaramond-Bold',
  },
  tapHint: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#D1D5DB',
    marginBottom: 20,
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: 280,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardInfo: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  ichingContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  ichingTitle: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 20,
  },
  ichingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ichingNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  ichingName: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 20,
  },
  hexagramSymbol: {
    marginBottom: 20,
    gap: 4,
  },
  line: {
    height: 4,
    width: 80,
    backgroundColor: '#F59E0B',
  },
  solidLine: {
    // Solid line style
  },
  brokenLine: {
    // Broken line - create gap in middle
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  ichingEssence: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  keywordsMainContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  keywordsTitle: {
    fontSize: 28,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 8,
  },
  keywordsSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
  },
  keywordSection: {
    marginBottom: 32,
  },
  keywordSectionHeader: {
    marginBottom: 16,
  },
  keywordSectionTitle: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
  },
  keywordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  tarotKeyword: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  tarotKeywordText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
  ichingKeyword: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  ichingKeywordText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  essenceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  essenceTitle: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#D1D5DB',
    marginBottom: 12,
  },
  essenceText: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
    minWidth: 200,
    marginTop: 16,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});