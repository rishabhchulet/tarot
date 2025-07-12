import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View, Text, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay, runOnJS, Easing } from 'react-native-reanimated';

// Import Skia components at the top level for proper hook usage
let Canvas, Circle, Group, useValue, Skia, Path, useClock, mix, Fill, vec, LinearGradient, RadialGradient;

// Only import Skia on native platforms
if (Platform.OS !== 'web') {
  try {
    const SkiaModule = require('@shopify/react-native-skia');
    Canvas = SkiaModule.Canvas;
    Circle = SkiaModule.Circle;
    Group = SkiaModule.Group;
    useValue = SkiaModule.useValue;
    Skia = SkiaModule.Skia;
    Path = SkiaModule.Path;
    useClock = SkiaModule.useClock;
    mix = SkiaModule.mix;
    Fill = SkiaModule.Fill;
    vec = SkiaModule.vec;
    LinearGradient = SkiaModule.LinearGradient;
    RadialGradient = SkiaModule.RadialGradient;
  } catch (error) {
    console.warn('Skia not available:', error);
  }
}

const { width, height } = Dimensions.get('window');
const center = { x: width / 2, y: height / 2 };

const TAROT_CARD_WIDTH = 120;
const TAROT_CARD_HEIGHT = 200;

const NUM_STARS = 150;

interface PlanetaryCardRevealProps {
  onComplete: () => void;
}

// Web-compatible component with modern styling
const WebPlanetaryReveal = ({ onComplete }: PlanetaryCardRevealProps) => {
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.7);
  const glowOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(1);
  const starsOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Start stars animation
    starsOpacity.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });
    
    // Pulse animation
    pulseScale.value = withSequence(
      withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
    );
    
    const sequence = setTimeout(() => {
      // Start glow effect
      glowOpacity.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });

      setTimeout(() => {
        // Reveal card with smooth animation
        cardOpacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
        cardScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.2)) });
        glowOpacity.value = withTiming(0.3, { duration: 1500 });

        setTimeout(() => {
          runOnJS(onComplete)();
        }, 1200);
      }, 1500);
    }, 800);

    return () => clearTimeout(sequence);
  }, []);

  useEffect(() => {
    textOpacity.value = withSequence(
      withDelay(800, withTiming(0, { duration: 800 }))
    );
  }, []);

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: (1 - textOpacity.value) * 20 }],
  }));

  const animatedStarsStyle = useAnimatedStyle(() => ({
    opacity: starsOpacity.value,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.8,
    transform: [{ scale: 1 + glowOpacity.value * 0.3 }],
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Animated starfield background */}
      <Animated.View style={[styles.starField, animatedStarsStyle]}>
        {Array.from({ length: NUM_STARS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                opacity: Math.random() * 0.8 + 0.2,
              },
            ]}
          />
        ))}
      </Animated.View>
      
      {/* Multiple glow effects */}
      <Animated.View style={[styles.webGlow, animatedGlowStyle, animatedPulseStyle]} />
      <Animated.View style={[styles.webGlow2, animatedGlowStyle]} />
      
      {/* Card */}
      <Animated.View style={[styles.webCard, animatedCardStyle]} />
      
      {/* Text */}
      <Animated.View style={[styles.textContainer, animatedTextStyle]}>
        <Text style={styles.text}>The cosmos aligns...</Text>
        <Text style={styles.subText}>Preparing your mystical revelation</Text>
      </Animated.View>
    </View>
  );
};

