import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing, withRepeat } from 'react-native-reanimated';
import { StarfieldBackground } from '@/components/StarfieldBackground';

export default function DrawPromptScreen() {
  const glowAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);
  const shineAnimation = useSharedValue(-1);

  React.useEffect(() => {
    glowAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    scaleAnimation.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    shineAnimation.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1
    );
  }, []);

  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: glowAnimation.value * 0.8,
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
        transform: [{ scale: scaleAnimation.value }]
    }
  });

  const shineAnimatedStyle = useAnimatedStyle(() => {
    const translateX = shineAnimation.value * 300 - 100;
    return {
      transform: [{ translateX }, {rotate: '20deg'}],
      opacity: 1 - shineAnimation.value
    };
  });

  const handlePress = () => {
    router.push('/draw');
  };

  return (
    <View style={styles.container}>
        <StarfieldBackground />
        <Animated.View style={[styles.glowEffect, glowAnimatedStyle]} />
        <Text style={styles.title}>Your Daily Card Awaits</Text>
        <Text style={styles.subtitle}>Take a moment to center yourself, then tap the card to receive today's inner message.</Text>
        <Pressable onPress={handlePress}>
            <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
                <Image
                    source={require('@/assets/images/back of the deck.jpeg')}
                    style={styles.cardBackImage}
                    resizeMode="cover"
                />
                <Animated.View style={[styles.cardShine, shineAnimatedStyle]} />
            </Animated.View>
        </Pressable>
        <Pressable style={styles.skipButton} onPress={handlePress}>
          <Text style={styles.skipButtonText}>Tap card to draw</Text>
        </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#030712',
        padding: 24,
    },
    glowEffect: {
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: 300,
        backgroundColor: '#3B82F6',
        opacity: 0.15,
    },
    title: {
        fontSize: 32,
        fontFamily: 'Inter-Bold',
        color: '#F9FAFB',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'Inter-Regular',
        color: '#D1D5DB',
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 26,
        maxWidth: 320,
    },
    cardContainer: {
        width: 220,
        height: 380,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 20,
        overflow: 'hidden',
    },
    cardBackImage: {
        width: '100%',
        height: '100%',
    },
    cardShine: {
        position: 'absolute',
        top: -50,
        left: 0,
        width: 50,
        height: '150%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    skipButton: {
        position: 'absolute',
        bottom: 50,
    },
    skipButtonText: {
        fontFamily: 'Inter-Medium',
        color: '#9CA3AF',
        fontSize: 16,
    }
}); 