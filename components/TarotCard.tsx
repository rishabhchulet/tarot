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
import { ReflectionPrompt } from './ReflectionPrompt';

interface TarotCardProps {
  onReflectionComplete: () => void;
}

export function TarotCard({ onReflectionComplete }: TarotCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [selectedCard] = useState(() => {
    const randomIndex = Math.floor(Math.random() * TAROT_CARDS.length);
    return TAROT_CARDS[randomIndex];
  });

  const flipAnimation = useSharedValue(0);

  const handleFlip = () => {
    if (!isFlipped) {
      flipAnimation.value = withTiming(1, { duration: 800 });
      setIsFlipped(true);
      setTimeout(() => {
        setShowReflection(true);
      }, 1000);
    }
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

  return (
    <View style={styles.container}>
      <Pressable style={styles.cardContainer} onPress={handleFlip}>
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

        <Animated.View style={[styles.card, styles.cardFront, backAnimatedStyle]}>
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
        </Animated.View>
      </Pressable>

      {isFlipped && (
        <View style={styles.description}>
          <Text style={styles.descriptionText}>{selectedCard.description}</Text>
        </View>
      )}

      {showReflection && (
        <ReflectionPrompt
          card={selectedCard}
          onComplete={onReflectionComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cardContainer: {
    width: 250,
    height: 400,
    position: 'relative',
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
    marginTop: 24,
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
});