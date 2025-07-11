gimport React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Svg, Circle, Text as SvgText, G } from 'react-native-svg';
import { PlanetPosition } from '@/utils/astrology';

interface AstrologyChartProps {
  positions: PlanetPosition[];
}

const ZODIAC_SIGNS = [
  { sign: '♈', name: 'Aries' }, { sign: '♉', name: 'Taurus' }, { sign: '♊', name: 'Gemini' },
  { sign: '♋', name: 'Cancer' }, { sign: '♌', name: 'Leo' }, { sign: '♍', name: 'Virgo' },
  { sign: '♎', name: 'Libra' }, { sign: '♏', name: 'Scorpio' }, { sign: '♐', name: 'Sagittarius' },
  { sign: '♑', name: 'Capricorn' }, { sign: '♒', name: 'Aquarius' }, { sign: '♓', name: 'Pisces' },
];

const PLANET_GLYPHS: { [key: string]: string } = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃',
  Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};

const AstrologyChart: React.FC<AstrologyChartProps> = ({ positions }) => {
  const { width } = Dimensions.get('window');
  const size = width - 40;
  const center = size / 2;
  const radius = size / 2 - 40;

  const getCoordinates = (degree: number) => {
    const angleRad = (degree - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
    };
  };

  return (
    <View style={styles.container}>
      <Svg height={size} width={size}>
        <G>
          <Circle cx={center} cy={center} r={radius} stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="transparent" />
          <Circle cx={center} cy={center} r={radius + 20} stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="transparent" />
          <Circle cx={center} cy={center} r={center} stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="transparent" />
          
          {/* Zodiac Signs */}
          {ZODIAC_SIGNS.map((sign, index) => {
            const degree = index * 30 + 15;
            const coords = getCoordinates(degree);
            return (
              <SvgText
                key={sign.name}
                x={coords.x}
                y={coords.y}
                fontSize="20"
                fill="white"
                textAnchor="middle"
                alignmentBaseline="central"
              >
                {sign.sign}
              </SvgText>
            );
          })}

          {/* Planets */}
          {positions.map((planet) => {
            const coords = getCoordinates(planet.longitude);
            return (
              <SvgText
                key={planet.name}
                x={coords.x}
                y={coords.y}
                fontSize="18"
                fill="#C4B5FD"
                textAnchor="middle"
                alignmentBaseline="central"
              >
                {PLANET_GLYPHS[planet.name] || '?'}
              </SvgText>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AstrologyChart; 