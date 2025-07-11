import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { TAROT_CARDS } from '@/data/tarotCards';
import { I_CHING_HEXAGRAMS } from '@/data/iChing';
import { ReflectionPrompt } from './ReflectionPrompt';
import { router } from 'expo-router';
import { Star, Zap } from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

type FlowStep = 'card-and-iching' | 'keywords-only' | 'reflection-questions';

export function TarotCardFlow({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('card-and-iching');
  
  // Only use Major Arcana cards (0-21) that have complete structured data
  const [selectedCard] = useState(() => {
    const majorArcanaCards = TAROT_CARDS.filter(card => card.suit === 'Major Arcana');
    const randomIndex = Math.floor(Math.random() * majorArcanaCards.length);
    console.log(`🎴 Selected Major Arcana card: ${majorArcanaCards[randomIndex].name}`);
    return majorArcanaCards[randomIndex];
  });
  
  const [selectedHexagram] = useState(() => {
    const randomIndex = Math.floor(Math.random() * I_CHING_HEXAGRAMS.length);
    return I_CHING_HEXAGRAMS[randomIndex];
  });

  const flipAnimation = useSharedValue(0);
  const glowAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(0.8);
  const borderAnimation = useSharedValue(0);

  useEffect(() => {
    handleRevealCard();
  }, []);

  const handleRevealCard = () => {
    console.log('🎴 Card reveal triggered!');
    
    glowAnimation.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    borderAnimation.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });
    
    scaleAnimation.value = withSequence(
      withTiming(1.05, { duration: 800, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.cubic) })
    );
    
    flipAnimation.value = withDelay(1200, withTiming(1, { 
      duration: 1200, 
      easing: Easing.inOut(Easing.cubic) 
    }));
    
    setTimeout(() => {
      setCurrentStep('card-and-iching');
    }, 2000);
  };

  const handleShowKeywords = () => {
    setCurrentStep('keywords-only');
  };

  const handleShowReflection = () => {
    setCurrentStep('reflection-questions');
  };

  const handleReflectionComplete = () => {
    console.log('⭐ Reflection complete callback triggered');
    if (onComplete) {
      onComplete();
    } else {
      // Fallback navigation if no callback provided
      router.replace('/daily-question');
    }
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 1], [0, 180], 'clamp');
    return {
      transform: [
        { scale: scaleAnimation.value },
        { rotateY: `${rotateY}deg` }
      ],
      opacity: interpolate(flipAnimation.value, [0, 0.5], [1, 0], 'clamp'),
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${interpolate(flipAnimation.value, [0, 1], [180, 360])}deg` },
        { scale: scaleAnimation.value }
      ],
      opacity: interpolate(flipAnimation.value, [0.5, 1], [0, 1], 'clamp'),
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowAnimation.value,
      transform: [{ scale: glowAnimation.value * 1.5 }]
    };
  });

  const borderAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: borderAnimation.value,
      transform: [{ scale: 1 + borderAnimation.value * 0.1 }]
    };
  });

  const renderCardAndIching = () => (
    <View style={styles.stepContainer}>
      <Animated.View style={[styles.glowEffect1, glowAnimatedStyle]} />
      <Animated.View style={[styles.glowEffect2, glowAnimatedStyle]} />
      <Animated.View style={[styles.glowEffect3, glowAnimatedStyle]} />
      
      <Animated.View style={[styles.borderRing, borderAnimatedStyle]} />
      
      <View style={styles.cardStack}>
        {/* Back of card (shows after flip) */}
        <Animated.View style={[styles.cardContainer, backAnimatedStyle]}>
          <LinearGradient
            colors={['#1e40af', '#3b82f6', '#60a5fa', '#1e40af']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mysticalBorder}
          >
            <View style={styles.innerBorder}>
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{selectedCard.name}</Text>
                <View style={styles.ichingContainer}>
                  <Text style={styles.ichingTitle}>I Ching</Text>
                  <Text style={styles.ichingName}>{selectedHexagram.name}</Text>
                  <Text style={styles.ichingEssence}>{getIChingEssence(selectedHexagram)}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Front of card (shows first, then flips) */}
        <Animated.View style={[styles.cardContainer, frontAnimatedStyle]}>
          <LinearGradient
            colors={['#1e40af', '#3b82f6', '#60a5fa', '#1e40af']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mysticalBorder}
          >
            <View style={styles.innerBorder}>
              <Image
                source={{ uri: selectedCard.imageUrl }}
                style={styles.cardFrontImage}
                resizeMode="cover"
              />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      <Pressable style={styles.nextButton} onPress={handleShowKeywords}>
        <Text style={styles.nextButtonText}>Explore Themes</Text>
      </Pressable>
    </View>
  );

  const renderKeywordsOnly = () => (
    <View style={styles.stepContainer}>
      <View style={styles.keywordsHeader}>
        <Star size={24} color="#fde047" />
        <Text style={styles.stepTitle}>Key Themes</Text>
        <Star size={24} color="#fde047" />
      </View>
      
      {/* Tarot Keywords */}
      <View style={styles.keywordsSection}>
        <View style={styles.sectionHeaderContainer}>
          <Zap size={20} color="#60a5fa" />
          <Text style={styles.sectionTitle}>Tarot Energies</Text>
        </View>
        <View style={styles.keywordsList}>
          {selectedCard.keywords.map((keyword, index) => (
            <View key={index} style={[styles.keywordItem, styles.tarotKeyword]}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* I Ching Keywords */}
      <View style={styles.keywordsSection}>
        <View style={styles.sectionHeaderContainer}>
          <Star size={20} color="#3b82f6" />
          <Text style={styles.sectionTitle}>I Ching Wisdom</Text>
        </View>
        <View style={styles.keywordsList}>
          {getIChingKeywords(selectedHexagram).map((keyword, index) => (
            <View key={index} style={[styles.keywordItem, styles.ichingKeyword]}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable style={styles.continueButton} onPress={handleShowReflection}>
        <LinearGradient
          colors={['#3b82f6', '#1e40af']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.continueButtonText}>Begin Reflection</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  const renderReflectionQuestions = () => (
    <View style={styles.stepContainer}>
      <ReflectionPrompt
        card={selectedCard}
        hexagram={selectedHexagram}
        onComplete={handleReflectionComplete}
      />
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'card-and-iching':
        return renderCardAndIching();
      case 'keywords-only':
        return renderKeywordsOnly();
      case 'reflection-questions':
        return renderReflectionQuestions();
      default:
        return renderCardAndIching();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#171717', '#0a0a0a']}
        style={styles.container}>
        {renderCurrentStep()}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardStack: {
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth * 0.7,
    height: screenHeight * 0.5,
  },
  cardContainer: {
    width: screenWidth * 0.7,
    height: screenHeight * 0.5,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    position: 'absolute',
  },
  mysticalBorder: {
    flex: 1,
    borderRadius: 20,
    padding: 3,
  },
  innerBorder: {
    flex: 1,
    borderRadius: 17,
    backgroundColor: '#0a0a0a',
    overflow: 'hidden',
    position: 'relative',
  },
  cardFrontImage: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 20,
  },
  ichingContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  ichingTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#60a5fa',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ichingName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
    marginBottom: 4,
  },
  ichingEssence: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#60a5fa',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  nextButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 40,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  nextButtonText: {
    color: '#60a5fa',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  keywordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F9FAFB',
    textAlign: 'center',
  },
  keywordsSection: {
    width: '100%',
    marginBottom: 32,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#F9FAFB',
    textAlign: 'center',
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  keywordItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  tarotKeyword: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  ichingKeyword: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  keywordText: {
    color: '#F9FAFB',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  continueButton: {
    marginTop: 40,
    borderRadius: 25,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  buttonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
  },
  continueButtonText: {
    color: '#F9FAFB',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  glowEffect1: {
    position: 'absolute',
    width: screenWidth * 0.8,
    height: screenHeight * 0.6,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    zIndex: -1,
  },
  glowEffect2: {
    position: 'absolute',
    width: screenWidth * 0.85,
    height: screenHeight * 0.65,
    borderRadius: 35,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    zIndex: -2,
  },
  glowEffect3: {
    position: 'absolute',
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    zIndex: -3,
  },
  borderRing: {
    position: 'absolute',
    width: screenWidth * 0.75,
    height: screenHeight * 0.55,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    zIndex: -1,
  },
});