import React, { useState } from 'react';
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type FlowStep = 'card-back' | 'card-and-iching' | 'keywords-only' | 'reflection-questions';

export function TarotCardFlow({ onComplete }: { onComplete?: () => void }) {
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
  const glowAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(0.8);
  const borderAnimation = useSharedValue(0);

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
    const rotateY = interpolate(flipAnimation.value, [0, 1], [180, 360], 'clamp');
    return {
      transform: [
        { scale: scaleAnimation.value },
        { rotateY: `${rotateY}deg` }
      ],
      opacity: interpolate(flipAnimation.value, [0.5, 1], [0, 1], 'clamp'),
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowAnimation.value,
      transform: [
        { scale: interpolate(glowAnimation.value, [0, 1], [0.8, 1.2], 'clamp') }
      ],
    };
  });

  const borderAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: borderAnimation.value,
      transform: [
        { scale: interpolate(borderAnimation.value, [0, 1], [0.9, 1.1], 'clamp') }
      ],
    };
  });

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

  const renderCardBack = () => (
    <View style={styles.stepContainer}>
      <Animated.View style={[styles.glowEffect1, glowAnimatedStyle]} />
      <Animated.View style={[styles.glowEffect2, glowAnimatedStyle]} />
      <Animated.View style={[styles.glowEffect3, glowAnimatedStyle]} />
      
      <Animated.View style={[styles.borderRing, borderAnimatedStyle]} />
      
      <Pressable 
        style={styles.cardTouchArea} 
        onPress={handleRevealCard}
        accessible={true}
        accessibilityLabel="Tap to reveal your message"
        accessibilityRole="button"
      >
        <Animated.View style={[styles.cardContainer, frontAnimatedStyle]}>
          <LinearGradient
            colors={['#F59E0B', '#8B5CF6', '#3B82F6', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mysticalBorder}
          >
            <View style={styles.innerBorder}>
              <Image
                source={require('@/assets/images/back of the deck.jpeg')}
                style={styles.cardBackImage}
                resizeMode="cover"
              />
              <View style={styles.lightEffect1} />
              <View style={styles.tapHintOverlay}>
                <Text style={styles.tapHint}>✨ Tap to reveal your message ✨</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );

  const renderCardAndIching = () => (
    <View style={styles.stepContainer}>
      <View style={styles.cardCenterContainer}>
        <Animated.View style={[styles.cardContainer, styles.cardFront, backAnimatedStyle]}>
          <LinearGradient
            colors={['#F59E0B', '#8B5CF6', '#3B82F6', '#F59E0B']}
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
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{selectedCard.name}</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>

      <View style={styles.ichingContainer}>
        <Text style={styles.ichingTitle}>Your I Ching Guidance</Text>
        <View style={styles.ichingCard}>
          <View style={styles.ichingHeader}>
            <Text style={styles.ichingNumber}>#{selectedHexagram.number}</Text>
            <Text style={styles.ichingName}>{selectedHexagram.name}</Text>
          </View>
          
          <View style={styles.ichingContent}>
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
    <View style={styles.stepContainer}>
      <View style={styles.keywordsMainContainer}>
        <View style={styles.keywordsHeader}>
          <Text style={styles.keywordsTitle}>Your Spiritual Keywords</Text>
          <Text style={styles.keywordsSubtitle}>
            These energies are guiding you today
          </Text>
        </View>

        <View style={styles.keywordSection}>
          <Text style={styles.keywordSectionTitle}>Tarot: {selectedCard.name}</Text>
          <View style={styles.keywordGrid}>
            {selectedCard.keywords.slice(0, 4).map((keyword, index) => (
              <View key={index} style={styles.tarotKeyword}>
                <Text style={styles.tarotKeywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.keywordSection}>
          <Text style={styles.keywordSectionTitle}>I Ching: {selectedHexagram.name}</Text>
          <View style={styles.keywordGrid}>
            {getIChingKeywords(selectedHexagram).map((keyword, index) => (
              <View key={index} style={styles.ichingKeyword}>
                <Text style={styles.ichingKeywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.essenceContainer}>
          <Text style={styles.essenceTitle}>Today's Essence</Text>
          <Text style={styles.essenceText}>
            {selectedCard.keywords[0]} • {getIChingEssence(selectedHexagram)}
          </Text>
          <Text style={styles.essenceDescription}>
            Let these energies guide your reflection today
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.continueButton} onPress={handleShowReflection}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>Begin Reflection</Text>
          </LinearGradient>
        </Pressable>
      </View>
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
      return null;
  }
}

const styles = StyleSheet.create({
  // Container styles
  stepContainer: {
    flex: 1,
    width: '100%',
    height: screenHeight - 140,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  
  cardCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  
  cardTouchArea: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    position: 'relative',
  },
  
  cardContainer: {
    width: Math.min(screenWidth * 0.85, 360),
    height: Math.min(screenHeight * 0.6, 540),
    borderRadius: 24,
    backfaceVisibility: 'hidden',
    position: 'relative',
  },
  
  // Glow effects
  glowEffect1: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    top: '8%',
    left: '3%',
    zIndex: 1,
  },
  
  glowEffect2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    bottom: '12%',
    right: '5%',
    zIndex: 1,
  },
  
  glowEffect3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    top: '55%',
    left: '8%',
    zIndex: 1,
  },
  
  borderRing: {
    position: 'absolute',
    width: Math.min(screenWidth * 0.95, 400),
    height: Math.min(screenWidth * 0.95, 400),
    borderRadius: Math.min(screenWidth * 0.475, 200),
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderStyle: 'dashed',
    zIndex: 2,
  },
  
  mysticalBorder: {
    flex: 1,
    padding: 4,
    borderRadius: 24,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 25,
    elevation: 25,
  },
  
  innerBorder: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    position: 'relative',
  },
  
  cardBackImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  
  cardFrontImage: {
    width: '100%',
    height: '85%',
  },
  
  lightEffect1: {
    position: 'absolute',
    top: 18,
    left: 18,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    zIndex: 5,
  },
  
  tapHintOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 18,
    right: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    zIndex: 3,
  },
  
  tapHint: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
  },
  
  cardFront: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  
  cardInfo: {
    padding: 12,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    minHeight: 60,
  },
  
  cardName: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    textAlign: 'center',
    textShadowColor: 'rgba(245, 158, 11, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  ichingContainer: {
    width: '100%',
    marginBottom: 16,
  },
  
  ichingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 12,
  },
  
  ichingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  ichingHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  
  ichingNumber: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  
  ichingName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
  },
  
  ichingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  
  hexagramSymbol: {
    gap: 2,
  },
  
  line: {
    height: 2,
    width: 50,
    backgroundColor: '#F59E0B',
  },
  
  solidLine: {},
  
  brokenLine: {
    borderWidth: 1,
    borderColor: '#F59E0B',
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  
  ichingEssence: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  keywordsMainContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  
  keywordsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  keywordsTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  
  keywordsSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  
  keywordSection: {
    marginBottom: 20,
  },
  
  keywordSectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  
  keywordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  
  tarotKeyword: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  tarotKeywordText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
  },
  
  ichingKeyword: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  ichingKeywordText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
    textAlign: 'center',
  },
  
  essenceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  
  essenceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#D1D5DB',
    marginBottom: 10,
    textAlign: 'center',
  },
  
  essenceText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26,
    marginBottom: 8,
  },
  
  essenceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },
  
  buttonContainer: {
    paddingTop: 10,
    paddingBottom: 20,
    alignItems: 'center',
  },
  
  continueButton: {
    borderRadius: 22,
    overflow: 'hidden',
    minWidth: 180,
  },
  
  continueButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});