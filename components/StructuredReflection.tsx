import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { MessageCircle, RefreshCw, Sparkles, Star, Zap } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Beautiful Planetary Loading Animation Component
const PlanetaryLoadingAnimation = ({ cardName, hexagramName, isReversed }) => {
  const rotation = useSharedValue(0);
  const planetScale = useSharedValue(0.8);
  const glowPulse = useSharedValue(0.7);
  const textOpacity = useSharedValue(0);
  const orbitRotation = useSharedValue(0);

  useEffect(() => {
    // Main rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );

    // Orbit rotation (slower)
    orbitRotation.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );

    // Planet scale animation
    planetScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Glow pulse animation
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Text fade in
    textOpacity.value = withDelay(300, withTiming(1, { duration: 800 }));
  }, []);

  const animatedRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedOrbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${orbitRotation.value}deg` }],
  }));

  const animatedPlanetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: planetScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
    transform: [{ scale: 1 + glowPulse.value * 0.2 }],
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={loadingStyles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Central Glow */}
      <Animated.View style={[loadingStyles.centralGlow, animatedGlowStyle]} />
      
      {/* Outer Orbit */}
      <Animated.View style={[loadingStyles.outerOrbit, animatedOrbitStyle]}>
        <View style={loadingStyles.outerPlanet} />
      </Animated.View>
      
      {/* Middle Orbit */}
      <Animated.View style={[loadingStyles.middleOrbit, animatedRotationStyle]}>
        <Animated.View style={[loadingStyles.middlePlanet, animatedPlanetStyle]} />
      </Animated.View>
      
      {/* Inner Orbit */}
      <Animated.View style={[loadingStyles.innerOrbit, animatedOrbitStyle]}>
        <View style={loadingStyles.innerPlanet} />
      </Animated.View>
      
      {/* Center Core */}
      <Animated.View style={[loadingStyles.centerCore, animatedPlanetStyle]}>
        <Sparkles size={24} color="#fbbf24" />
      </Animated.View>
      
      {/* Floating Stars */}
      {[...Array(8)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            loadingStyles.floatingStar,
            {
              left: 50 + (i * 40),
              top: 100 + (i % 3) * 80,
              animationDelay: `${i * 200}ms`,
            },
            animatedGlowStyle,
          ]}
        >
          <Star size={8} color="#fbbf24" fill="#fbbf24" />
        </Animated.View>
      ))}
      
      {/* Text Content */}
      <Animated.View style={[loadingStyles.textContainer, animatedTextStyle]}>
        <Text style={loadingStyles.title}>Weaving Cosmic Wisdom</Text>
        <Text style={loadingStyles.subtitle}>
          Synthesizing {cardName} {isReversed ? '(reversed)' : ''} with {hexagramName}
        </Text>
        <View style={loadingStyles.progressDots}>
          <View style={[loadingStyles.dot, loadingStyles.dotActive]} />
          <View style={[loadingStyles.dot, loadingStyles.dotActive]} />
          <View style={[loadingStyles.dot]} />
        </View>
      </Animated.View>
    </View>
  );
};

interface StructuredReflectionProps {
  cardName: string;
  hexagramName: string;
  isReversed?: boolean;
  onReflectionGenerated?: (reflectionPrompt: string) => void;
}

interface StructuredReflectionResponse {
  iChingReflection: string;
  tarotReflection: string;
  synthesis: string;
  reflectionPrompt: string;
}

export function StructuredReflection({ 
  cardName, 
  hexagramName, 
  isReversed = false, 
  onReflectionGenerated 
}: StructuredReflectionProps) {
  const [reflection, setReflection] = useState<StructuredReflectionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const fadeIn1 = useSharedValue(0);
  const fadeIn2 = useSharedValue(0);
  const fadeIn3 = useSharedValue(0);
  const fadeIn4 = useSharedValue(0);
  const glow = useSharedValue(0.5);

  useEffect(() => {
    // Start glow animation
    glow.value = withTiming(1, { 
      duration: 2000, 
      easing: Easing.inOut(Easing.ease) 
    });
    
    generateReflection();
  }, [cardName, hexagramName, isReversed]);

  const generateReflection = async () => {
    setLoading(true);
    setError(null);
    
    // Reset animations
    fadeIn1.value = 0;
    fadeIn2.value = 0;
    fadeIn3.value = 0;
    fadeIn4.value = 0;

    try {
      // Import the function dynamically to avoid import issues
      const { getStructuredReflection } = await import('@/utils/structuredAI');
      
      const { reflection: aiReflection, error: aiError } = await getStructuredReflection(
        cardName,
        hexagramName,
        isReversed
      );

      if (aiError) {
        throw new Error(aiError);
      }

      if (aiReflection) {
        setReflection(aiReflection);
        
        // Send the reflection prompt to parent if callback provided
        if (onReflectionGenerated && aiReflection.reflectionPrompt) {
          onReflectionGenerated(aiReflection.reflectionPrompt);
        }
        
        // Stagger the animations
        fadeIn1.value = withDelay(200, withTiming(1, { duration: 800 }));
        fadeIn2.value = withDelay(400, withTiming(1, { duration: 800 }));
        fadeIn3.value = withDelay(600, withTiming(1, { duration: 800 }));
        fadeIn4.value = withDelay(800, withTiming(1, { duration: 800 }));
      } else {
        throw new Error('No reflection generated');
      }
    } catch (err: any) {
      console.error('Error generating structured reflection:', err);
      setError(err.message || 'Failed to generate reflection');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    generateReflection();
  };

  // Animated styles
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const fade1Style = useAnimatedStyle(() => ({
    opacity: fadeIn1.value,
    transform: [{ translateY: (1 - fadeIn1.value) * 20 }],
  }));

  const fade2Style = useAnimatedStyle(() => ({
    opacity: fadeIn2.value,
    transform: [{ translateY: (1 - fadeIn2.value) * 20 }],
  }));

  const fade3Style = useAnimatedStyle(() => ({
    opacity: fadeIn3.value,
    transform: [{ translateY: (1 - fadeIn3.value) * 20 }],
  }));

  const fade4Style = useAnimatedStyle(() => ({
    opacity: fadeIn4.value,
    transform: [{ translateY: (1 - fadeIn4.value) * 20 }],
  }));

  if (loading) {
    return (
      <PlanetaryLoadingAnimation 
        cardName={cardName} 
        hexagramName={hexagramName} 
        isReversed={isReversed} 
      />
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MessageCircle size={48} color="#fda4af" />
          <Text style={styles.errorTitle}>Unable to Generate Reflection</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={handleRetry} style={styles.retryButton}>
            <RefreshCw size={20} color="#f9fafb" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!reflection) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glow, glowStyle]} />
      
      {/* I Ching Section */}
      <Animated.View style={[styles.section, fade1Style]}>
        <View style={styles.sectionHeader}>
          <Star size={16} color="#fbbf24" />
          <Text style={styles.sectionTitle}>I CHING REFLECTION</Text>
        </View>
        <Text style={styles.reflectionText}>{reflection.iChingReflection}</Text>
      </Animated.View>

      {/* Tarot Section */}
      <Animated.View style={[styles.section, fade2Style]}>
        <View style={styles.sectionHeader}>
          <Zap size={16} color="#fbbf24" />
          <Text style={styles.sectionTitle}>TAROT REFLECTION</Text>
        </View>
        <Text style={styles.reflectionText}>{reflection.tarotReflection}</Text>
      </Animated.View>

      {/* Synthesis Section */}
      <Animated.View style={[styles.section, styles.synthesisSection, fade3Style]}>
        <View style={styles.sectionHeader}>
          <Sparkles size={16} color="#fbbf24" />
          <Text style={styles.sectionTitle}>SYNTHESIS</Text>
        </View>
        <Text style={styles.synthesisText}>{reflection.synthesis}</Text>
      </Animated.View>

      {/* Reflection Prompt Section */}
      <Animated.View style={[styles.section, styles.promptSection, fade4Style]}>
        <View style={styles.sectionHeader}>
          <MessageCircle size={16} color="#fbbf24" />
          <Text style={styles.sectionTitle}>YOUR REFLECTION PROMPT</Text>
        </View>
        <Text style={styles.promptText}>"{reflection.reflectionPrompt}"</Text>
      </Animated.View>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
    position: 'relative',
  },
  centralGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    zIndex: 0,
  },
  outerOrbit: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  outerPlanet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    marginTop: -4,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  middleOrbit: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  middlePlanet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fbbf24',
    marginTop: -6,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  innerOrbit: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  innerPlanet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d97706',
    marginTop: -3,
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  centerCore: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    zIndex: 10,
  },
  floatingStar: {
    position: 'absolute',
    opacity: 0.6,
  },
  textContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
  },
  dotActive: {
    backgroundColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 30,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    zIndex: -1,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#fbbf24',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  reflectionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#e2e8f0',
    lineHeight: 24,
  },
  synthesisSection: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  synthesisText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#f1f5f9',
    lineHeight: 24,
  },
  promptSection: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 2,
  },
  promptText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fbbf24',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.2)',
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#f8fafc',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fbbf24',
  },
}); 