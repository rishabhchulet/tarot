import { Horoscope, Origin } from 'circular-natal-horoscope-js';

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

export const getPlanetaryPositions = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  latitude: number,
  longitude: number
): PlanetPosition[] => {
  const origin = new Origin({
    year,
    month: month - 1, // circular-natal-horoscope-js uses 0-indexed months
    date: day,
    hour,
    minute,
    latitude,
    longitude,
  });

  const horoscope = new Horoscope({
    origin,
    houseSystem: 'placidus', // or any other system
    zodiac: 'tropical',
  });

  const positions: PlanetPosition[] = [];
  const celestialBodies = horoscope.CelestialBodies.all;

  for (const body of celestialBodies) {
    // We only need the main planets for our chart
    const planetKeys = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    if (planetKeys.includes(body.key)) {
       positions.push({
        name: body.label,
        longitude: body.ChartPosition.Ecliptic.DecimalDegrees,
      });
    }
  }

  return positions;
};