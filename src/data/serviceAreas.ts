import type { HubFacility, ServiceEligibilityResult } from '../types/logistics';

export const INTERNATIONAL_COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];

export const DEMO_HUBS: Record<string, HubFacility> = {
  'HUB-HYD-AIR': {
    id: 'HUB-HYD-AIR',
    name: 'Hyderabad Air Cargo Complex & Sorting Terminal',
    code: 'HYD-AIR',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    address: 'Air Cargo Complex, Shamshabad International Airport',
    pinCode: '500081',
    contactPhone: '+91 40 2938 1100',
    operatingHours: '24/7 International Cargo Operations',
    capacityLimit: 2500,
    currentHoldCount: 412,
    facilityType: 'AIRPORT_CARGO',
  },
  'HUB-BOM-SEA': {
    id: 'HUB-BOM-SEA',
    name: 'Mumbai JNPT Maritime Container Terminal',
    code: 'JNPT-PORT',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    country: 'India',
    address: 'Jawaharlal Nehru Port Trust, Nhava Sheva Terminal 3',
    pinCode: '400707',
    contactPhone: '+91 22 2724 4000',
    operatingHours: '24/7 Deep-Sea Container Terminal',
    capacityLimit: 12000,
    currentHoldCount: 3420,
    facilityType: 'SEAPORT_CONTAINER',
  },
  'HUB-HYD-RAIL': {
    id: 'HUB-HYD-RAIL',
    name: 'CONCOR Multi-Modal Rail Dry Port Terminal',
    code: 'CONCOR-SN',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    address: 'Sanathnagar Rail Freight Complex, Balanagar Corridor',
    pinCode: '500018',
    contactPhone: '+91 40 2370 5500',
    operatingHours: '06:00 AM - 11:00 PM',
    capacityLimit: 3000,
    currentHoldCount: 890,
    facilityType: 'RAIL_FREIGHT_DRYPORT',
  },
  'HUB-VJA-ROAD': {
    id: 'HUB-VJA-ROAD',
    name: 'Vijayawada Central Gateway Logistics Hub',
    code: 'VJA-GATE',
    city: 'Vijayawada',
    state: 'Andhra Pradesh',
    country: 'India',
    address: 'Near Benz Circle / Autonagar Highway Terminal',
    pinCode: '520010',
    contactPhone: '+91 866 248 9911',
    operatingHours: '24/7 Operations',
    capacityLimit: 1200,
    currentHoldCount: 280,
    facilityType: 'REGIONAL_ROAD_HUB',
  },
  'HUB-GUN-01': {
    id: 'HUB-GUN-01',
    name: 'Guntur Regional Freight Hub',
    code: 'GUN-AUTO',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    address: 'NH-16 By-pass, Auto Nagar Phase II Terminal',
    pinCode: '522002',
    contactPhone: '+91 863 229 5500',
    operatingHours: '07:00 AM - 09:00 PM',
    capacityLimit: 600,
    currentHoldCount: 145,
    facilityType: 'REGIONAL_ROAD_HUB',
  },
  'HUB-DXB-PORT': {
    id: 'HUB-DXB-PORT',
    name: 'Dubai Jebel Ali Cargo Gateway',
    code: 'DXB-JAFZA',
    city: 'Dubai',
    state: 'Dubai Emirate',
    country: 'United Arab Emirates',
    address: 'Jebel Ali Free Zone Authority (JAFZA) North Dock',
    pinCode: '00000',
    contactPhone: '+971 4 881 2222',
    operatingHours: '24/7 Customs & Cargo Port',
    capacityLimit: 25000,
    currentHoldCount: 8400,
    facilityType: 'SEAPORT_CONTAINER',
  },
  'HUB-FRA-AIR': {
    id: 'HUB-FRA-AIR',
    name: 'Frankfurt CargoCity Air Hub',
    code: 'FRA-AIR',
    city: 'Frankfurt',
    state: 'Hesse',
    country: 'Germany',
    address: 'CargoCity Sued, Gebaeude 543',
    pinCode: '60549',
    contactPhone: '+49 69 690 0',
    operatingHours: '24/7 International Flight Logistics',
    capacityLimit: 8500,
    currentHoldCount: 2190,
    facilityType: 'AIRPORT_CARGO',
  },
  'HUB-SIN-AIR': {
    id: 'HUB-SIN-AIR',
    name: 'Singapore Changi Airfreight Centre',
    code: 'SIN-AIR',
    city: 'Singapore',
    state: 'Central',
    country: 'Singapore',
    address: 'Airport Cargo Road, Megacard Terminal 6',
    pinCode: '819830',
    contactPhone: '+65 6542 1122',
    operatingHours: '24/7 Global Air Transshipment',
    capacityLimit: 11000,
    currentHoldCount: 3900,
    facilityType: 'AIRPORT_CARGO',
  },
};

