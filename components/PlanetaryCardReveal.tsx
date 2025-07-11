import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View, Text, Easing, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay, runOnJS } from 'react-native-reanimated';

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

const TAROT_CARD_WIDTH = 100;
const TAROT_CARD_HEIGHT = 170;

const NUM_STARS = 200;

interface PlanetaryCardRevealProps {
  onComplete: () => void;
}

// Web-compatible component
const WebPlanetaryReveal = ({ onComplete }: PlanetaryCardRevealProps) => {
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(1);
  const starsOpacity = useSharedValue(0);

  useEffect(() => {
    // Start stars animation
    starsOpacity.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) });
    
    const sequence = setTimeout(() => {
      // Start glow effect
      glowOpacity.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });

      setTimeout(() => {
        // Reveal card
        cardOpacity.value = withTiming(1, { duration: 1000 });
        cardScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.5)) });
        glowOpacity.value = withTiming(0, { duration: 2000 });

        setTimeout(() => {
          runOnJS(onComplete)();
        }, 1500);
      }, 2000);
    }, 1000);

    return () => clearTimeout(sequence);
  }, []);

  useEffect(() => {
    textOpacity.value = withSequence(
      withDelay(1000, withTiming(0, { duration: 1000 }))
    );
  }, []);

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value
  }));

  const animatedStarsStyle = useAnimatedStyle(() => ({
    opacity: starsOpacity.value,
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.8,
    transform: [{ scale: 1 + glowOpacity.value * 0.2 }],
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Animated starfield background */}
      <Animated.View style={[styles.starField, animatedStarsStyle]} />
      
      {/* Multiple glow effects */}
      <Animated.View style={[styles.webGlow, animatedGlowStyle]} />
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
  const cardScale = useValue(0.5);
  const glowOpacity = useValue(0);
  const textOpacity = useSharedValue(1);

  // Generate random stars
  const stars = Array.from({ length: NUM_STARS }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.5 + 0.5,
  }));

  // Planet configuration
  const planets = [
    { id: 'mercury', color: '#B7A597', size: 6, orbitR: 80, speed: 1.5 },
    { id: 'venus', color: '#F8D5A3', size: 10, orbitR: 130, speed: 1.2 },
    { id: 'earth', color: '#7E99A5', size: 11, orbitR: 190, speed: 1 },
    { id: 'mars', color: '#D96941', size: 8, orbitR: 250, speed: 0.8 },
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
        // Start alignment
        alignment.current = withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.cubic) });
        glowOpacity.current = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });

        setTimeout(() => {
            // Reveal card
            cardOpacity.current = withTiming(1, { duration: 1000 });
            cardScale.current = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.5))});
            glowOpacity.current = withTiming(0, { duration: 2000 });

            setTimeout(() => {
                runOnJS(onComplete)();
            }, 1500);
        }, 2000);
    }, 3000); // Start sequence after 3s

    return () => clearTimeout(sequence);
  }, []);

  const animatedTextStyle = useAnimatedStyle(() => ({
      opacity: textOpacity.value
  }));
  
  useEffect(() => {
      textOpacity.value = withSequence(
          withDelay(1000, withTiming(0, {duration: 1000}))
      );
  }, []);

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas}>
        <Fill>
            <LinearGradient start={vec(0,0)} end={vec(width, height)} colors={['#000428', '#004e92']} />
        </Fill>

        {/* Stars */}
        {stars.map((star, i) => (
          <Circle key={i} cx={star.x} cy={star.y} r={star.r} color="white" opacity={0.8} />
        ))}

        {/* Planetary Orbits and Planets */}
        {planets.map((p) => (
            <Planet key={p.id} config={p} progress={clock} alignment={alignment} />
        ))}
        
        {/* Central Glow */}
        <Circle cx={center.x} cy={center.y} r={mix(glowOpacity.current, 0, 200)} >
            <RadialGradient c={vec(center.x, center.y)} r={200} colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0)']} />
        </Circle>

        {/* Tarot Card */}
        <Group transform={[{translateX: center.x - TAROT_CARD_WIDTH / 2}, {translateY: center.y - TAROT_CARD_HEIGHT / 2}]}>
            <Group origin={vec(TAROT_CARD_WIDTH/2, TAROT_CARD_HEIGHT/2)} transform={[{ scale: cardScale.current }]}>
                <Path path={Skia.Path.MakeRRect(Skia.RRectXY(Skia.XYWHRect(0,0,TAROT_CARD_WIDTH, TAROT_CARD_HEIGHT), 10, 10))} opacity={cardOpacity.current}>
                    <LinearGradient start={vec(0,0)} end={vec(TAROT_CARD_WIDTH, TAROT_CARD_HEIGHT)} colors={['#FBBF24', '#D97706']} />
                </Path>
            </Group>
        </Group>

      </Canvas>
      <Animated.View style={[styles.textContainer, animatedTextStyle]}>
        <Text style={styles.text}>The cosmos aligns...</Text>
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
    backgroundColor: '#000',
  },
  canvas: {
    flex: 1,
  },
  webGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -200 }, { translateY: -200 }],
  },
  webGlow2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
  },
  webCard: {
    position: 'absolute',
    width: TAROT_CARD_WIDTH + 20,
    height: TAROT_CARD_HEIGHT + 30,
    backgroundColor: '#1e40af',
    borderRadius: 15,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -(TAROT_CARD_WIDTH + 20) / 2 }, { translateY: -(TAROT_CARD_HEIGHT + 30) / 2 }],
    borderWidth: 2,
    borderColor: '#60a5fa',
  },
  starField: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'transparent',
  },
  textContainer: {
    position: 'absolute',
    bottom: '20%',
    width: '100%',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Inter-Medium',
    letterSpacing: 1,
  },
  subText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 5,
  },
}); 