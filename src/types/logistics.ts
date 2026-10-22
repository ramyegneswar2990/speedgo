export type DeliveryType = 'HOME_DELIVERY' | 'HUB_PICKUP';

export type ShipmentStatus =
  | 'BOOKED'
  | 'PICKED_UP'
  | 'ARRIVED_AT_ORIGIN_WAREHOUSE'
  | 'ORIGIN_WAREHOUSE_APPROVED'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_HUB'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'COLLECTED'
  | 'DELAYED';

export type CargoCategory =
  | 'Industrial Machinery'
  | 'High-Tech Electronics'
  | 'Commercial Documents'
  | 'Pharmaceuticals & Health'
  | 'Automotive Spares'
  | 'Retail & Apparel';

export type TransportMode = 'AIR' | 'OCEAN' | 'RAIL' | 'ROAD';

export interface TransportDetails {
  mode: TransportMode;
  carrierName: string; // e.g. Emirates SkyCargo / Maersk Line / Concor Rail / SpeedLine Road
  identifier: string; // Flight # (e.g. EK-9821), Vessel Name & Voyage (e.g. MSC Aurora V-120), Train #, Vehicle Plate
  departureTerminal: string; // e.g. Hyderabad Air Cargo Complex (HYD) / JNPT Port Mumbai
  arrivalTerminal: string; // e.g. Dubai Al Maktoum Cargo (DWC) / Jebel Ali Port
  customsDeclarationCode?: string; // e.g. EXP-2026-IN-9812
  customsClearedAt?: string;
  assignedByStaff?: string;
  assignedAt?: string;
}

export interface HubFacility {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  address: string;
  pinCode: string;
  contactPhone: string;
  operatingHours: string;
  capacityLimit: number;
  currentHoldCount: number;
  facilityType: 'AIRPORT_CARGO' | 'SEAPORT_CONTAINER' | 'RAIL_FREIGHT_DRYPORT' | 'REGIONAL_ROAD_HUB';
}

export interface CheckpointEvent {
  id: string;
  timestamp: string;
  status: ShipmentStatus;
  title: string;
  location: string;
  facility: string;
  description: string;
  operator: string;
  isCompleted: boolean;
}

export interface CustomerParty {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string; // e.g. India, United Arab Emirates, Germany, Singapore, USA
  pinCode: string;
  company?: string;
}

export interface ShipmentRoute {
  originCountry?: string;
  originCity: string;
  originHub: string;
  transitCorridor: string;
  destinationHub: string;
  destinationCity: string;
  destinationCountry?: string;
  currentMilestone: string;
  distanceKm: number;
}

export interface Shipment {
  id: string; // e.g. SL-DXB-5021
  trackingId: string;
  createdAt: string;
  estimatedArrival: string;
  deliveryType: DeliveryType;
  status: ShipmentStatus;
  category: CargoCategory;
  weightKg: number;
  pieces: number;
  dimensions?: string;
  declaredValueInr: number;
  contentsDescription: string;
  
  sender: CustomerParty;
  receiver: CustomerParty;
  
  route: ShipmentRoute;
  timeline: CheckpointEvent[];
  
  // Transport Mode Assignment (Fixed at the Origin Warehouse during Inward Approval)
  transportMode?: TransportMode;
  transportDetails?: TransportDetails;
  
  // Hub Pickup Details (populated if deliveryType === 'HUB_PICKUP')
  assignedHub?: HubFacility & { distanceKm: number };
  pickupReferenceCode?: string;
  pickupSecurityOtp?: string;
  pickupReadyAt?: string;
  pickupStaffConfirmedAt?: string;
  pickupStaffName?: string;
  
  // Delivery details (if HOME_DELIVERY)
  courierAgentName?: string;
  courierAgentPhone?: string;
  deliveryProofOtp?: string;
  deliveredAt?: string;
  
  // Delay/Exception & Location Unavailable handling
  isDelayed?: boolean;
  delayReason?: string;
  isLocationUnavailable?: boolean;
  locationUnavailableReason?: string;
  divertedToHubId?: string;
  divertedAt?: string;
  specialInstructions?: string;

  // Dynamic Route Planning & Automatic Rerouting (Airspace/Weather Disruption)
  isRerouted?: boolean;
  rerouteCount?: number;
  reroutedAt?: string;
  reroutedReason?: string;
  disruptionId?: string;
  activeDisruption?: RouteDisruption;
  originalRoute?: ShipmentRoute;
  originalTransportDetails?: TransportDetails;
  availableAlternatives?: AlternativeRouteProposal[];
  customerNotifications?: CustomerNotification[];
}

export type DisruptionType =
  | 'WEATHER_STORM'
  | 'AIRSPACE_RESTRICTION'
  | 'FLIGHT_CANCELLED'
  | 'PORT_CONGESTION';

export interface AlternativeRouteProposal {
  id: string;
  title: string;
  mode: TransportMode;
  carrierName: string;
  identifier: string; // e.g. Vessel MSC Aurora V-120 / Train CONCOR Express
  departureTerminal: string;
  arrivalTerminal: string;
  estimatedTransitChange: string; // e.g. "+36 hrs (Maritime Express)"
  newEstimatedArrival: string;
  costImpact: string; // e.g. "Zero Surcharge (Guaranteed SLA)"
  rationale: string;
}

export interface RouteDisruption {
  id: string;
  type: DisruptionType;
  title: string;
  severity: 'CRITICAL' | 'WARNING';
  affectedAirspaceOrCorridor: string;
  affectedCarrierOrFlight: string; // e.g. "EK-9821 / Emirates SkyCargo"
  reportedAt: string;
  description: string;
  contingencyMode: TransportMode;
  suggestedAlternative: AlternativeRouteProposal;
}

export interface CustomerNotification {
  id: string;
  shipmentId: string;
  trackingId: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL';
  title: string;
  message: string;
  sentAt: string;
  deliveryStatus: 'DELIVERED' | 'DISPATCHED';
}

export interface ServiceEligibilityResult {
  pinCode: string;
  city: string;
  country: string;
  homeDeliveryAvailable: boolean;
  eligibleHub: (HubFacility & { distanceKm: number }) | null;
  message: string;
  status: 'COVERED_HOME' | 'COVERED_HUB_ONLY' | 'UNSUPPORTED_AREA';
}
