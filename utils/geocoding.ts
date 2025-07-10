// Alternative geocoding solutions for getting coordinates from location names

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

interface GeocodeResult {
  coordinates: LocationCoordinates | null;
  error: string | null;
}

// Option 1: OpenStreetMap Nominatim (Free, no API key required)
export const geocodeWithNominatim = async (locationName: string): Promise<GeocodeResult> => {
  try {
    const encodedLocation = encodeURIComponent(locationName);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedLocation}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'DailyInnerReflection/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    
    if (data.length === 0) {
      return {
        coordinates: null,
        error: 'Location not found'
      };
    }

    const result = data[0];
    return {
      coordinates: {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        city: result.address?.city || result.address?.town || result.address?.village,
        country: result.address?.country
      },
      error: null
    };
  } catch (error: any) {
    return {
      coordinates: null,
      error: error.message || 'Geocoding failed'
    };
  }
};

// Option 2: MapBox Geocoding (Requires API key but has generous free tier)
export const geocodeWithMapbox = async (locationName: string, apiKey: string): Promise<GeocodeResult> => {
  try {
    const encodedLocation = encodeURIComponent(locationName);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?access_token=${apiKey}&limit=1&types=place,locality,neighborhood`
    );

    if (!response.ok) {
      throw new Error('Mapbox geocoding request failed');
    }

    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      return {
        coordinates: null,
        error: 'Location not found'
      };
    }

    const feature = data.features[0];
    const [longitude, latitude] = feature.center;
    
    return {
      coordinates: {
        latitude,
        longitude,
        city: feature.text,
        country: feature.context?.find((c: any) => c.id.startsWith('country'))?.text
      },
      error: null
    };
  } catch (error: any) {
    return {
      coordinates: null,
      error: error.message || 'Mapbox geocoding failed'
    };
  }
};

// Option 3: Browser Geolocation API (for current location)
export const getCurrentLocation = (): Promise<GeocodeResult> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        coordinates: null,
        error: 'Geolocation not supported'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          error: null
        });
      },
      (error) => {
        resolve({
          coordinates: null,
          error: error.message || 'Location access denied'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Option 4: Fallback to major city coordinates
const MAJOR_CITIES: Record<string, LocationCoordinates> = {
  'new york': { latitude: 40.7128, longitude: -74.0060, city: 'New York', country: 'United States' },
  'london': { latitude: 51.5074, longitude: -0.1278, city: 'London', country: 'United Kingdom' },
  'paris': { latitude: 48.8566, longitude: 2.3522, city: 'Paris', country: 'France' },
  'tokyo': { latitude: 35.6762, longitude: 139.6503, city: 'Tokyo', country: 'Japan' },
  'sydney': { latitude: -33.8688, longitude: 151.2093, city: 'Sydney', country: 'Australia' },
  'toronto': { latitude: 43.6532, longitude: -79.3832, city: 'Toronto', country: 'Canada' },
  'berlin': { latitude: 52.5200, longitude: 13.4050, city: 'Berlin', country: 'Germany' },
  'mumbai': { latitude: 19.0760, longitude: 72.8777, city: 'Mumbai', country: 'India' },
  'beijing': { latitude: 39.9042, longitude: 116.4074, city: 'Beijing', country: 'China' },
  'moscow': { latitude: 55.7558, longitude: 37.6176, city: 'Moscow', country: 'Russia' },
  'los angeles': { latitude: 34.0522, longitude: -118.2437, city: 'Los Angeles', country: 'United States' },
  'chicago': { latitude: 41.8781, longitude: -87.6298, city: 'Chicago', country: 'United States' },
  'san francisco': { latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', country: 'United States' },
  'miami': { latitude: 25.7617, longitude: -80.1918, city: 'Miami', country: 'United States' },
  'vancouver': { latitude: 49.2827, longitude: -123.1207, city: 'Vancouver', country: 'Canada' },
  'mexico city': { latitude: 19.4326, longitude: -99.1332, city: 'Mexico City', country: 'Mexico' },
  'buenos aires': { latitude: -34.6118, longitude: -58.3960, city: 'Buenos Aires', country: 'Argentina' },
  'sao paulo': { latitude: -23.5505, longitude: -46.6333, city: 'São Paulo', country: 'Brazil' },
  'rio de janeiro': { latitude: -22.9068, longitude: -43.1729, city: 'Rio de Janeiro', country: 'Brazil' },
  'cape town': { latitude: -33.9249, longitude: 18.4241, city: 'Cape Town', country: 'South Africa' },
  'cairo': { latitude: 30.0444, longitude: 31.2357, city: 'Cairo', country: 'Egypt' },
  'dubai': { latitude: 25.2048, longitude: 55.2708, city: 'Dubai', country: 'United Arab Emirates' },
  'singapore': { latitude: 1.3521, longitude: 103.8198, city: 'Singapore', country: 'Singapore' },
  'hong kong': { latitude: 22.3193, longitude: 114.1694, city: 'Hong Kong', country: 'Hong Kong' },
  'seoul': { latitude: 37.5665, longitude: 126.9780, city: 'Seoul', country: 'South Korea' },
  'bangkok': { latitude: 13.7563, longitude: 100.5018, city: 'Bangkok', country: 'Thailand' },
  'jakarta': { latitude: -6.2088, longitude: 106.8456, city: 'Jakarta', country: 'Indonesia' },
  'manila': { latitude: 14.5995, longitude: 120.9842, city: 'Manila', country: 'Philippines' },
  'delhi': { latitude: 28.7041, longitude: 77.1025, city: 'Delhi', country: 'India' },
  'bangalore': { latitude: 12.9716, longitude: 77.5946, city: 'Bangalore', country: 'India' },
  'kolkata': { latitude: 22.5726, longitude: 88.3639, city: 'Kolkata', country: 'India' },
  'chennai': { latitude: 13.0827, longitude: 80.2707, city: 'Chennai', country: 'India' },
  'karachi': { latitude: 24.8607, longitude: 67.0011, city: 'Karachi', country: 'Pakistan' },
  'lahore': { latitude: 31.5204, longitude: 74.3587, city: 'Lahore', country: 'Pakistan' },
  'dhaka': { latitude: 23.8103, longitude: 90.4125, city: 'Dhaka', country: 'Bangladesh' },
  'istanbul': { latitude: 41.0082, longitude: 28.9784, city: 'Istanbul', country: 'Turkey' },
  'madrid': { latitude: 40.4168, longitude: -3.7038, city: 'Madrid', country: 'Spain' },
  'barcelona': { latitude: 41.3851, longitude: 2.1734, city: 'Barcelona', country: 'Spain' },
  'rome': { latitude: 41.9028, longitude: 12.4964, city: 'Rome', country: 'Italy' },
  'milan': { latitude: 45.4642, longitude: 9.1900, city: 'Milan', country: 'Italy' },
  'amsterdam': { latitude: 52.3676, longitude: 4.9041, city: 'Amsterdam', country: 'Netherlands' },
  'brussels': { latitude: 50.8503, longitude: 4.3517, city: 'Brussels', country: 'Belgium' },
  'zurich': { latitude: 47.3769, longitude: 8.5417, city: 'Zurich', country: 'Switzerland' },
  'vienna': { latitude: 48.2082, longitude: 16.3738, city: 'Vienna', country: 'Austria' },
  'stockholm': { latitude: 59.3293, longitude: 18.0686, city: 'Stockholm', country: 'Sweden' },
  'oslo': { latitude: 59.9139, longitude: 10.7522, city: 'Oslo', country: 'Norway' },
  'copenhagen': { latitude: 55.6761, longitude: 12.5683, city: 'Copenhagen', country: 'Denmark' },
  'helsinki': { latitude: 60.1699, longitude: 24.9384, city: 'Helsinki', country: 'Finland' },
  'warsaw': { latitude: 52.2297, longitude: 21.0122, city: 'Warsaw', country: 'Poland' },
  'prague': { latitude: 50.0755, longitude: 14.4378, city: 'Prague', country: 'Czech Republic' },
  'budapest': { latitude: 47.4979, longitude: 19.0402, city: 'Budapest', country: 'Hungary' },
  'bucharest': { latitude: 44.4268, longitude: 26.1025, city: 'Bucharest', country: 'Romania' },
  'athens': { latitude: 37.9838, longitude: 23.7275, city: 'Athens', country: 'Greece' },
  'lisbon': { latitude: 38.7223, longitude: -9.1393, city: 'Lisbon', country: 'Portugal' },
  'dublin': { latitude: 53.3498, longitude: -6.2603, city: 'Dublin', country: 'Ireland' },
  'edinburgh': { latitude: 55.9533, longitude: -3.1883, city: 'Edinburgh', country: 'United Kingdom' },
  'manchester': { latitude: 53.4808, longitude: -2.2426, city: 'Manchester', country: 'United Kingdom' },
  'birmingham': { latitude: 52.4862, longitude: -1.8904, city: 'Birmingham', country: 'United Kingdom' },
  'glasgow': { latitude: 55.8642, longitude: -4.2518, city: 'Glasgow', country: 'United Kingdom' },
  'montreal': { latitude: 45.5017, longitude: -73.5673, city: 'Montreal', country: 'Canada' },
  'calgary': { latitude: 51.0447, longitude: -114.0719, city: 'Calgary', country: 'Canada' },
  'ottawa': { latitude: 45.4215, longitude: -75.6972, city: 'Ottawa', country: 'Canada' },
  'edmonton': { latitude: 53.5461, longitude: -113.4938, city: 'Edmonton', country: 'Canada' },
  'winnipeg': { latitude: 49.8951, longitude: -97.1384, city: 'Winnipeg', country: 'Canada' },
  'quebec city': { latitude: 46.8139, longitude: -71.2080, city: 'Quebec City', country: 'Canada' },
  'halifax': { latitude: 44.6488, longitude: -63.5752, city: 'Halifax', country: 'Canada' },
  'melbourne': { latitude: -37.8136, longitude: 144.9631, city: 'Melbourne', country: 'Australia' },
  'brisbane': { latitude: -27.4698, longitude: 153.0251, city: 'Brisbane', country: 'Australia' },
  'perth': { latitude: -31.9505, longitude: 115.8605, city: 'Perth', country: 'Australia' },
  'adelaide': { latitude: -34.9285, longitude: 138.6007, city: 'Adelaide', country: 'Australia' },
  'auckland': { latitude: -36.8485, longitude: 174.7633, city: 'Auckland', country: 'New Zealand' },
  'wellington': { latitude: -41.2865, longitude: 174.7762, city: 'Wellington', country: 'New Zealand' },
  'christchurch': { latitude: -43.5321, longitude: 172.6362, city: 'Christchurch', country: 'New Zealand' }
};

export const geocodeWithFallback = async (locationName: string): Promise<GeocodeResult> => {
  const normalizedName = locationName.toLowerCase().trim();
  
  // Check if it's a major city first
  if (MAJOR_CITIES[normalizedName]) {
    return {
      coordinates: MAJOR_CITIES[normalizedName],
      error: null
    };
  }

  // Check for partial matches
  const partialMatch = Object.keys(MAJOR_CITIES).find(city => 
    city.includes(normalizedName) || normalizedName.includes(city)
  );
  
  if (partialMatch) {
    return {
      coordinates: MAJOR_CITIES[partialMatch],
      error: null
    };
  }

  return {
    coordinates: null,
    error: 'Location not found in database'
  };
};

// Main geocoding function with multiple fallbacks
export const geocodeLocation = async (locationName: string): Promise<GeocodeResult> => {
  if (!locationName.trim()) {
    return {
      coordinates: null,
      error: 'Location name is required'
    };
  }

  // Try Nominatim first (free, no API key required)
  console.log('Trying Nominatim geocoding...');
  const nominatimResult = await geocodeWithNominatim(locationName);
  if (nominatimResult.coordinates) {
    console.log('✅ Nominatim geocoding successful');
    return nominatimResult;
  }

  // Fallback to major cities database
  console.log('Trying fallback city database...');
  const fallbackResult = await geocodeWithFallback(locationName);
  if (fallbackResult.coordinates) {
    console.log('✅ Fallback geocoding successful');
    return fallbackResult;
  }

  // If all fails, return the error
  return {
    coordinates: null,
    error: `Could not find coordinates for "${locationName}". Please try a major city name.`
  };
};