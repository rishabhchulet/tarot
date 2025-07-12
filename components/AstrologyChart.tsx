import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Svg, Circle, Text as SvgText, G, Line, Defs, RadialGradient, Stop, Path } from 'react-native-svg';
import { PlanetPosition, getZodiacSign } from '@/utils/astrology';

interface AstrologyChartProps {
  positions: PlanetPosition[];
}

const ZODIAC_SIGNS = [
  { sign: '♈', name: 'Aries', element: 'Fire', color: '#FF6B6B' },
  { sign: '♉', name: 'Taurus', element: 'Earth', color: '#4ECDC4' },
  { sign: '♊', name: 'Gemini', element: 'Air', color: '#45B7D1' },
  { sign: '♋', name: 'Cancer', element: 'Water', color: '#96CEB4' },
  { sign: '♌', name: 'Leo', element: 'Fire', color: '#FECA57' },
  { sign: '♍', name: 'Virgo', element: 'Earth', color: '#48CAE4' },
  { sign: '♎', name: 'Libra', element: 'Air', color: '#C4B5FD' },
  { sign: '♏', name: 'Scorpio', element: 'Water', color: '#F093FB' },
  { sign: '♐', name: 'Sagittarius', element: 'Fire', color: '#F8AD9D' },
  { sign: '♑', name: 'Capricorn', element: 'Earth', color: '#83D475' },
  { sign: '♒', name: 'Aquarius', element: 'Air', color: '#74B9FF' },
  { sign: '♓', name: 'Pisces', element: 'Water', color: '#A29BFE' },
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
  const outerRadius = size / 2 - 20;
  const innerRadius = outerRadius - 40;
  const planetRadius = outerRadius - 20;

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
      <Svg height={size} width={size}>
        <Defs>
          <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </RadialGradient>
          <RadialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(138,43,226,0.1)" />
            <Stop offset="100%" stopColor="rgba(138,43,226,0.02)" />
          </RadialGradient>
        </Defs>

        <G>
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
                fill={`${sign.color}15`}
                stroke={`${sign.color}40`}
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

          {/* House division lines */}
          {Array.from({ length: 12 }, (_, i) => {
            const degree = i * 30;
            const outer = getCoordinates(degree, outerRadius);
            const inner = getCoordinates(degree, innerRadius);
            
            return (
              <Line
                key={`division-${i}`}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Zodiac Signs */}
          {ZODIAC_SIGNS.map((sign, index) => {
            const degree = index * 30 + 15;
            const coords = getCoordinates(degree, outerRadius + 15);
            return (
              <SvgText
                key={sign.name}
                x={coords.x}
                y={coords.y}
                fontSize="24"
                fill={sign.color}
                textAnchor="middle"
                alignmentBaseline="central"
                fontWeight="bold"
              >
                {sign.sign}
              </SvgText>
            );
          })}

          {/* Planets with enhanced styling */}
          {positions.map((planet) => {
            const coords = getCoordinates(planet.longitude, planetRadius);
            const planetInfo = PLANET_GLYPHS[planet.name];
            
            return (
              <G key={planet.name}>
                {/* Planet glow */}
                <Circle
                  cx={coords.x}
                  cy={coords.y}
                  r="12"
                  fill={`${planetInfo?.color || '#FFFFFF'}20`}
                  stroke={`${planetInfo?.color || '#FFFFFF'}60`}
                  strokeWidth="1"
                />
                {/* Planet symbol */}
                <SvgText
                  x={coords.x}
                  y={coords.y}
                  fontSize="20"
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

          {/* Center point */}
          <Circle cx={center} cy={center} r="3" fill="rgba(255,255,255,0.8)" />
        </G>
      </Svg>
      
      {/* Planet positions legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Planetary Positions</Text>
        <View style={styles.legendGrid}>
          {positions.slice(0, 6).map((planet) => {
            const sign = getZodiacSign(planet.longitude);
            const degree = Math.floor(planet.longitude % 30);
            const planetInfo = PLANET_GLYPHS[planet.name];
            
            return (
              <View key={planet.name} style={styles.legendItem}>
                <Text style={[styles.planetSymbol, { color: planetInfo?.color || '#FFFFFF' }]}>
                  {planetInfo?.symbol || '?'}
                </Text>
                <View style={styles.planetInfo}>
                  <Text style={styles.planetName}>{planet.name}</Text>
                  <Text style={styles.planetPosition}>{degree}° {sign}</Text>
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
  legendContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  planetSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
    width: 24,
    textAlign: 'center',
  },
  planetInfo: {
    flex: 1,
  },
  planetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  planetPosition: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
});

export default AstrologyChart; 