export interface Airline {
  code: string;
  name: string;
  country: string;
}

export const AIRLINES: Airline[] = [
  { code: 'AA', name: 'American Airlines', country: 'USA' },
  { code: 'UA', name: 'United Airlines', country: 'USA' },
  { code: 'DL', name: 'Delta Air Lines', country: 'USA' },
  { code: 'WN', name: 'Southwest Airlines', country: 'USA' },
  { code: 'B6', name: 'JetBlue Airways', country: 'USA' },
  { code: 'AS', name: 'Alaska Airlines', country: 'USA' },
  { code: 'NK', name: 'Spirit Airlines', country: 'USA' },
  { code: 'F9', name: 'Frontier Airlines', country: 'USA' },
  { code: 'BA', name: 'British Airways', country: 'UK' },
  { code: 'LH', name: 'Lufthansa', country: 'Germany' },
  { code: 'AF', name: 'Air France', country: 'France' },
  { code: 'KL', name: 'KLM Royal Dutch', country: 'Netherlands' },
  { code: 'EK', name: 'Emirates', country: 'UAE' },
  { code: 'QR', name: 'Qatar Airways', country: 'Qatar' },
  { code: 'SQ', name: 'Singapore Airlines', country: 'Singapore' },
  { code: 'CX', name: 'Cathay Pacific', country: 'Hong Kong' },
  { code: 'JL', name: 'Japan Airlines', country: 'Japan' },
  { code: 'NH', name: 'All Nippon Airways', country: 'Japan' },
  { code: 'QF', name: 'Qantas', country: 'Australia' },
  { code: 'AC', name: 'Air Canada', country: 'Canada' },
  { code: 'TK', name: 'Turkish Airlines', country: 'Turkey' },
  { code: 'EY', name: 'Etihad Airways', country: 'UAE' },
  { code: 'LX', name: 'Swiss International', country: 'Switzerland' },
  { code: 'AZ', name: 'ITA Airways', country: 'Italy' },
  { code: 'IB', name: 'Iberia', country: 'Spain' },
  { code: 'SK', name: 'SAS Scandinavian', country: 'Sweden' },
  { code: 'AY', name: 'Finnair', country: 'Finland' },
  { code: 'OS', name: 'Austrian Airlines', country: 'Austria' },
  { code: 'TP', name: 'TAP Air Portugal', country: 'Portugal' },
  { code: 'VS', name: 'Virgin Atlantic', country: 'UK' },
];

export function searchAirlines(query: string): Airline[] {
  if (!query || query.length < 1) return [];
  
  const lowerQuery = query.toLowerCase();
  return AIRLINES.filter(
    airline =>
      airline.code.toLowerCase().includes(lowerQuery) ||
      airline.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 8);
}

export function getAirlineByCode(code: string): Airline | undefined {
  return AIRLINES.find(a => a.code.toUpperCase() === code.toUpperCase());
}

export function parseFlightNumber(input: string): { airline: Airline | null; flightNum: string } {
  const cleaned = input.trim().toUpperCase().replace(/\s+/g, '');
  
  const match = cleaned.match(/^([A-Z]{2})(\d{1,4})$/);
  if (match) {
    const airline = getAirlineByCode(match[1]);
    return { airline: airline || null, flightNum: match[2] };
  }
  
  return { airline: null, flightNum: cleaned };
}

export interface AirlineRanking {
  airlineCode: string;
  airlineName: string;
  avgCO2: number;
  maxCO2: number;
  minCO2: number;
  sessionCount: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
}

export function calculateRating(avgCO2: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (avgCO2 < 1000) return 'excellent';
  if (avgCO2 < 1400) return 'good';
  if (avgCO2 < 2000) return 'fair';
  return 'poor';
}
