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
    console.log('⭐ Reflection complete callback triggered');
    // Only call onComplete, let parent handle navigation/state
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
      
      {/* FIXED: Make the entire card area clickable with proper z-index */}
      <Pressable 
        style={styles.cardTouchArea} 
        onPress={handleRevealCard}
        accessible={true}
        accessibilityLabel="Tap to reveal your message"
        accessibilityRole="button"
      >
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
              
              {/* FIXED: Tap hint positioned properly and not blocking touch */}
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

      {/* COMPACT: Smaller I Ching container */}
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
        {/* COMPACT: Smaller header */}
        <View style={styles.keywordsHeader}>
          <Text style={styles.keywordsTitle}>Your Spiritual Keywords</Text>
          <Text style={styles.keywordsSubtitle}>
            These energies are guiding you today
          </Text>
        </View>

        {/* COMPACT: Tarot Keywords Section */}
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

        {/* COMPACT: I Ching Keywords Section */}
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

        {/* COMPACT: Combined Essence */}
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

      {/* FIXED: Button positioned to be always visible */}
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
      return renderCardBack();
  }
}

const styles = StyleSheet.create({
  // OPTIMIZED: Container that ensures everything fits in viewport
  stepContainer: {
    flex: 1,
    width: '100%',
    height: screenHeight - 140, // Account for tab bar and status bar
    paddingHorizontal: 20,
    paddingVertical: 10, // REDUCED: Less vertical padding
  },
  
  // FIXED: Center container using flexbox
  cardCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // REDUCED: Less margin (was 30)
  },
  
  // FIXED: Touch area that covers the entire card and is properly positioned
  cardTouchArea: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10, // Ensure it's above other elements
    position: 'relative',
  },
  
  // INCREASED: Card container with larger dimensions
  cardContainer: {
    width: Math.min(screenWidth * 0.85, 360), // Increased from 0.75 to 0.85 and max from 300 to 360
    height: Math.min(screenHeight * 0.6, 540), // Increased from 0.5 to 0.6 and max from 450 to 540
    borderRadius: 24,
    backfaceVisibility: 'hidden',
    position: 'relative',
  },
  
  // Glow effects positioned relative to container - adjusted for larger card
  glowEffect1: {
    position: 'absolute',
    width: 240, // Increased from 200
    height: 240, // Increased from 200
    borderRadius: 120, // Increased from 100
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    top: '8%', // Adjusted positioning
    left: '3%', // Adjusted positioning
    zIndex: 1,
  },
  glowEffect2: {
    position: 'absolute',
    width: 180, // Increased from 150
    height: 180, // Increased from 150
    borderRadius: 90, // Increased from 75
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    bottom: '12%', // Adjusted positioning
    right: '5%', // Adjusted positioning
    zIndex: 1,
  },
  glowEffect3: {
    position: 'absolute',
    width: 150, // Increased from 120
    height: 150, // Increased from 120
    borderRadius: 75, // Increased from 60
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    top: '55%', // Adjusted positioning
    left: '8%', // Adjusted positioning
    zIndex: 1,
  },
  
  // Border ring effect - adjusted for larger card
  borderRing: {
    position: 'absolute',
    width: Math.min(screenWidth * 0.95, 400), // Increased from 0.85 to 0.95 and max from 340 to 400
    height: Math.min(screenWidth * 0.95, 400), // Increased from 0.85 to 0.95 and max from 340 to 400
    borderRadius: Math.min(screenWidth * 0.475, 200), // Adjusted accordingly
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
    position: 'relative',
  },
  
  // Card images
  cardBackImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cardFrontImage: {
    width: '100%',
    height: '85%', // INCREASED: Show more of the card image (was 75%)
  },
  
  // Light effects - adjusted positions for larger card
  lightEffect1: {
    position: 'absolute',
    top: 18, // Slightly adjusted
    left: 18, // Slightly adjusted
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
  lightEffect2: {
    position: 'absolute',
    top: 42, // Slightly adjusted
    right: 30, // Slightly adjusted
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    zIndex: 5,
  },
  lightEffect3: {
    position: 'absolute',
    bottom: 85, // Adjusted for larger card
    left: 36, // Slightly adjusted
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    zIndex: 5,
  },
  lightEffect4: {
    position: 'absolute',
    bottom: 85, // Adjusted for larger card
    right: 18, // Slightly adjusted
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 7,
    zIndex: 5,
  },
  
  // REDUCED: Tap hint overlay with smaller black area
  tapHintOverlay: {
    position: 'absolute',
    bottom: 12, // REDUCED: Moved up from 24 to reduce black space
    left: 18, // Slightly adjusted
    right: 18, // Slightly adjusted
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // REDUCED: Less opaque background
    paddingVertical: 8, // REDUCED: Less padding (was 14)
    paddingHorizontal: 16, // REDUCED: Less padding (was 18)
    borderRadius: 16, // Slightly smaller radius
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    zIndex: 3, // Lower than touch area
  },
  tapHint: {
    fontSize: 14, // REDUCED: Smaller font (was 16)
    fontFamily: 'Inter-SemiBold',
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
  
  // REDUCED: Card info with smaller black area
  cardInfo: {
    padding: 12, // REDUCED: Less padding (was 20)
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // REDUCED: Less opaque background
    minHeight: 60, // REDUCED: Minimum height to contain text
  },
  cardName: {
    fontSize: 22, // REDUCED: Slightly smaller (was 26)
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    textAlign: 'center',
    textShadowColor: 'rgba(245, 158, 11, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  // COMPACT: Smaller I Ching container
  ichingContainer: {
    width: '100%',
    marginBottom: 16, // REDUCED: Less margin (was 20)
  },
  ichingTitle: {
    fontSize: 16, // REDUCED: Smaller font (was 18)
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    marginBottom: 12, // REDUCED: Less margin (was 16)
  },
  ichingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12, // REDUCED: Smaller radius (was 14)
    padding: 16, // REDUCED: Less padding (was 20)
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // COMPACT: Reorganized I Ching header and content
  ichingHeader: {
    alignItems: 'center',
    marginBottom: 12, // REDUCED: Less margin (was 16)
  },
  ichingNumber: {
    fontSize: 12, // REDUCED: Smaller font (was 14)
    fontFamily: 'Inter-Medium',
    color: '#9CA3AF',
    marginBottom: 4, // REDUCED: Less margin (was 6)
  },
  ichingName: {
    fontSize: 18, // REDUCED: Smaller font (was 20)
    fontFamily: 'Inter-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
  },
  
  // COMPACT: Horizontal layout for hexagram and essence
  ichingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  hexagramSymbol: {
    gap: 2, // REDUCED: Less gap (was 3)
  },
  line: {
    height: 2, // REDUCED: Thinner lines (was 3)
    width: 50, // REDUCED: Shorter lines (was 70)
    backgroundColor: '#F59E0B',
  },
  solidLine: {
    // Solid line style
  },
  brokenLine: {
    // Broken line - create gap in middle
    borderWidth: 1,
    borderColor: '#F59E0B',
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  ichingEssence: {
    fontSize: 14, // REDUCED: Smaller font (was 16)
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  // OPTIMIZED: Keywords screen to fit in viewport
  keywordsMainContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between', // ADDED: Distribute space evenly
  },
  
  // COMPACT: Smaller header section
  keywordsHeader: {
    alignItems: 'center',
    marginBottom: 20, // REDUCED: Less space (was 40)
  },
  keywordsTitle: {
    fontSize: 28, // REDUCED: Smaller title (was 32)
    fontFamily: 'Inter-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    marginBottom: 8, // REDUCED: Less space (was 12)
    lineHeight: 32, // REDUCED: Tighter line height
  },
  keywordsSubtitle: {
    fontSize: 16, // REDUCED: Smaller subtitle (was 18)
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20, // REDUCED: Tighter line height
    maxWidth: 280,
  },
  
  // COMPACT: Smaller keyword sections
  keywordSection: {
    marginBottom: 20, // REDUCED: Less space between sections (was 36)
  },
  keywordSectionTitle: {
    fontSize: 18, // REDUCED: Smaller section titles (was 22)
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
    lineHeight: 22, // REDUCED: Tighter line height
    marginBottom: 12, // REDUCED: Less space (was 20)
  },
  
  // COMPACT: Tighter keyword grid
  keywordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10, // REDUCED: Less space between keywords (was 14)
  },
  
  // COMPACT: Smaller tarot keywords
  tarotKeyword: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 14, // REDUCED: Less padding (was 18)
    paddingVertical: 8, // REDUCED: Less padding (was 12)
    borderRadius: 18, // REDUCED: Less rounded (was 22)
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.5)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tarotKeywordText: {
    fontSize: 14, // REDUCED: Smaller text (was 16)
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    textAlign: 'center',
  },
  
  // COMPACT: Smaller I Ching keywords
  ichingKeyword: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    paddingHorizontal: 14, // REDUCED: Less padding (was 18)
    paddingVertical: 8, // REDUCED: Less padding (was 12)
    borderRadius: 18, // REDUCED: Less rounded (was 22)
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  ichingKeywordText: {
    fontSize: 14, // REDUCED: Smaller text (was 16)
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
    textAlign: 'center',
  },
  
  // COMPACT: Smaller essence container
  essenceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16, // REDUCED: Less rounded (was 20)
    padding: 20, // REDUCED: Less padding (was 28)
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
    fontSize: 16, // REDUCED: Smaller title (was 20)
    fontFamily: 'Inter-SemiBold',
    color: '#D1D5DB',
    marginBottom: 10, // REDUCED: Less space (was 16)
    textAlign: 'center',
  },
  essenceText: {
    fontSize: 20, // REDUCED: Smaller essence text (was 24)
    fontFamily: 'Inter-Bold',
    color: '#F3F4F6',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26, // REDUCED: Tighter line height
    marginBottom: 8, // REDUCED: Less space (was 12)
  },
  
  // COMPACT: Smaller essence description
  essenceDescription: {
    fontSize: 14, // REDUCED: Smaller text (was 16)
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18, // REDUCED: Tighter line height
    maxWidth: 240, // REDUCED: Narrower width
  },
  
  // FIXED: Button container to ensure visibility
  buttonContainer: {
    paddingTop: 10, // ADDED: Small padding at top
    paddingBottom: 20, // ADDED: Padding at bottom for tab bar
    alignItems: 'center',
  },
  
  // Continue button
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