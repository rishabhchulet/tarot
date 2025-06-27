import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  const glowAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(0.8);
  const borderAnimation = useSharedValue(0);

  const handleRevealCard = () => {
    // Start the magical sequence
    glowAnimation.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    borderAnimation.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });
    
    // Scale up slightly before flip
    scaleAnimation.value = withSequence(
      withTiming(1.05, { duration: 800, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.cubic) })
    );
    
    // Delayed flip animation for more dramatic effect
    flipAnimation.value = withDelay(1200, withTiming(1, { 
      duration: 1200, 
      easing: Easing.inOut(Easing.cubic) 
    }));
    
    // Change step after the full animation sequence
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
    console.log('Reflection completed');
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
    <View style={styles.stepContainer}>
      {/* Background Effects */}
      <Animated.View style={[styles.glowEffect1, glowAnimatedStyle]} />
      <Animated.View style={[styles.glowEffect2, glowAnimatedStyle]} />
      <Animated.View style={[styles.glowEffect3, glowAnimatedStyle]} />
      
      {/* Animated Border Ring */}
      <Animated.View style={[styles.borderRing, borderAnimatedStyle]} />
      
      {/* Card Container - Centered */}
      <View style={styles.cardCenterContainer}>
        <Pressable style={styles.cardTouchArea} onPress={handleRevealCard}>
          <Animated.View style={[styles.cardContainer, frontAnimatedStyle]}>
            {/* Mystical Border */}
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
                {/* Floating Light Effects */}
                <View style={styles.lightEffect1} />
                <View style={styles.lightEffect2} />
                <View style={styles.lightEffect3} />
                <View style={styles.lightEffect4} />
              </View>
            </LinearGradient>
            <View style={styles.tapHintOverlay}>
              <Text style={styles.tapHint}>✨ Tap to reveal your destiny ✨</Text>
            </View>
          </Animated.View>
        </Pressable>
      </View>
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
    <View style={styles.stepContainer}>
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
      return renderCardBack();
  }
}

const styles = StyleSheet.create({
  // FIXED: Remove problematic container styling - let parent handle layout
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: '100%',
  },
  
  // FIXED: Center container using flexbox instead of absolute positioning
  cardCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  
  // Card touch area for better interaction
  cardTouchArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Main card container - Properly sized
  cardContainer: {
    width: Math.min(screenWidth * 0.8, 320), // 80% of screen width, max 320px
    height: Math.min(screenHeight * 0.55, 480), // 55% of screen height, max 480px
    borderRadius: 24,
    backfaceVisibility: 'hidden',
  },
  
  // Glow effects positioned relative to container
  glowEffect1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    top: '10%',
    left: '5%',
    zIndex: 1,
  },
  glowEffect2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    bottom: '15%',
    right: '8%',
    zIndex: 1,
  },
  glowEffect3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    top: '60%',
    left: '10%',
    zIndex: 1,
  },
  
  // Border ring effect - Positioned around the card
  borderRing: {
    position: 'absolute',
    width: Math.min(screenWidth * 0.9, 360),
    height: Math.min(screenWidth * 0.9, 360),
    borderRadius: Math.min(screenWidth * 0.45, 180),
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderStyle: 'dashed',
    zIndex: 2,
  },
  
  // Mystical border with enhanced glow
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
  
  // Inner border
  innerBorder: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  
  // Card images
  cardBackImage: {
    width: '100%',
    height: '100%',
  },
  cardFrontImage: {
    width: '100%',
    height: '75%',
  },
  
  // Light effects
  lightEffect1: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  lightEffect2: {
    position: 'absolute',
    top: 35,
    right: 25,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  lightEffect3: {
    position: 'absolute',
    bottom: 50,
    left: 30,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  lightEffect4: {
    position: 'absolute',
    bottom: 25,
    right: 15,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 7,
  },
  
  // Tap hint overlay
  tapHintOverlay: {
    position: 'absolute',
    bottom: 25,
    left: 15,
    right: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  tapHint: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
  },
  
  // Card front styling
  cardFront: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  
  // Card info
  cardInfo: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  cardName: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F59E0B',
    textAlign: 'center',
    textShadowColor: 'rgba(245, 158, 11, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  // I Ching container - Positioned normally in layout
  ichingContainer: {
    width: '100%',
    marginBottom: 20,
  },
  ichingTitle: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 16,
  },
  ichingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ichingNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 6,
  },
  ichingName: {
    fontSize: 20,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 16,
  },
  hexagramSymbol: {
    marginBottom: 16,
    gap: 3,
  },
  line: {
    height: 3,
    width: 70,
    backgroundColor: '#F59E0B',
  },
  solidLine: {
    // Solid line style
  },
  brokenLine: {
    // Broken line - create gap in middle
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  ichingEssence: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Keywords screen
  keywordsMainContainer: {
    flex: 1,
    width: '100%',
    paddingVertical: 20,
  },
  keywordsTitle: {
    fontSize: 26,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 6,
  },
  keywordsSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 28,
  },
  keywordSection: {
    marginBottom: 28,
  },
  keywordSectionHeader: {
    marginBottom: 14,
  },
  keywordSectionTitle: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
  },
  keywordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  tarotKeyword: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  tarotKeywordText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
  },
  ichingKeyword: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  ichingKeywordText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  essenceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  essenceTitle: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond-SemiBold',
    color: '#D1D5DB',
    marginBottom: 10,
  },
  essenceText: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // Continue button - Normal layout positioning
  continueButton: {
    borderRadius: 22,
    overflow: 'hidden',
    minWidth: 180,
    alignSelf: 'center',
    marginTop: 20,
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