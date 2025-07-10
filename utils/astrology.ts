// Simplified astrology implementation with chart data generation

export interface AstrologicalPlacements {
  sun: { sign: string; house: string; degree: number };
  moon: { sign: string; house: string; degree: number };
  rising: { sign: string; house: string; degree: number };
  northNode: { sign: string; house: string; degree: number };
  planets: { [key: string]: { sign: string; house: string; degree: number } };
  chartData: {
    elementDistribution: { fire: number; earth: number; air: number; water: number };
    modalityDistribution: { cardinal: number; fixed: number; mutable: number };
    houseDistribution: number[];
    aspectPatterns: { conjunction: number; trine: number; square: number; opposition: number; sextile: number };
  };
}

// Zodiac signs with their elements and modalities
const ZODIAC_DATA = {
  'Aries': { element: 'fire', modality: 'cardinal', degree: 0 },
  'Taurus': { element: 'earth', modality: 'fixed', degree: 30 },
  'Gemini': { element: 'air', modality: 'mutable', degree: 60 },
  'Cancer': { element: 'water', modality: 'cardinal', degree: 90 },
  'Leo': { element: 'fire', modality: 'fixed', degree: 120 },
  'Virgo': { element: 'earth', modality: 'mutable', degree: 150 },
  'Libra': { element: 'air', modality: 'cardinal', degree: 180 },
  'Scorpio': { element: 'water', modality: 'fixed', degree: 210 },
  'Sagittarius': { element: 'fire', modality: 'mutable', degree: 240 },
  'Capricorn': { element: 'earth', modality: 'cardinal', degree: 270 },
  'Aquarius': { element: 'air', modality: 'fixed', degree: 300 },
  'Pisces': { element: 'water', modality: 'mutable', degree: 330 }
};

const ZODIAC_SIGNS = Object.keys(ZODIAC_DATA);
const HOUSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

// Generate deterministic but varied placements based on birth data
function generatePlacement(day: number, month: number, year: number, hour: number, offset: number = 0) {
  const seed = (day + month * 31 + year + hour + offset) % 360;
  const signIndex = Math.floor(seed / 30) % 12;
  const houseIndex = (seed + offset * 7) % 12;
  const degree = seed % 30;
  
  return {
    sign: ZODIAC_SIGNS[signIndex],
    house: HOUSES[houseIndex],
    degree: degree
  };
}

// Calculate chart data for visualizations
function calculateChartData(placements: any) {
  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityCounts = { cardinal: 0, fixed: 0, mutable: 0 };
  const houseCounts = new Array(12).fill(0);
  
  // Count elements and modalities for all placements
  const allPlacements = [
    placements.sun,
    placements.moon,
    placements.rising,
    placements.northNode,
    ...Object.values(placements.planets)
  ];
  
  allPlacements.forEach((placement: any) => {
    const signData = ZODIAC_DATA[placement.sign as keyof typeof ZODIAC_DATA];
    if (signData) {
      elementCounts[signData.element as keyof typeof elementCounts]++;
      modalityCounts[signData.modality as keyof typeof modalityCounts]++;
    }
    
    const houseIndex = parseInt(placement.house.replace(/\D/g, '')) - 1;
    if (houseIndex >= 0 && houseIndex < 12) {
      houseCounts[houseIndex]++;
    }
  });
  
  // Generate aspect patterns (simplified)
  const aspectPatterns = {
    conjunction: Math.floor(Math.random() * 5) + 1,
    trine: Math.floor(Math.random() * 4) + 1,
    square: Math.floor(Math.random() * 3) + 1,
    opposition: Math.floor(Math.random() * 2) + 1,
    sextile: Math.floor(Math.random() * 3) + 2
  };
  
  return {
    elementDistribution: elementCounts,
    modalityDistribution: modalityCounts,
    houseDistribution: houseCounts,
    aspectPatterns
  };
}

export const getAstrologicalPlacements = async (
  name: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  min: number,
  city: string
): Promise<AstrologicalPlacements | null> => {
  try {
    console.log(`Generating astrological chart for ${name} born ${day}/${month}/${year} at ${hour}:${min} in ${city}`);
    
    // Generate main placements
    const sun = generatePlacement(day, month, year, hour, 0);
    const moon = generatePlacement(day, month, year, hour, 100);
    const rising = generatePlacement(day, month, year, hour, 200);
    const northNode = generatePlacement(day, month, year, hour, 300);
    
    // Generate planetary placements
    const planets: { [key: string]: { sign: string; house: string; degree: number } } = {};
    PLANETS.forEach((planet, index) => {
      planets[planet] = generatePlacement(day, month, year, hour, 400 + (index * 50));
    });
    
    const placements = {
      sun,
      moon,
      rising,
      northNode,
      planets
    };
    
    // Calculate chart data for visualizations
    const chartData = calculateChartData(placements);
    
    return {
      ...placements,
      chartData
    };
  } catch (error) {
    console.error("Error calculating astrological placements:", error);
    return null;
  }
};

// Helper function to get element color
export const getElementColor = (element: string): string => {
  switch (element) {
    case 'fire': return '#FF6B6B';
    case 'earth': return '#4ECDC4';
    case 'air': return '#45B7D1';
    case 'water': return '#96CEB4';
    default: return '#95A5A6';
  }
};

// Helper function to get sign emoji
export const getSignEmoji = (sign: string): string => {
  const signEmojis: { [key: string]: string } = {
    'Aries': '♈',
    'Taurus': '♉',
    'Gemini': '♊',
    'Cancer': '♋',
    'Leo': '♌',
    'Virgo': '♍',
    'Libra': '♎',
    'Scorpio': '♏',
    'Sagittarius': '♐',
    'Capricorn': '♑',
    'Aquarius': '♒',
    'Pisces': '♓'
  };
  return signEmojis[sign] || '⭐';
};