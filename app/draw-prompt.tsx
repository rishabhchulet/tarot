import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing, withRepeat } from 'react-native-reanimated';

export default function DrawPromptScreen() {
  const glowAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);

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
  })

  const handlePress = () => {
    router.push('/draw');
  };

  return (
    <View style={styles.container}>
        <LinearGradient
            colors={['#0a0a0a', '#171717', '#0a0a0a']}
            style={StyleSheet.absoluteFill}
        />
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
            </Animated.View>
        </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        padding: 24,
    },
    glowEffect: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#8b5cf6',
        opacity: 0.3,
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
}); 