// Default suggested terminals for transit mode allocation in the warehouse
export const TERMINAL_PRESETS_BY_MODE = {
  AIR: [
    { departure: 'Hyderabad Air Cargo Complex (HYD)', arrival: 'Dubai Al Maktoum Cargo (DWC)', carrier: 'Emirates SkyCargo', flight: 'EK-9821' },
    { departure: 'Mumbai Chhatrapati Shivaji Cargo (BOM)', arrival: 'Frankfurt CargoCity (FRA)', carrier: 'Lufthansa Cargo', flight: 'LH-8220' },
    { departure: 'Bangalore Kempegowda Cargo (BLR)', arrival: 'Singapore Changi Air Center (SIN)', carrier: 'Singapore Airlines Cargo', flight: 'SQ-7142' },
    { departure: 'Delhi IGI Cargo Terminal (DEL)', arrival: 'London Heathrow World Cargo (LHR)', carrier: 'British Airways World Cargo', flight: 'BA-3490' },
  ],
  OCEAN: [
    { departure: 'Mumbai JNPT Port (Nhava Sheva)', arrival: 'Dubai Jebel Ali Port (JAFZA)', carrier: 'Maersk Line', flight: 'Vessel Maersk Ganges V-102' },
    { departure: 'Chennai Port Container Terminal', arrival: 'Port of Singapore (PSA)', carrier: 'MSC Mediterranean Shipping', flight: 'Vessel MSC Aurora V-44' },
    { departure: 'Visakhapatnam Deepwater Port', arrival: 'Port of Rotterdam (Europort)', carrier: 'CMA CGM Shipping', flight: 'Vessel CMA CGM Vasco V-18' },
  ],
  RAIL: [
    { departure: 'CONCOR Dry Port Sanathnagar (HYD)', arrival: 'JNPT Maritime Port Terminal (BOM)', carrier: 'Indian Container Rail (CONCOR)', flight: 'Freight Train CR-8812' },
    { departure: 'ICD Whitefield Rail Terminal (BLR)', arrival: 'Chennai Port Rail Siding', carrier: 'Express Rail Freight Shuttle', flight: 'Train IR-5541' },
  ],
  ROAD: [
    { departure: 'Vijayawada Central Gateway Hub', arrival: 'Hyderabad Central Logistics Hub', carrier: 'SpeedLine Express Hauler Fleet', flight: 'Volvo FH-16 Hauler #TS-09-TR-4401' },
    { departure: 'Guntur Regional Freight Hub', arrival: 'Vijayawada Central Gateway Hub', carrier: 'Speed Logistics Feeder Shuttle', flight: 'Inter-City Shuttle #AP-16-TX-9902' },
  ],
};

// PIN codes configured with Direct Doorstep Delivery coverage
export const COVERED_HOME_PINS: Record<string, { city: string; area: string; hubId: string }> = {
  '500081': { city: 'Hyderabad', area: 'Hitec City / Madhapur / Kondapur', hubId: 'HUB-HYD-AIR' },
  '500032': { city: 'Hyderabad', area: 'Gachibowli / Financial District', hubId: 'HUB-HYD-AIR' },
  '500034': { city: 'Hyderabad', area: 'Banjara Hills / Jubilee Hills', hubId: 'HUB-HYD-AIR' },
  '520010': { city: 'Vijayawada', area: 'Benz Circle / MG Road / Patamata', hubId: 'HUB-VJA-ROAD' },
  '520002': { city: 'Vijayawada', area: 'Governorpet / Suryaraopet', hubId: 'HUB-VJA-ROAD' },
  '560034': { city: 'Bengaluru', area: 'Koramangala / HSR Layout', hubId: 'HUB-HYD-AIR' },
  '400051': { city: 'Mumbai', area: 'Bandra Kurla Complex (BKC)', hubId: 'HUB-BOM-SEA' },
  '110001': { city: 'New Delhi', area: 'Connaught Place / Central', hubId: 'HUB-HYD-AIR' },
};

// PIN codes where Home Delivery is unavailable, BUT an eligible pickup hub exists
export const HUB_ONLY_PINS: Record<string, { city: string; area: string; hubId: string; distanceKm: number }> = {
  '522002': { city: 'Guntur Outskirts', area: 'Auto Nagar & Industrial Belt', hubId: 'HUB-GUN-01', distanceKm: 4.8 },
  '522004': { city: 'Guntur Rural', area: 'Nallapadu Extension', hubId: 'HUB-GUN-01', distanceKm: 7.2 },
  '501401': { city: 'Medchal Outskirts', area: 'ORR Outer Industrial Zone', hubId: 'HUB-HYD-AIR', distanceKm: 6.2 },
  '521108': { city: 'Gannavaram Rural', area: 'Highway Logistics Belt', hubId: 'HUB-VJA-ROAD', distanceKm: 9.5 },
  '562157': { city: 'Bengaluru Rural', area: 'Nelamangala Highway Fringe', hubId: 'HUB-HYD-AIR', distanceKm: 8.4 },
};

// Explicit unsupported PINs for testing
export const KNOWN_UNSUPPORTED_PINS: Record<string, { city: string; area: string }> = {
  '506381': { city: 'Mulugu Regional Forest', area: 'Remote Tribal Foothills Corridor' },
  '744101': { city: 'Port Blair Hinterlands', area: 'South Andaman Maritime Outpost' },
  '194101': { city: 'Leh Rural Outpost', area: 'High Altitude Transit Point' },
};

