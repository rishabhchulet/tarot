import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View, Text, Easing } from 'react-native';
import { Canvas, Circle, Group, useValue, Skia, Path, useClock, mix, Fill, Shader, vec, LinearGradient, RadialGradient, SkiaValue } from '@shopify/react-native-skia';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay, runOnJS } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const center = { x: width / 2, y: height / 2 };

const TAROT_CARD_WIDTH = 100;
const TAROT_CARD_HEIGHT = 170;

const NUM_STARS = 200;

interface PlanetaryCardRevealProps {
  onComplete: () => void;
}

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


export const PlanetaryCardReveal = ({ onComplete }: PlanetaryCardRevealProps) => {
  const clock = useClock();
  const alignment = useValue(0);
  const cardOpacity = useValue(0);
  const cardScale = useValue(0.5);
  const glowOpacity = useValue(0);
  const textOpacity = useSharedValue(1);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  canvas: {
    flex: 1,
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
}); 