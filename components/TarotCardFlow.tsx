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

type FlowStep = 'card-back' | 'card-revealed' | 'with-iching' | 'with-keywords' | 'reflection';

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
      setCurrentStep('card-revealed');
    }, 400);
  };

  const handleShowIching = () => {
    setCurrentStep('with-iching');
  };

  const handleShowKeywords = () => {
    setCurrentStep('with-keywords');
  };

  const handleShowReflection = () => {
    setCurrentStep('reflection');
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

  const renderCardBack = () => (
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
  );

  const renderCardRevealed = () => (
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

      <View style={styles.description}>
        <Text style={styles.descriptionText}>{selectedCard.description}</Text>
      </View>

      <Pressable style={styles.continueButton} onPress={handleShowIching}>
        <LinearGradient
          colors={['#3B82F6', '#1D4ED8']}
          style={styles.continueButtonGradient}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  const renderWithIching = () => (
    <View style={styles.fullContainer}>
      <View style={styles.cardContainer}>
        <View style={[styles.card, styles.cardFront]}>
          <Image
            source={{ uri: selectedCard.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{selectedCard.name}</Text>
          </View>
        </View>
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
        </View>
      </View>

      <Pressable style={styles.continueButton} onPress={handleShowKeywords}>
        <LinearGradient
          colors={['#3B82F6', '#1D4ED8']}
          style={styles.continueButtonGradient}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );

  const renderWithKeywords = () => (
    <View style={styles.fullContainer}>
      <View style={styles.cardContainer}>
        <View style={[styles.card, styles.cardFront]}>
          <Image
            source={{ uri: selectedCard.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{selectedCard.name}</Text>
            <View style={styles.keywords}>
              {selectedCard.keywords.map((keyword, index) => (
                <View key={index} style={styles.keyword}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
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
          <Text style={styles.ichingMeaning}>{selectedHexagram.meaning}</Text>
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

  const renderReflection = () => (
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
    case 'card-revealed':
      return renderCardRevealed();
    case 'with-iching':
      return renderWithIching();
    case 'with-keywords':
      return renderWithKeywords();
    case 'reflection':
      return renderReflection();
    default:
      return renderCardBack();
  }
}

const styles = StyleSheet.create({
  fullContainer: {
    alignItems: 'center',
    paddingVertical: 20,
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
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 24,
    fontFamily: 'CormorantGaramond-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  keyword: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  keywordText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  description: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  descriptionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    lineHeight: 24,
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
  ichingMeaning: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 24,
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