import { Platform } from 'react-native';

const API_BASE_URL = Platform.select({
  ios: 'http://localhost:8080',
  android: 'http://10.0.2.2:8080',
  default: 'https://bazi-engine-v2-production.up.railway.app',
});

export interface BirthData {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  lat: number;
  lon: number;
}

export interface WesternChart {
  bodies: {
    Sun: PlanetData;
    Moon: PlanetData;
    Mercury?: PlanetData;
    Venus?: PlanetData;
    Mars?: PlanetData;
    Jupiter?: PlanetData;
    Saturn?: PlanetData;
    Ascendant?: PlanetData;
  };
  houses: Record<string, number>;
  angles: {
    Ascendant: number;
    MC: number;
    Descendant: number;
    IC: number;
  };
}

export interface PlanetData {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  is_retrograde: boolean;
  zodiac_sign: number;
  degree_in_sign: number;
}

export interface AstroResult {
  sunSign: string;
  moonSign: string;
  ascendant?: string;
  chineseYear: string;
  chineseElement: string;
  dayMaster: string;
}

const ZODIAC_SIGNS_DE = [
  'Widder', 'Stier', 'Zwillinge', 'Krebs', 
  'Löwe', 'Jungfrau', 'Waage', 'Skorpion',
  'Schütze', 'Steinbock', 'Wassermann', 'Fische',
];

const ELEMENTS_DE: Record<string, string> = {
  'Holz': '🌲 Holz',
  'Feuer': '🔥 Feuer', 
  'Erde': '🌍 Erde',
  'Metall': '⚙️ Metall',
  'Wasser': '💧 Wasser',
};

export async function calculateWesternChart(data: BirthData): Promise<WesternChart> {
  const response = await fetch(`${API_BASE_URL}/calculate/western`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      date: `${data.date}T${data.time}:00`,
      tz: 'Europe/Berlin',
      lat: data.lat,
      lon: data.lon,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to calculate chart');
  }

  return response.json();
}

export async function calculateSimpleAstro(data: BirthData): Promise<AstroResult> {
  try {
    // Use the simple API endpoint
    const response = await fetch(
      `${API_BASE_URL}/api?datum=${data.date}&zeit=${data.time}&ort=${data.lat},${data.lon}`,
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const result = await response.json();
    
    return {
      sunSign: result.sonne || 'Unbekannt',
      moonSign: 'Berechnung...',
      chineseYear: result.chinesisch?.tier || '',
      chineseElement: result.chinesisch?.element || '',
      dayMaster: '',
    };
  } catch (error) {
    console.error('Astro calculation error:', error);
    // Fallback to mock data
    return getMockAstroResult(data);
  }
}

export function getZodiacSignFromDegree(degree: number): string {
  const signIndex = Math.floor(degree / 30) % 12;
  return ZODIAC_SIGNS_DE[signIndex];
}

export function getElementFromZodiac(sign: string): string {
  const elementMap: Record<string, string> = {
    'Widder': 'Feuer', 'Löwe': 'Feuer', 'Schütze': 'Feuer',
    'Stier': 'Erde', 'Jungfrau': 'Erde', 'Steinbock': 'Erde',
    'Zwillinge': 'Luft', 'Waage': 'Luft', 'Wassermann': 'Luft',
    'Krebs': 'Wasser', 'Skorpion': 'Wasser', 'Fische': 'Wasser',
  };
  return elementMap[sign] || 'Unbekannt';
}

function getMockAstroResult(data: BirthData): AstroResult {
  // Simple mock based on month
  const month = parseInt(data.date.split('-')[1]);
  const mockSigns = [
    'Steinbock', 'Wassermann', 'Fische', 'Widder',
    'Stier', 'Zwillinge', 'Krebs', 'Löwe',
    'Jungfrau', 'Waage', 'Skorpion', 'Schütze',
  ];
  
  return {
    sunSign: mockSigns[month - 1] || 'Zwillinge',
    moonSign: 'Fische',
    chineseYear: 'Drache',
    chineseElement: 'Holz',
    dayMaster: 'Yang Holz',
  };
}

// Geocoding helper
export async function geocodeLocation(location: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // For now, return default Berlin coordinates
    // In production, use a geocoding service like Google Maps or OpenStreetMap
    const cityCoordinates: Record<string, { lat: number; lon: number }> = {
      'berlin': { lat: 52.52, lon: 13.405 },
      'hamburg': { lat: 53.551, lon: 9.993 },
      'münchen': { lat: 48.135, lon: 11.582 },
      'munich': { lat: 48.135, lon: 11.582 },
      'köln': { lat: 50.937, lon: 6.96 },
      'cologne': { lat: 50.937, lon: 6.96 },
      'frankfurt': { lat: 50.11, lon: 8.682 },
      'stuttgart': { lat: 48.775, lon: 9.182 },
    };

    const normalizedLocation = location.toLowerCase().trim();
    
    if (cityCoordinates[normalizedLocation]) {
      return cityCoordinates[normalizedLocation];
    }

    // Default fallback
    return { lat: 52.52, lon: 13.405 }; // Berlin
  } catch (error) {
    console.error('Geocoding error:', error);
    return { lat: 52.52, lon: 13.405 };
  }
}