export function evaluatePinEligibility(pinCode: string, country = 'India'): ServiceEligibilityResult {
  const cleanPin = pinCode.trim();

  // If destination country is outside India, international hub delivery applies
  if (country && country !== 'India') {
    let internationalHub = DEMO_HUBS['HUB-DXB-PORT'];
    let defaultCity = 'Dubai';

    if (country === 'Germany') {
      internationalHub = DEMO_HUBS['HUB-FRA-AIR'];
      defaultCity = 'Frankfurt';
    } else if (country === 'Singapore') {
      internationalHub = DEMO_HUBS['HUB-SIN-AIR'];
      defaultCity = 'Singapore';
    } else if (country === 'United States') {
      internationalHub = DEMO_HUBS['HUB-FRA-AIR'];
      defaultCity = 'New York / JFK Cargo';
    } else if (country === 'United Kingdom') {
      internationalHub = DEMO_HUBS['HUB-FRA-AIR'];
      defaultCity = 'London Heathrow Gateway';
    } else if (country === 'Netherlands') {
      internationalHub = DEMO_HUBS['HUB-BOM-SEA'];
      defaultCity = 'Port of Rotterdam';
    } else if (country === 'Saudi Arabia') {
      internationalHub = DEMO_HUBS['HUB-DXB-PORT'];
      defaultCity = 'Riyadh Dry Port';
    } else if (country === 'Japan') {
      internationalHub = DEMO_HUBS['HUB-SIN-AIR'];
      defaultCity = 'Tokyo Narita Air Cargo';
    } else if (country === 'Australia') {
      internationalHub = DEMO_HUBS['HUB-SIN-AIR'];
      defaultCity = 'Sydney Port Botany';
    }

    return {
      pinCode: cleanPin || 'INTL-PORT',
      city: defaultCity,
      country,
      homeDeliveryAvailable: true,
      eligibleHub: { ...internationalHub, distanceKm: 15.5 },
      message: `International cross-border shipping confirmed to ${country}. Mode of transit (Flight ✈️ / Cargo Ship 🚢 / Rail 🚆 / Road 🚛) will be fixed and cleared at origin warehouse.`,
      status: 'COVERED_HOME',
    };
  }

  // 1. Check direct home delivery coverage
  if (COVERED_HOME_PINS[cleanPin]) {
    const data = COVERED_HOME_PINS[cleanPin];
    const hub = DEMO_HUBS[data.hubId];
    return {
      pinCode: cleanPin,
      city: data.city,
      country: 'India',
      homeDeliveryAvailable: true,
      eligibleHub: hub ? { ...hub, distanceKm: 3.2 } : null,
      message: `Direct Doorstep Delivery Confirmed for ${data.area}, ${data.city}. Our last-mile fleet provides direct dispatch to this PIN.`,
      status: 'COVERED_HOME',
    };
  }

  // 2. Check hub-only pickup eligibility
  if (HUB_ONLY_PINS[cleanPin]) {
    const data = HUB_ONLY_PINS[cleanPin];
    const hub = DEMO_HUBS[data.hubId];
    return {
      pinCode: cleanPin,
      city: data.city,
      country: 'India',
      homeDeliveryAvailable: false,
      eligibleHub: hub ? { ...hub, distanceKm: data.distanceKm } : null,
      message: `Home delivery is currently unavailable in ${data.area}. However, your consignment can be safely held at our nearest authorized regional hub: ${hub?.name} (${data.distanceKm} km away).`,
      status: 'COVERED_HUB_ONLY',
    };
  }

  // 3. Fallback: check if matches unsupported or unknown
  const unsupported = KNOWN_UNSUPPORTED_PINS[cleanPin];
  const locationName = unsupported ? `${unsupported.area}, ${unsupported.city}` : `PIN Code ${cleanPin}`;

  return {
    pinCode: cleanPin,
    city: unsupported ? unsupported.city : 'Unregistered Territory',
    country: 'India',
    homeDeliveryAvailable: false,
    eligibleHub: null,
    message: `Out of Service Network: Speed Logistics does not currently have automated delivery or regional hub coverage in ${locationName}. Please contact Enterprise Freight Support (freight@speedlogistics.demo / 1800-SPEED-GO) for custom chartered logistics.`,
    status: 'UNSUPPORTED_AREA',
  };
}

export const DEMO_PIN_PRESETS = [
  {
    label: 'Hyderabad (Hitec City)',
    pin: '500081',
    type: 'Home Delivery Covered',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    label: 'Vijayawada (Benz Circle)',
    pin: '520010',
    type: 'Home Delivery Covered',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    label: 'Guntur Outskirts',
    pin: '522002',
    type: 'Hub Pickup Fallback',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    label: 'Medchal Corridor',
    pin: '501401',
    type: 'Hub Pickup Fallback',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    label: 'Mulugu Forest Area',
    pin: '506381',
    type: 'No Coverage / Manual Support',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
];
