import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Text, Pressable } from 'react-native';
import { Svg, Circle, Text as SvgText, G, Line, Defs, RadialGradient, Stop, Path } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withRepeat, 
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
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
  'North Node': { symbol: '☊', color: '#FF6B35' },
  'South Node': { symbol: '☋', color: '#FF6B35' },
};

const PLANETARY_MEANINGS: { [key: string]: { 
  title: string; 
  description: string; 
  influence: string;
  keywords: string[];
}} = {
  Sun: {
    title: "Your Core Identity & Life Purpose",
    description: "The Sun represents your essential self, ego, and creative expression. It's the center of your personality and your life's driving force.",
    influence: "Shows your natural leadership style, core values, and how you express your authentic self in the world.",
    keywords: ["Identity", "Ego", "Vitality", "Leadership", "Purpose", "Self-Expression"]
  },
  Moon: {
    title: "Emotions & Intuitive Nature", 
    description: "The Moon governs your emotional responses, subconscious mind, and nurturing instincts. It reveals your inner world and emotional needs.",
    influence: "Affects your mood patterns, intuitive abilities, and how you process feelings and memories.",
    keywords: ["Emotions", "Intuition", "Subconscious", "Nurturing", "Memory", "Instincts"]
  },
  Mercury: {
    title: "Communication & Mental Processes",
    description: "Mercury rules communication, thinking patterns, and information processing. It governs how you learn, speak, and connect with others.",
    influence: "Shapes your communication style, learning preferences, and how you process and share information.",
    keywords: ["Communication", "Learning", "Logic", "Writing", "Technology", "Adaptability"]
  },
  Venus: {
    title: "Love, Beauty & Relationships",
    description: "Venus governs love, relationships, beauty, and material pleasures. It shows what you find attractive and how you express affection.",
    influence: "Influences your romantic style, aesthetic preferences, and approach to harmony and partnership.",
    keywords: ["Love", "Beauty", "Relationships", "Art", "Harmony", "Values"]
  },
  Mars: {
    title: "Action, Drive & Passion",
    description: "Mars represents your energy, ambition, and how you pursue goals. It's your inner warrior and drive for achievement.",
    influence: "Determines your action style, anger expression, physical energy, and approach to challenges.",
    keywords: ["Action", "Energy", "Passion", "Courage", "Competition", "Drive"]
  },
  Jupiter: {
    title: "Growth, Wisdom & Expansion",
    description: "Jupiter brings expansion, optimism, and higher learning. It represents your philosophical outlook and areas of growth.",
    influence: "Affects your belief systems, teaching abilities, and where you seek meaning and adventure.",
    keywords: ["Growth", "Wisdom", "Philosophy", "Travel", "Teaching", "Optimism"]
  },
  Saturn: {
    title: "Discipline, Structure & Lessons",
    description: "Saturn represents discipline, responsibility, and life lessons. It shows where you need to develop patience and mastery.",
    influence: "Reveals your relationship with authority, long-term goals, and areas requiring discipline and commitment.",
    keywords: ["Discipline", "Responsibility", "Structure", "Patience", "Mastery", "Maturity"]
  },
  Uranus: {
    title: "Innovation, Freedom & Revolution",
    description: "Uranus brings sudden changes, innovation, and freedom. It represents your unique qualities and desire for independence.",
    influence: "Governs your rebellious nature, technological interests, and need for personal freedom and originality.",
    keywords: ["Innovation", "Freedom", "Revolution", "Technology", "Independence", "Uniqueness"]
  },
  Neptune: {
    title: "Dreams, Spirituality & Imagination",
    description: "Neptune rules dreams, spirituality, and imagination. It connects you to the mystical and transcendent realms.",
    influence: "Affects your spiritual beliefs, creative imagination, and connection to the collective unconscious.",
    keywords: ["Dreams", "Spirituality", "Imagination", "Mysticism", "Compassion", "Illusion"]
  },
  Pluto: {
    title: "Transformation & Hidden Power",
    description: "Pluto represents deep transformation, regeneration, and hidden power. It reveals your capacity for profound change.",
    influence: "Governs your transformative abilities, psychological depths, and relationship with power and control.",
    keywords: ["Transformation", "Power", "Regeneration", "Psychology", "Secrets", "Rebirth"]
  },
  'North Node': {
    title: "Soul's Purpose & Life Direction",
    description: "The North Node (not a planet but a calculated point) represents your soul's growth direction and life purpose in this incarnation.",
    influence: "Shows the qualities you're meant to develop and the path toward your highest potential and spiritual evolution.",
    keywords: ["Soul Purpose", "Growth", "Destiny", "Life Direction", "Evolution", "Future"]
  },
  'South Node': {
    title: "Past Life Gifts & Karmic Patterns",
    description: "The South Node represents past life talents and karmic patterns you're meant to balance or transcend in this lifetime.",
    influence: "Reveals natural gifts from past experiences and patterns that may hold you back from growth.",
    keywords: ["Past Lives", "Karma", "Natural Gifts", "Comfort Zone", "Balance", "Release"]
  }
};

