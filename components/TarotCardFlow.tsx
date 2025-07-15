import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
  withSequence,
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { TAROT_CARDS } from '@/data/tarotCards';
import { I_CHING_HEXAGRAMS } from '@/data/iChing';
import { ReflectionPrompt } from './ReflectionPrompt';
import { router } from 'expo-router';
import { Star, Zap, Sparkles, ChevronDown, ChevronUp } from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type FlowStep = 'card-and-iching' | 'keywords-only' | 'reflection-questions';

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
      'The Creative': ['Initiative', 'Leadership', 'Power', 'Originality'],
      'The Receptive': ['Acceptance', 'Nurturing', 'Support', 'Yielding'],
      'Difficulty at the Beginning': ['New Beginnings', 'Perseverance', 'Breakthrough'],
      'Youthful Folly': ['Learning', 'Inexperience', 'Growth', 'Guidance'],
      'Waiting': ['Patience', 'Timing', 'Preparation', 'Trust'],
      'Conflict': ['Resolution', 'Compromise', 'Understanding', 'Peace'],
      'The Army': ['Organization', 'Discipline', 'Strategy', 'Leadership'],
      'Holding Together': ['Unity', 'Cooperation', 'Harmony', 'Alliance'],
      'Small Taming': ['Restraint', 'Patience', 'Gradual Progress', 'Refinement'],
      'Treading': ['Caution', 'Respect', 'Proper Conduct', 'Mindfulness'],
      'Peace': ['Harmony', 'Balance', 'Prosperity', 'Tranquility'],
      'Standstill': ['Stillness', 'Reflection', 'Pause', 'Inner Peace'],
      'Fellowship': ['Community', 'Friendship', 'Cooperation', 'Shared Goals'],
      'Great Possession': ['Abundance', 'Responsibility', 'Generosity', 'Wisdom'],
      'Modesty': ['Humility', 'Simplicity', 'Grace', 'Inner Strength'],
      'Enthusiasm': ['Inspiration', 'Motivation', 'Joy', 'Energy'],
      'Following': ['Adaptation', 'Flexibility', 'Flow', 'Acceptance'],
      'Work on the Decayed': ['Healing', 'Restoration', 'Renewal', 'Transformation'],
      'Approach': ['Progress', 'Advancement', 'Opportunity', 'Growth'],
      'Contemplation': ['Reflection', 'Observation', 'Insight', 'Meditation']
    };
    
    return keywordMap[hexagram.name] || ['Wisdom', 'Insight', 'Growth', 'Understanding'];
  };

