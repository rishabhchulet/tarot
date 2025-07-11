import {
  createTimeOfInterest,
  createSun,
  createMoon,
  createMercury,
  createVenus,
  createMars,
  createJupiter,
  createSaturn,
  createUranus,
  createNeptune,
  createPluto,
} from 'astronomy-bundle';

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

export async function getPlanetaryPositionsNew(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number
): Promise<PlanetPosition[]> {
  const toi = createTimeOfInterest.fromTime(year, month, day, hour, minute, second);

  const sun = createSun(toi);
  const moon = createMoon(toi);
  const mercury = createMercury(toi);
  const venus = createVenus(toi);
  const mars = createMars(toi);
  const jupiter = createJupiter(toi);
  const saturn = createSaturn(toi);
  const uranus = createUranus(toi);
  const neptune = createNeptune(toi);
  const pluto = createPluto(toi);

  const celestialBodies = {
    Sun: sun,
    Moon: moon,
    Mercury: mercury,
    Venus: venus,
    Mars: mars,
    Jupiter: jupiter,
    Saturn: saturn,
    Uranus: uranus,
    Neptune: neptune,
    Pluto: pluto,
  };

  const positions: PlanetPosition[] = [];

  for (const [name, body] of Object.entries(celestialBodies)) {
    try {
      const coords = await body.getGeocentricEclipticSphericalDateCoordinates();
      positions.push({ name, longitude: coords.lon });
    } catch (e) {
      console.error(`Could not calculate position for ${name}`, e);
      // It's possible for calculations to fail for certain dates/planets.
      // We'll push a placeholder and continue.
      positions.push({ name, longitude: 0 });
    }
  }

  return positions;
}