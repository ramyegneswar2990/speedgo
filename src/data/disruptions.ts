import type { RouteDisruption, AlternativeRouteProposal } from '../types/logistics';

export const ACTIVE_SYSTEM_DISRUPTIONS: RouteDisruption[] = [
  {
    id: 'DISRUPT-GULF-AIR',
    type: 'AIRSPACE_RESTRICTION',
    title: 'Middle East Airspace Restriction & Storm Grounding',
    severity: 'CRITICAL',
    affectedAirspaceOrCorridor: 'Gulf / Arabian Sea International Corridor (DWC / DXB)',
    affectedCarrierOrFlight: 'Emirates SkyCargo (EK-9821 / Gulf Airfreight)',
    reportedAt: '12 mins ago (Live NOTAM Advisory #8412)',
    description: 'Severe weather turbulence combined with temporary airspace restrictions across the Gulf corridor has grounded scheduled commercial freighter flights. Express freight must be diverted to maritime or multi-modal corridors immediately to ensure reliable delivery.',
    contingencyMode: 'OCEAN',
    suggestedAlternative: {
      id: 'ALT-OCEAN-DXB',
      title: 'Deep-Sea Maritime Express Container Linehaul (JNPT Mumbai → Dubai Jebel Ali)',
      mode: 'OCEAN',
      carrierName: 'Maersk Line Maritime Express',
      identifier: 'Vessel MSC Aurora (Voyage V-120)',
      departureTerminal: 'Mumbai JNPT Port Terminal 3',
      arrivalTerminal: 'Dubai Jebel Ali Cargo Gateway (JAFZA North)',
      estimatedTransitChange: '+36 hrs (Guaranteed ETA)',
      newEstimatedArrival: new Date(Date.now() + 3.5 * 24 * 60 * 60 * 1000).toISOString(),
      costImpact: 'Zero Surcharge (Absorbed by Speed Logistics Guarantee)',
      rationale: 'Bypasses restricted airspace completely via deep-sea sea lane. 40ft sealed marine container with automated customs clearance token.',
    },
  },
  {
    id: 'DISRUPT-FRA-STORM',
    type: 'WEATHER_STORM',
    title: 'Western European Storm Front & ATC Ground Stop',
    severity: 'CRITICAL',
    affectedAirspaceOrCorridor: 'Central European Air Corridor (FRA / CargoCity)',
    affectedCarrierOrFlight: 'Lufthansa Cargo (LH-8220 / European Airfreight)',
    reportedAt: '35 mins ago (Eurocontrol Alert #592)',
    description: 'Heavy squall lines and high-altitude crosswinds at Frankfurt Airport have led to cancellations of scheduled air cargo flights. Inbound freight diverted to overland high-speed rail linehaul.',
    contingencyMode: 'RAIL',
    suggestedAlternative: {
      id: 'ALT-RAIL-FRA',
      title: 'Trans-European High-Speed Intermodal Rail Freight',
      mode: 'RAIL',
      carrierName: 'Deutsche Bahn Cargo Intermodal',
      identifier: 'Train EUR-Rail Express #8841',
      departureTerminal: 'Rotterdam Mainport Container Terminal',
      arrivalTerminal: 'Frankfurt CargoCity Rail Hub',
      estimatedTransitChange: '+18 hrs (Weather-Proof)',
      newEstimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      costImpact: 'Zero Surcharge (Guaranteed Priority Slot)',
      rationale: 'Electric heavy-freight rail operates completely independent of storm fronts and cloud ceilings.',
    },
  },
  {
    id: 'DISRUPT-SIN-WEATHER',
    type: 'FLIGHT_CANCELLED',
    title: 'Monsoon Weather & Air Radar Outage at Southeast Asia Hub',
    severity: 'WARNING',
    affectedAirspaceOrCorridor: 'Malacca Strait / Changi Airfreight Gateway',
    affectedCarrierOrFlight: 'Singapore Cargo (SQ-7112 / Regional Shuttles)',
    reportedAt: '1 hour ago (Changi Airport Advisory)',
    description: 'Regional thunderstorm cells have delayed air departure slots. Non-perishable general cargo recommended for road hauler multi-modal transit.',
    contingencyMode: 'ROAD',
    suggestedAlternative: {
      id: 'ALT-ROAD-SIN',
      title: 'Cross-Border Heavy Hauler Express Corridor',
      mode: 'ROAD',
      carrierName: 'SpeedLine Trans-Border Fleet',
      identifier: 'Hauler Heavy Prime #KA-04-TR-9988',
      departureTerminal: 'Regional Port Gateway Dry Dock',
      arrivalTerminal: 'Singapore Tuas Inland Depot',
      estimatedTransitChange: '+24 hrs (Continuous Dual-Driver Transit)',
      newEstimatedArrival: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000).toISOString(),
      costImpact: 'Zero Surcharge',
      rationale: 'Direct expressway route with GPS satellite telemetry and double-driver non-stop transit.',
    },
  },
];

export const getAlternativeForShipment = (
  destinationCountry?: string,
  _currentMode?: string
): AlternativeRouteProposal => {
  if (destinationCountry === 'United Arab Emirates' || destinationCountry === 'Saudi Arabia') {
    return ACTIVE_SYSTEM_DISRUPTIONS[0].suggestedAlternative;
  }
  if (destinationCountry === 'Germany' || destinationCountry === 'United Kingdom' || destinationCountry === 'Netherlands') {
    return ACTIVE_SYSTEM_DISRUPTIONS[1].suggestedAlternative;
  }
  if (destinationCountry === 'Singapore' || destinationCountry === 'Japan' || destinationCountry === 'Australia') {
    return ACTIVE_SYSTEM_DISRUPTIONS[2].suggestedAlternative;
  }

  // Fallback default
  return {
    id: 'ALT-GEN-MULTIMODAL',
    title: 'Priority Intermodal Rail & Road Hauler Detour',
    mode: 'RAIL',
    carrierName: 'CONCOR Express Intermodal Lines',
    identifier: 'Train CONCOR-9944 / Safe Transit',
    departureTerminal: 'Sanathnagar Rail Freight Complex, Hyderabad',
    arrivalTerminal: 'Destination Regional Freight Terminal',
    estimatedTransitChange: '+24 hrs (Weather-Bypass Corridor)',
    newEstimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    costImpact: 'Zero Surcharge',
    rationale: 'Ground corridor insulated from changing weather conditions and temporary airspace restrictions.',
  };
};
