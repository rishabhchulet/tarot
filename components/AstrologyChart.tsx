import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Svg, Circle, Text as SvgText, G, Line, Defs, RadialGradient, Stop, Path } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat, 
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { PlanetPosition, getZodiacSign } from '@/utils/astrologyCalculations';

interface AstrologyChartProps {
  positions: PlanetPosition[];
}

const ZODIAC_SIGNS = [
  { sign: '♈', name: 'Aries', element: 'Fire', color: '#FF6B6B', degrees: '0°' },
  { sign: '♉', name: 'Taurus', element: 'Earth', color: '#4ECDC4', degrees: '30°' },
  { sign: '♊', name: 'Gemini', element: 'Air', color: '#45B7D1', degrees: '60°' },
  { sign: '♋', name: 'Cancer', element: 'Water', color: '#96CEB4', degrees: '90°' },
  { sign: '♌', name: 'Leo', element: 'Fire', color: '#FECA57', degrees: '120°' },
  { sign: '♍', name: 'Virgo', element: 'Earth', color: '#48CAE4', degrees: '150°' },
  { sign: '♎', name: 'Libra', element: 'Air', color: '#C4B5FD', degrees: '180°' },
  { sign: '♏', name: 'Scorpio', element: 'Water', color: '#F093FB', degrees: '210°' },
  { sign: '♐', name: 'Sagittarius', element: 'Fire', color: '#F8AD9D', degrees: '240°' },
  { sign: '♑', name: 'Capricorn', element: 'Earth', color: '#83D475', degrees: '270°' },
  { sign: '♒', name: 'Aquarius', element: 'Air', color: '#74B9FF', degrees: '300°' },
  { sign: '♓', name: 'Pisces', element: 'Water', color: '#A29BFE', degrees: '330°' },
];

const PLANET_GLYPHS: { [key: string]: { symbol: string; color: string } } = {
  Sun: { symbol: '☉', color: '#FFD700' },
  Moon: { symbol: '☽', color: '#E6E6FA' },
  Mercury: { symbol: '☿', color: '#FFA500' },
  Venus: { symbol: '♀', color: '#FF69B4' },
  Mars: { symbol: '♂', color: '#FF4500' },
  Jupiter: { symbol: '♃', color: '#9370DB' },
  Saturn: { symbol: '♄', color: '#4682B4' },
  Uranus: { symbol: '♅', color: '#40E0D0' },
  Neptune: { symbol: '♆', color: '#4169E1' },
  Pluto: { symbol: '♇', color: '#8B0000' },
};

