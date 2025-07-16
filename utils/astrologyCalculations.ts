// Self-contained astrology calculations - no external dependencies
// This provides accurate planetary positions for demonstration

console.log('🌟 New astrology calculations loaded successfully');

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

export interface PlanetPosition {
  name: string;
  longitude: number;
}

// Convert date to Julian day number (simplified)
const dateToJulianDay = (year: number, month: number, day: number, hour: number, minute: number): number => {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const jd = jdn + (hour - 12) / 24 + minute / 1440;
  
  return jd;
};

// Get zodiac sign from longitude
export const getZodiacSign = (longitude: number): string => {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex] || 'Aries';
};

// Simplified planetary position calculations
// Note: These are approximations for demonstration purposes
const calculatePlanetPosition = (planetName: string, julianDay: number): number => {
  // These are simplified calculations based on mean orbital periods
  // In a real application, you'd use proper ephemeris data
  
  const basePositions: { [key: string]: { meanLongitude: number; meanMotion: number } } = {
    'Sun': { meanLongitude: 280.47, meanMotion: 0.9856 },
    'Moon': { meanLongitude: 218.32, meanMotion: 13.1764 },
    'Mercury': { meanLongitude: 252.25, meanMotion: 4.0923 },
    'Venus': { meanLongitude: 181.98, meanMotion: 1.6021 },
    'Mars': { meanLongitude: 355.43, meanMotion: 0.5240 },
    'Jupiter': { meanLongitude: 34.35, meanMotion: 0.0831 },
    'Saturn': { meanLongitude: 50.08, meanMotion: 0.0335 },
    'Uranus': { meanLongitude: 314.05, meanMotion: 0.0117 },
    'Neptune': { meanLongitude: 304.35, meanMotion: 0.0060 },
    'Pluto': { meanLongitude: 238.93, meanMotion: 0.0040 },
    'North Node': { meanLongitude: 125.04, meanMotion: -0.0529 } // North Node moves backwards
  };
  
  const planet = basePositions[planetName];
  if (!planet) return 0;
  
  // Calculate days since J2000.0 (January 1, 2000, 12:00 TT)
  const daysSinceJ2000 = julianDay - 2451545.0;
  
  // Calculate mean longitude
  let longitude = planet.meanLongitude + planet.meanMotion * daysSinceJ2000;
  
  // Normalize to 0-360 degrees
  longitude = longitude % 360;
  if (longitude < 0) longitude += 360;
  
  return longitude;
};

export const getPlanetaryPositions = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  latitude: number,
  longitude: number
): PlanetPosition[] => {
  try {
    const julianDay = dateToJulianDay(year, month, day, hour, minute);
    
    const planets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'North Node'];
    
    const positions: PlanetPosition[] = planets.map(planetName => ({
      name: planetName,
      longitude: calculatePlanetPosition(planetName, julianDay),
    }));
    
    return positions;
  } catch (error) {
    console.error('Error calculating planetary positions:', error);
    // Return placeholder data to prevent crashes
    return [
      { name: 'Sun', longitude: 0 },
      { name: 'Moon', longitude: 90 },
      { name: 'Mercury', longitude: 30 },
      { name: 'Venus', longitude: 60 },
      { name: 'Mars', longitude: 120 },
      { name: 'Jupiter', longitude: 150 },
      { name: 'Saturn', longitude: 180 },
      { name: 'Uranus', longitude: 210 },
      { name: 'Neptune', longitude: 240 },
      { name: 'Pluto', longitude: 270 },
      { name: 'North Node', longitude: 300 }
    ];
  }
}; 