const AstrologyChart: React.FC<AstrologyChartProps> = ({ positions }) => {
  const { width } = Dimensions.get('window');
  const size = Math.min(width - 40, 400);
  const center = size / 2;
  const outerRadius = size / 2 - 30; // Increased margin for better spacing
  const innerRadius = outerRadius - 40;
  const planetRadius = outerRadius - 15; // Adjusted for better planet positioning

  // State for expandable insights
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);

  // Animation values - only for subtle effects, not rotation
  const glowPulse = useSharedValue(0.7);
  const planetScale = useSharedValue(0);

  useEffect(() => {
    // Gentle glow pulse animation
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 4000, easing: Easing.inOut(Easing.ease) })
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

  // Expandable Planet Insight Component
  const PlanetInsightCard = ({ planet }: { planet: any }) => {
    const sign = getZodiacSign(planet.longitude);
    const degree = Math.floor(planet.longitude % 30);
    const minutes = Math.floor((planet.longitude % 1) * 60);
    const planetInfo = PLANET_GLYPHS[planet.name];
    const meaning = PLANETARY_MEANINGS[planet.name];
    const isExpanded = expandedPlanet === planet.name;

    const cardScale = useSharedValue(1);
    const cardOpacity = useSharedValue(1);

    const animatedCardStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
      opacity: cardOpacity.value,
    }));

    const handleToggle = () => {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      setExpandedPlanet(isExpanded ? null : planet.name);
    };

    return (
      <Animated.View style={[styles.planetCard, animatedCardStyle]}>
        <Pressable onPress={handleToggle} style={styles.planetCardHeader}>
          <View style={styles.planetCardLeft}>
            <Text style={[styles.planetSymbol, { color: planetInfo?.color || '#FFFFFF' }]}>
              {planetInfo?.symbol || '?'}
            </Text>
            <View style={styles.planetBasicInfo}>
              <Text style={styles.planetName}>{planet.name}</Text>
              <Text style={styles.planetPosition}>{degree}°{minutes}' {sign}</Text>
            </View>
          </View>
          <View style={styles.expandButton}>
            {isExpanded ? (
              <ChevronUp size={20} color="#64748b" />
            ) : (
              <ChevronDown size={20} color="#64748b" />
            )}
          </View>
        </Pressable>
        
        {isExpanded && meaning && (
          <View style={styles.planetInsights}>
            <Text style={styles.insightTitle}>{meaning.title}</Text>
            <Text style={styles.insightDescription}>{meaning.description}</Text>
            <Text style={styles.insightInfluence}>
              <Text style={styles.influenceLabel}>Your {planet.name} in {sign}:</Text> {meaning.influence}
            </Text>
            <View style={styles.keywordsContainer}>
              <Text style={styles.keywordsLabel}>Key Themes:</Text>
              <View style={styles.keywordsList}>
                {meaning.keywords.map((keyword, index) => (
                  <View key={index} style={styles.keywordTag}>
                    <Text style={styles.keywordText}>{keyword}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowPulse.value,
  }));

  const animatedPlanetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: planetScale.value }],
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

      {/* Static chart container - no rotation for accurate reading */}
      <View style={styles.chartWrapper}>
        {/* Background glow effect */}
        <Animated.View style={[styles.backgroundGlow, animatedGlowStyle]} />
        
        {/* Static chart background */}
        <View style={styles.chartContainer}>
          <Svg height={size} width={size} style={styles.svgChart}>
            <Defs>
              <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgba(59, 130, 246, 0.08)" />
                <Stop offset="100%" stopColor="rgba(59, 130, 246, 0.02)" />
              </RadialGradient>
              <RadialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgba(30, 58, 138, 0.06)" />
                <Stop offset="100%" stopColor="rgba(30, 58, 138, 0.01)" />
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
            <Circle cx={center} cy={center} r="4" fill="rgba(30, 58, 138, 0.8)" />
          </Svg>
        </View>

        {/* Static planets overlay with subtle entrance animation */}
        <Animated.View style={[styles.planetsContainer, animatedPlanetStyle]}>
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
        </Animated.View>
      </View>
      
      {/* Enhanced legend with more information */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Planetary Positions</Text>
        <Text style={styles.legendSubtitle}>Exact degrees and zodiac signs at birth</Text>
        <View style={styles.legendGrid}>
          {positions.map((planet) => (
            <PlanetInsightCard key={planet.name} planet={planet} />
          ))}
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
    fontSize: 16,
    color: '#64748b',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 22,
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
    backgroundColor: 'rgba(30, 58, 138, 0.03)',
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
    borderColor: 'rgba(30, 58, 138, 0.2)',
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  legendSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Inter-Medium',
  },
  legendGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
    padding: 10,
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
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
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
    fontFamily: 'Inter-Medium',
  },
  planetPosition: {
    fontSize: 13,
    color: '#94a3b8',
    fontFamily: 'Inter-Regular',
  },
  planetCard: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.2)',
    overflow: 'hidden',
  },
  planetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(30, 58, 138, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 58, 138, 0.1)',
  },
  planetCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planetBasicInfo: {
    marginLeft: 8,
  },
  expandButton: {
    padding: 4,
  },
  planetInsights: {
    padding: 12,
    paddingTop: 0,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 6,
    fontFamily: 'Inter-SemiBold',
  },
  insightDescription: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 10,
    fontFamily: 'Inter-Medium',
    lineHeight: 22,
  },
  insightInfluence: {
    fontSize: 15,
    color: '#94a3b8',
    fontFamily: 'Inter-Medium',
    lineHeight: 22,
  },
  influenceLabel: {
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  keywordsContainer: {
    marginTop: 10,
  },
  keywordsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 6,
    fontFamily: 'Inter-SemiBold',
  },
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  keywordTag: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.3)',
  },
  keywordText: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: 'Inter-Medium',
  },
});

export default AstrologyChart; 