export function TarotCardFlow({ onComplete }: { onComplete?: () => void }) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('card-and-iching');
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  
  // Only use Major Arcana cards (0-21) that have complete structured data
  const [selectedCard] = useState(() => {
    const majorArcanaCards = TAROT_CARDS.filter(card => card.suit === 'Major Arcana');
    console.log(`🔍 Total cards available: ${TAROT_CARDS.length}`);
    console.log(`🎯 Major Arcana cards filtered: ${majorArcanaCards.length}`);
    console.log(`📋 Major Arcana cards: ${majorArcanaCards.map(c => c.name).join(', ')}`);
    
    if (majorArcanaCards.length === 0) {
      console.error('❌ No Major Arcana cards found!');
      return TAROT_CARDS[0]; // Fallback
    }
    
    const randomIndex = Math.floor(Math.random() * majorArcanaCards.length);
    const selectedCard = majorArcanaCards[randomIndex];
    console.log(`🎴 Selected Major Arcana card: ${selectedCard.name} (${selectedCard.suit})`);
    return selectedCard;
  });
  
  const [selectedHexagram] = useState(() => {
    const randomIndex = Math.floor(Math.random() * I_CHING_HEXAGRAMS.length);
    return I_CHING_HEXAGRAMS[randomIndex];
  });

  // Animation values
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);
  const slideUpY = useSharedValue(50);
  const fadeIn = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  useEffect(() => {
    handleRevealCard();
  }, []);

  const handleRevealCard = () => {
    console.log('🎴 Card reveal triggered!');
    
    // Smooth entrance animation
    cardOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    cardScale.value = withSequence(
      withTiming(1.05, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.cubic) })
    );
    glowOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    slideUpY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) });
    fadeIn.value = withDelay(400, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }));
  };

  const handleToggleContent = () => {
    setIsContentExpanded(!isContentExpanded);
    contentHeight.value = withTiming(isContentExpanded ? 0 : 1, { duration: 300 });
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

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { scale: cardScale.value },
      { translateY: slideUpY.value }
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.6,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: interpolate(fadeIn.value, [0, 1], [20, 0]) }],
  }));

  const animatedExpandStyle = useAnimatedStyle(() => ({
    opacity: contentHeight.value,
    transform: [{ 
      scaleY: contentHeight.value,
    }],
  }));

  const renderCardAndIching = () => (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Glow effects */}
      <Animated.View style={[styles.glowEffect, animatedGlowStyle]} />
      
      {/* Main card - Now properly sized to show full card */}
      <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
        <LinearGradient
          colors={['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.1)', 'rgba(251, 191, 36, 0.05)']}
          style={styles.cardGradient}
        >
          <Image
            source={{ uri: selectedCard.imageUrl }}
            style={styles.cardImage}
            resizeMode="contain"
          />
        </LinearGradient>
      </Animated.View>

      {/* Card name and basic keywords */}
      <Animated.View style={[styles.cardInfoContainer, animatedContentStyle]}>
        <Text style={styles.cardName}>{selectedCard.name}</Text>
        <View style={styles.keywordsPreview}>
          {selectedCard.keywords.slice(0, 3).map((keyword, index) => (
            <View key={index} style={styles.keywordChip}>
              <Text style={styles.keywordText}>{keyword}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* I Ching info */}
      <Animated.View style={[styles.ichingContainer, animatedContentStyle]}>
        <View style={styles.ichingHeader}>
          <Sparkles size={18} color="#fbbf24" />
          <Text style={styles.ichingLabel}>I CHING WISDOM</Text>
        </View>
        <Text style={styles.ichingName}>{selectedHexagram.name}</Text>
        <Text style={styles.ichingEssence}>"{getIChingEssence(selectedHexagram)}"</Text>
      </Animated.View>

      {/* Expandable detailed content */}
      <Animated.View style={[styles.expandableSection, animatedContentStyle]}>
        <Pressable style={styles.expandButton} onPress={handleToggleContent}>
          <Text style={styles.expandButtonText}>
            {isContentExpanded ? 'Show Less' : 'Show More Details'}
          </Text>
          {isContentExpanded ? (
            <ChevronUp size={20} color="#fbbf24" />
          ) : (
            <ChevronDown size={20} color="#fbbf24" />
          )}
        </Pressable>

        <Animated.View style={[styles.expandableContent, animatedExpandStyle]}>
          <View style={styles.detailedInfo}>
            <Text style={styles.cardDescription}>{selectedCard.description}</Text>
            
            <View style={styles.allKeywordsContainer}>
              <Text style={styles.sectionTitle}>All Tarot Keywords:</Text>
              <View style={styles.allKeywordsList}>
                {selectedCard.keywords.map((keyword, index) => (
                  <View key={index} style={styles.detailedKeywordChip}>
                    <Text style={styles.detailedKeywordText}>{keyword}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Next button */}
      <Animated.View style={[styles.buttonContainer, animatedContentStyle]}>
        <Pressable style={styles.nextButton} onPress={handleShowKeywords}>
          <LinearGradient
            colors={['#fbbf24', '#f59e0b']}
            style={styles.buttonGradient}
          >
            <Text style={styles.nextButtonText}>Explore Themes</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );

  const renderKeywordsOnly = () => (
    <View style={styles.stepContainer}>
      <View style={styles.keywordsHeader}>
        <Star size={24} color="#fbbf24" />
        <Text style={styles.stepTitle}>Key Themes</Text>
        <Star size={24} color="#fbbf24" />
      </View>
      
      {/* Tarot Keywords */}
      <View style={styles.keywordsSection}>
        <View style={styles.sectionHeaderContainer}>
          <Zap size={20} color="#fbbf24" />
          <Text style={styles.sectionTitle}>Tarot Energies</Text>
        </View>
        <View style={styles.keywordsList}>
          {selectedCard.keywords.map((keyword, index) => (
            <View key={index} style={[styles.keywordItem, styles.tarotKeyword]}>
              <Text style={styles.keywordItemText}>{keyword}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* I Ching Keywords */}
      <View style={styles.keywordsSection}>
        <View style={styles.sectionHeaderContainer}>
          <Star size={20} color="#fbbf24" />
          <Text style={styles.sectionTitle}>I Ching Wisdom</Text>
        </View>
        <View style={styles.keywordsList}>
          {getIChingKeywords(selectedHexagram).map((keyword, index) => (
            <View key={index} style={[styles.keywordItem, styles.ichingKeyword]}>
              <Text style={styles.keywordItemText}>{keyword}</Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable style={styles.continueButton} onPress={handleShowReflection}>
        <LinearGradient
          colors={['#fbbf24', '#f59e0b']}
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
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={styles.container}>
        {renderCurrentStep()}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  glowEffect: {
    position: 'absolute',
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    borderRadius: 40,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    zIndex: -1,
    top: '10%',
  },
  cardContainer: {
    width: screenWidth * 0.8,
    height: screenWidth * 1.4, // Card aspect ratio (roughly 2:3)
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 3,
    backgroundColor: '#1e293b',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
  },
  cardInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  cardName: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  keywordsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  keywordChip: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  keywordText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#fbbf24',
  },
  ichingContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    marginBottom: 20,
    width: '100%',
  },
  ichingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  ichingLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#fbbf24',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ichingName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
  },
  ichingEssence: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#cbd5e1',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  expandableSection: {
    width: '100%',
    marginBottom: 24,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    gap: 8,
  },
  expandButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fbbf24',
  },
  expandableContent: {
    // Remove overflow hidden to allow full content visibility
  },
  detailedInfo: {
    padding: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 12,
    marginTop: 12,
    // Ensure no height constraints
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#cbd5e1',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  allKeywordsContainer: {
    marginTop: 16,
  },
  allKeywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  detailedKeywordChip: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  detailedKeywordText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#fbbf24',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  nextButton: {
    borderRadius: 24,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
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
    color: '#f8fafc',
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
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#f8fafc',
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
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  ichingKeyword: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  keywordItemText: {
    color: '#f8fafc',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  continueButton: {
    marginTop: 40,
    borderRadius: 24,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.5,
  },
});