// Skia component for native platforms
const SkiaPlanetaryReveal = ({ onComplete }: PlanetaryCardRevealProps) => {
  // Check if Skia is available
  if (!Canvas || !useValue || !useClock) {
    // Fallback to web version if Skia is not available
    return <WebPlanetaryReveal onComplete={onComplete} />;
  }

  const clock = useClock();
  const alignment = useValue(0);
  const cardOpacity = useValue(0);
  const cardScale = useValue(0.7);
  const glowOpacity = useValue(0);
  const textOpacity = useSharedValue(1);

  // Generate random stars
  const stars = Array.from({ length: NUM_STARS }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.5 + 0.5,
  }));

  // Planet configuration with golden theme
  const planets = [
    { id: 'mercury', color: '#fbbf24', size: 6, orbitR: 80, speed: 1.5 },
    { id: 'venus', color: '#f59e0b', size: 10, orbitR: 130, speed: 1.2 },
    { id: 'earth', color: '#d97706', size: 11, orbitR: 190, speed: 1 },
    { id: 'mars', color: '#fbbf24', size: 8, orbitR: 250, speed: 0.8 },
  ];

  const Planet = ({ config, progress, alignment }) => {
    const orbitPath = Skia.Path.Make();
    orbitPath.addOval({ x: center.x - config.orbitR, y: center.y - config.orbitR, width: config.orbitR * 2, height: config.orbitR * 2 });

    const pos = useValue({ x: 0, y: 0 });

    useClock(clock => {
      const totalTime = 10000 / config.speed;
      const currentProgress = (clock.current % totalTime) / totalTime;
      const point = orbitPath.getPoint(currentProgress);
      
      const alignmentProgress = Easing.inOut(Easing.ease)(alignment.current);

      pos.current = {
        x: mix(alignmentProgress, point.x, center.x),
        y: mix(alignmentProgress, point.y, center.y),
      };
    });

    return (
      <Circle cx={pos.current.x} cy={pos.current.y} r={config.size} color={config.color}>
          <RadialGradient c={vec(pos.current.x, pos.current.y)} r={config.size * 2} colors={[`${config.color}FF`, `${config.color}00`]} />
      </Circle>
    );
  };

  useEffect(() => {
    const sequence = setTimeout(() => {
        // Start alignment with smoother timing
        alignment.current = withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.cubic) });
        glowOpacity.current = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });

        setTimeout(() => {
            // Reveal card
            cardOpacity.current = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
            cardScale.current = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.2))});
            glowOpacity.current = withTiming(0.3, { duration: 1500 });

            setTimeout(() => {
                runOnJS(onComplete)();
            }, 1200);
        }, 1500);
    }, 2000); // Reduced start delay

    return () => clearTimeout(sequence);
  }, []);

  const animatedTextStyle = useAnimatedStyle(() => ({
      opacity: textOpacity.value,
      transform: [{ translateY: (1 - textOpacity.value) * 20 }],
  }));
  
  useEffect(() => {
      textOpacity.value = withSequence(
          withDelay(800, withTiming(0, {duration: 800}))
      );
  }, []);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Fill>
            <LinearGradient start={vec(0,0)} end={vec(width, height)} colors={['#0f172a', '#1e293b']} />
        </Fill>

        {/* Stars */}
        {stars.map((star, i) => (
          <Circle key={i} cx={star.x} cy={star.y} r={star.r} color="#fbbf24" opacity={0.6} />
        ))}

        {/* Planetary Orbits and Planets */}
        {planets.map((p) => (
            <Planet key={p.id} config={p} progress={clock} alignment={alignment} />
        ))}
        
        {/* Central Glow */}
        <Circle cx={center.x} cy={center.y} r={mix(glowOpacity.current, 0, 180)} >
            <RadialGradient c={vec(center.x, center.y)} r={180} colors={['rgba(251, 191, 36, 0.4)', 'rgba(251, 191, 36, 0)']} />
        </Circle>

        {/* Tarot Card */}
        <Group transform={[{translateX: center.x - TAROT_CARD_WIDTH / 2}, {translateY: center.y - TAROT_CARD_HEIGHT / 2}]}>
            <Group origin={vec(TAROT_CARD_WIDTH/2, TAROT_CARD_HEIGHT/2)} transform={[{ scale: cardScale.current }]}>
                <Path path={Skia.Path.MakeRRect(Skia.RRectXY(Skia.XYWHRect(0,0,TAROT_CARD_WIDTH, TAROT_CARD_HEIGHT), 12, 12))} opacity={cardOpacity.current}>
                    <LinearGradient start={vec(0,0)} end={vec(TAROT_CARD_WIDTH, TAROT_CARD_HEIGHT)} colors={['#fbbf24', '#f59e0b']} />
                </Path>
            </Group>
        </Group>

      </Canvas>
      <Animated.View style={[styles.textContainer, animatedTextStyle]}>
        <Text style={styles.text}>The cosmos aligns...</Text>
        <Text style={styles.subText}>Preparing your mystical revelation</Text>
      </Animated.View>
    </View>
  );
};

export const PlanetaryCardReveal = ({ onComplete }: PlanetaryCardRevealProps) => {
  // Use platform-specific implementation
  if (Platform.OS === 'web') {
    return <WebPlanetaryReveal onComplete={onComplete} />;
  } else {
    return <SkiaPlanetaryReveal onComplete={onComplete} />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  canvas: {
    flex: 1,
  },
  starField: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'transparent',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#fbbf24',
    borderRadius: 1,
  },
  webGlow: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -175 }, { translateY: -175 }],
  },
  webGlow2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -125 }, { translateY: -125 }],
  },
  webCard: {
    position: 'absolute',
    width: TAROT_CARD_WIDTH,
    height: TAROT_CARD_HEIGHT,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -TAROT_CARD_WIDTH / 2 }, { translateY: -TAROT_CARD_HEIGHT / 2 }],
    borderWidth: 2,
    borderColor: '#f59e0b',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  textContainer: {
    position: 'absolute',
    bottom: '20%',
    width: '100%',
    alignItems: 'center',
  },
  text: {
    color: '#f8fafc',
    fontSize: 22,
    fontFamily: 'Inter-SemiBold',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
}); 