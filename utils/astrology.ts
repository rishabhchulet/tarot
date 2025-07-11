import {
  sweUtcToJd,
  sweSetTopo,
  sweHouses,
  sweCalcUt,
} from 'react-native-swisseph';
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

export const SE_SUN = 0;
export const SE_MOON = 1;
export const SE_MERCURY = 2;
export const SE_VENUS = 3;
export const SE_MARS = 4;
export const SE_JUPITER = 5;
export const SE_SATURN = 6;
export const SE_URANUS = 7;
export const SE_NEPTUNE = 8;
export const SE_PLUTO = 9;
export const SE_TRUE_NODE = 11;
export const SEFLG_SPEED = 256;
export const SE_GREG_CAL = 1;

export interface AstrologicalPlacements {
  planets: {
    [name: string]: {
      longitude: number;
      latitude: number;
      speed: number;
    };
  };
  cusps: number[];
  ascendant: number;
}

const PLANET_MAP = {
  Sun: SE_SUN,
  Moon: SE_MOON,
  Mercury: SE_MERCURY,
  Venus: SE_VENUS,
  Mars: SE_MARS,
  Jupiter: SE_JUPITER,
  Saturn: SE_SATURN,
  Uranus: SE_URANUS,
  Neptune: SE_NEPTUNE,
  Pluto: SE_PLUTO,
  'North Node': SE_TRUE_NODE,
};

export async function getAstrologicalPlacements(
  name: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  location: string,
  lat: number,
  lon: number
): Promise<AstrologicalPlacements> {
  
  const { tjdUt: julianDayUT } = sweUtcToJd(year, month, day, hour, minute, 0, SE_GREG_CAL);

  sweSetTopo(lon, lat, 0);

  const planets: AstrologicalPlacements['planets'] = {};

  for (const [name, planetId] of Object.entries(PLANET_MAP)) {
    const { longitude, latitude, longitudeSpeed } = await sweCalcUt(julianDayUT, planetId, SEFLG_SPEED);
    planets[name] = {
      longitude,
      latitude,
      speed: longitudeSpeed,
    };
  }
  
  const { cusp, ascmc } = await sweHouses(julianDayUT, lat, lon, 'P');

  return {
    planets,
    cusps: cusp,
    ascendant: ascmc[0],
  };
}

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