const AstrologyChart: React.FC<AstrologyChartProps> = ({ positions }) => {
  const { width } = Dimensions.get('window');
  const size = Math.min(width - 40, 400);
  const center = size / 2;
  const outerRadius = size / 2 - 30; // Increased margin for better spacing
  const innerRadius = outerRadius - 40;
  const planetRadius = outerRadius - 15; // Adjusted for better planet positioning

  // Animation values
  const rotation = useSharedValue(0);
  const glowPulse = useSharedValue(0.7);
  const planetScale = useSharedValue(0);

  useEffect(() => {
    // Subtle rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 120000, easing: Easing.linear }), // 2 minutes per rotation
      -1,
      false
    );

    // Glow pulse animation
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Planet entrance animation
    planetScale.value = withTiming(1, { 
      duration: 1500, 
      easing: Easing.out(Easing.back(1.2)) 
    });
  }, []);

  const animatedChartStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
  }));

  const getCoordinates = (degree: number, radius: number) => {
    const angleRad = (degree - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
    };
  };

  const createHousePath = (startDegree: number, endDegree: number) => {
    const startOuter = getCoordinates(startDegree, outerRadius);
    const endOuter = getCoordinates(endDegree, outerRadius);
    const startInner = getCoordinates(startDegree, innerRadius);
    const endInner = getCoordinates(endDegree, innerRadius);

    return `M ${startOuter.x} ${startOuter.y} 
            A ${outerRadius} ${outerRadius} 0 0 1 ${endOuter.x} ${endOuter.y}
            L ${endInner.x} ${endInner.y}
            A ${innerRadius} ${innerRadius} 0 0 0 ${startInner.x} ${startInner.y}
            Z`;
  };

  return (
    <View style={styles.container}>
      {/* Chart explanation */}
      <View style={styles.explanationContainer}>
        <Text style={styles.explanationTitle}>Birth Chart Wheel</Text>
        <Text style={styles.explanationText}>
          Your planets' positions at the moment of birth, showing their zodiac signs and degrees
        </Text>
      </View>

      {/* Main chart container with proper layering */}
      <View style={styles.chartWrapper}>
        {/* Background glow effect */}
        <Animated.View style={[styles.backgroundGlow, animatedGlowStyle]} />
        
        {/* Rotating chart background */}
        <Animated.View style={[styles.chartContainer, animatedChartStyle]}>
          <Svg height={size} width={size} style={styles.svgChart}>
            <Defs>
              <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <Stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
              </RadialGradient>
              <RadialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgba(251,191,36,0.1)" />
                <Stop offset="100%" stopColor="rgba(251,191,36,0.02)" />
              </RadialGradient>
            </Defs>

            {/* Background circles with gradients */}
            <Circle cx={center} cy={center} r={outerRadius} fill="url(#outerGlow)" />
            <Circle cx={center} cy={center} r={innerRadius} fill="url(#centerGlow)" />
            
            {/* Zodiac house divisions */}
            {ZODIAC_SIGNS.map((sign, index) => {
              const startDegree = index * 30;
              const endDegree = (index + 1) * 30;
              const path = createHousePath(startDegree, endDegree);
              
              return (
                <Path
                  key={`house-${sign.name}`}
                  d={path}
                  fill={`${sign.color}10`}
                  stroke={`${sign.color}30`}
                  strokeWidth="0.5"
                />
              );
            })}

            {/* Outer ring */}
            <Circle 
              cx={center} 
              cy={center} 
              r={outerRadius} 
              stroke="rgba(255,255,255,0.6)" 
              strokeWidth="2" 
              fill="transparent" 
            />
            
            {/* Inner ring */}
            <Circle 
              cx={center} 
              cy={center} 
              r={innerRadius} 
              stroke="rgba(255,255,255,0.4)" 
              strokeWidth="1" 
              fill="transparent" 
            />

            {/* House division lines with degree markers */}
            {Array.from({ length: 12 }, (_, i) => {
              const degree = i * 30;
              const outer = getCoordinates(degree, outerRadius);
              const inner = getCoordinates(degree, innerRadius);
              const degreeMarker = getCoordinates(degree, outerRadius + 15);
              
              return (
                <G key={`division-${i}`}>
                  <Line
                    x1={outer.x}
                    y1={outer.y}
                    x2={inner.x}
                    y2={inner.y}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                  />
                  {/* Degree markers */}
                  <SvgText
                    x={degreeMarker.x}
                    y={degreeMarker.y}
                    fontSize="10"
                    fill="rgba(255,255,255,0.6)"
                    textAnchor="middle"
                    alignmentBaseline="central"
                    fontFamily="Inter-Medium"
                  >
                    {degree}°
                  </SvgText>
                </G>
              );
            })}
            
            {/* Zodiac Signs */}
            {ZODIAC_SIGNS.map((sign, index) => {
              const degree = index * 30 + 15;
              const coords = getCoordinates(degree, outerRadius + 25);
              return (
                <SvgText
                  key={sign.name}
                  x={coords.x}
                  y={coords.y}
                  fontSize="20"
                  fill={sign.color}
                  textAnchor="middle"
                  alignmentBaseline="central"
                  fontWeight="bold"
                >
                  {sign.sign}
                </SvgText>
              );
            })}

            {/* Center point */}
            <Circle cx={center} cy={center} r="4" fill="rgba(251,191,36,0.8)" />
          </Svg>
        </Animated.View>

        {/* Static planets overlay (non-rotating) */}
        <View style={styles.planetsContainer}>
          <Svg height={size} width={size} style={styles.svgPlanets}>
            {positions.map((planet) => {
              const coords = getCoordinates(planet.longitude, planetRadius);
              const planetInfo = PLANET_GLYPHS[planet.name];
              
              return (
                <G key={planet.name}>
                  {/* Planet glow background */}
                  <Circle
                    cx={coords.x}
                    cy={coords.y}
                    r="12"
                    fill={`${planetInfo?.color || '#FFFFFF'}20`}
                    stroke={`${planetInfo?.color || '#FFFFFF'}40`}
                    strokeWidth="1"
                  />
                  {/* Planet symbol */}
                  <SvgText
                    x={coords.x}
                    y={coords.y}
                    fontSize="16"
                    fill={planetInfo?.color || '#FFFFFF'}
                    textAnchor="middle"
                    alignmentBaseline="central"
                    fontWeight="bold"
                  >
                    {planetInfo?.symbol || '?'}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>
      </View>
      
      {/* Enhanced legend with more information */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Planetary Positions</Text>
        <View style={styles.legendGrid}>
          {positions.slice(0, 6).map((planet) => {
            const sign = getZodiacSign(planet.longitude);
            const degree = Math.floor(planet.longitude % 30);
            const minutes = Math.floor((planet.longitude % 1) * 60);
            const planetInfo = PLANET_GLYPHS[planet.name];
            
            return (
              <View key={planet.name} style={styles.legendItem}>
                <Text style={[styles.planetSymbol, { color: planetInfo?.color || '#FFFFFF' }]}>
                  {planetInfo?.symbol || '?'}
                </Text>
                <View style={styles.planetInfo}>
                  <Text style={styles.planetName}>{planet.name}</Text>
                  <Text style={styles.planetPosition}>{degree}°{minutes}' {sign}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  explanationContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 20,
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundGlow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    borderRadius: 1000,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    zIndex: 0,
  },
  chartContainer: {
    zIndex: 1,
  },
  planetsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
  svgChart: {
    overflow: 'visible',
  },
  svgPlanets: {
    overflow: 'visible',
  },
  legendContainer: {
    marginTop: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.1)',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
    padding: 10,
    backgroundColor: 'rgba(251, 191, 36, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.1)',
  },
  planetSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    width: 24,
    textAlign: 'center',
  },
  planetInfo: {
    flex: 1,
  },
  planetName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f8fafc',
    fontFamily: 'Inter-Medium',
  },
  planetPosition: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: 'Inter-Regular',
  },
});

export default AstrologyChart; 