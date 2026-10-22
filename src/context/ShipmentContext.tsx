import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { 
  Shipment, 
  ShipmentStatus, 
  TransportDetails, 
  DeliveryType, 
  CheckpointEvent,
  RouteDisruption,
  AlternativeRouteProposal,
  CustomerNotification
} from '../types/logistics';
import { INITIAL_MOCK_SHIPMENTS } from '../data/mockShipments';
import { DEMO_HUBS } from '../data/serviceAreas';
import { ACTIVE_SYSTEM_DISRUPTIONS, getAlternativeForShipment } from '../data/disruptions';

export type ViewType = 'dashboard' | 'create' | 'track' | 'warehouse' | 'details' | 'disruptions';

interface ShipmentContextType {
  shipments: Shipment[];
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedTrackingId: string | null;
  setSelectedTrackingId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Actions
  getShipment: (id: string) => Shipment | undefined;
  createShipment: (newShipment: Omit<Shipment, 'id' | 'trackingId' | 'createdAt' | 'timeline' | 'status'>) => Shipment;
  advanceShipmentStatus: (shipmentId: string, nextStatus: ShipmentStatus, note?: string) => void;
  receiveAtOriginWarehouse: (shipmentId: string, staffName: string) => void;
  approveAtOriginWarehouse: (shipmentId: string, staffName: string, note?: string) => void;
  allocateTransportMode: (shipmentId: string, transportDetails: TransportDetails, staffName: string) => void;
  confirmWarehouseInspection: (shipmentId: string, staffName: string) => void;
  confirmCollection: (shipmentId: string, verifiedReference: string, staffName: string) => { success: boolean; message: string };
  divertToWarehousePickup: (shipmentId: string, warehouseId: string, reason: string, staffName: string) => void;
  simulateDelay: (shipmentId: string, reason: string) => void;
  resolveDelay: (shipmentId: string) => void;
  clearAllShipments: () => void;
  resetDemoData: () => void;
  loadScenario: (scenarioId: string) => void;

  // Dynamic Route Planning & Automatic Rerouting (Airspace/Weather Disruption)
  activeDisruptions: RouteDisruption[];
  autoRerouteShipment: (shipmentId: string, alternative?: AlternativeRouteProposal, staffName?: string) => void;
  autoRerouteAllAffected: (disruptionId?: string, staffName?: string) => { reroutedCount: number };
  revertReroute: (shipmentId: string) => void;
  sendCustomerNotification: (shipmentId: string, channel: 'SMS' | 'WHATSAPP' | 'EMAIL', customMsg?: string) => void;
  
  // Real-time Cloud Multi-Device Sync
  isCloudSyncing: boolean;
  cloudSyncStatus: 'synced' | 'syncing' | 'error' | 'offline';
  lastCloudSyncTime: Date | null;
  syncWithCloud: () => Promise<void>;
  
  // Metrics for dashboard cards
  counts: {
    total: number;
    inTransit: number;
    delivered: number;
    delayed: number;
    inWarehouse: number; // In origin warehouse, approved, or destination hub
    awaitingPickup: number; // READY_FOR_PICKUP for hub pickup
    outForDelivery: number;
    rerouted: number;
    disruptionsActive: number;
  };
}

// Dedicated fresh storage key so all old mock data is removed
const STORAGE_KEY = 'speed_logistics_user_manual_v4';
const CLOUD_API_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a161be47004c7a';
const BROADCAST_CHANNEL_NAME = 'speedgo_live_multi_sync_v1';

// Helper to merge lists without dropping shipments created on another machine
const mergeShipmentLists = (local: Shipment[], incoming: Shipment[]): Shipment[] => {
  const map = new Map<string, Shipment>();

  for (const s of local) {
    if (s && s.id) {
      map.set(s.id, s);
    }
  }

  for (const item of incoming) {
    if (!item || !item.id) continue;
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else {
      // Keep version with more timeline checkpoints or newer updates
      const existingTimelineCount = existing.timeline?.length || 0;
      const incomingTimelineCount = item.timeline?.length || 0;
      if (incomingTimelineCount >= existingTimelineCount) {
        map.set(item.id, item);
      }
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
};

const ShipmentContext = createContext<ShipmentContextType | undefined>(undefined);

export const ShipmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load shipments from localStorage', e);
    }
    return INITIAL_MOCK_SHIPMENTS; // starts as empty []
  });

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(() => {
    return shipments.length > 0 ? shipments[0].id : null;
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time Cloud Multi-Device Sync state
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'offline'>('synced');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<Date | null>(new Date());

  const isPushingRef = useRef<boolean>(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Setup multi-tab BroadcastChannel
  useEffect(() => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          if (event.data && Array.isArray(event.data.shipments)) {
            setShipments((prev) => mergeShipmentLists(prev, event.data.shipments));
          }
        };
        return () => {
          bc.close();
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported', e);
    }
  }, []);

  // Persist to localStorage whenever shipments change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [shipments]);

  // Push updated shipments to the central cloud API
  const pushToCloud = useCallback(async (listToPush: Shipment[]) => {
    if (isPushingRef.current) return;
    isPushingRef.current = true;
    try {
      broadcastChannelRef.current?.postMessage({ shipments: listToPush });

      await fetch(CLOUD_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'SPEEDGO_CENTRAL_DB',
          data: {
            shipments: listToPush,
            updatedAt: Date.now(),
          },
        }),
      });
      setCloudSyncStatus('synced');
      setLastCloudSyncTime(new Date());
    } catch (err) {
      console.error('Cloud push failed:', err);
      setCloudSyncStatus('error');
    } finally {
      isPushingRef.current = false;
    }
  }, []);

  // Fetch from central cloud API and merge
  const syncWithCloud = useCallback(async () => {
    setIsCloudSyncing(true);
    setCloudSyncStatus('syncing');
    try {
      const response = await fetch(CLOUD_API_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });
      if (response.ok) {
        const json = await response.json();
        const remoteShipments: Shipment[] = json?.data?.shipments || [];

        setShipments((currentLocal) => {
          const merged = mergeShipmentLists(currentLocal, remoteShipments);
          if (merged.length > remoteShipments.length) {
            pushToCloud(merged);
          }
          return merged;
        });
        setCloudSyncStatus('synced');
        setLastCloudSyncTime(new Date());
      } else {
        setCloudSyncStatus('error');
      }
    } catch (err) {
      console.warn('Background cloud fetch error (offline or network blocked):', err);
      setCloudSyncStatus(navigator.onLine ? 'error' : 'offline');
    } finally {
      setIsCloudSyncing(false);
    }
  }, [pushToCloud]);

  // Initial fetch on mount & background polling every 3.5 seconds
  useEffect(() => {
    syncWithCloud();

    const interval = setInterval(() => {
      syncWithCloud();
    }, 3500);

    const onFocus = () => {
      syncWithCloud();
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onFocus);
    };
  }, [syncWithCloud]);

  // Helper to update state and push to cloud
  const updateShipmentsState = useCallback((updater: (prev: Shipment[]) => Shipment[]) => {
    setShipments((prev) => {
      const next = updater(prev);
      pushToCloud(next);
      return next;
    });
  }, [pushToCloud]);

  // Derived counts
  const counts = {
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === 'IN_TRANSIT').length,
    delivered: shipments.filter((s) => s.status === 'DELIVERED' || s.status === 'COLLECTED').length,
    delayed: shipments.filter((s) => s.status === 'DELAYED' || s.isDelayed).length,
    inWarehouse: shipments.filter(
      (s) =>
        s.status === 'ARRIVED_AT_ORIGIN_WAREHOUSE' ||
        s.status === 'ORIGIN_WAREHOUSE_APPROVED' ||
        s.status === 'ARRIVED_AT_HUB' ||
        s.status === 'READY_FOR_PICKUP'
    ).length,
    awaitingPickup: shipments.filter(
      (s) => s.deliveryType === 'HUB_PICKUP' && s.status === 'READY_FOR_PICKUP'
    ).length,
    outForDelivery: shipments.filter((s) => s.status === 'OUT_FOR_DELIVERY').length,
    rerouted: shipments.filter((s) => s.isRerouted).length,
    disruptionsActive: ACTIVE_SYSTEM_DISRUPTIONS.length,
  };

  const getShipment = (id: string): Shipment | undefined => {
    if (!id) return undefined;
    const clean = id.trim().toUpperCase();
    return shipments.find((s) => s.id.toUpperCase() === clean || s.trackingId.toUpperCase() === clean);
  };

  const createShipment = (
    data: Omit<Shipment, 'id' | 'trackingId' | 'createdAt' | 'timeline' | 'status'>
  ): Shipment => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const destCode = (data.receiver.city || 'IND').slice(0, 3).toUpperCase();
    const trackingId = `SL-${destCode}-${randomSuffix}`;
    const now = new Date();
    const nowIso = now.toISOString();
    const nowFormatted = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isHub = data.deliveryType === 'HUB_PICKUP';
    const pickupRef = isHub ? `REF-${randomSuffix}-PK` : undefined;
    const pickupOtp = isHub ? `${Math.floor(1000 + Math.random() * 9000)}` : undefined;

    const initialEvent = {
      id: `EVT-${Date.now()}-1`,
      timestamp: `${nowFormatted}`,
      status: 'BOOKED' as ShipmentStatus,
      title: isHub ? 'Booking Registered (Regional Hub Pickup Allocation)' : 'Consignment Booked & Electronic Waybill Issued',
      location: `${data.sender.city} Cargo Commercial Terminal`,
      facility: `Speed Logistics ${data.sender.city} Operations`,
      description: isHub
        ? `Consignment booked for collection at ${data.assignedHub?.name || 'Nearest Eligible Hub'}. Pickup reference ${pickupRef} reserved.`
        : `Doorstep delivery order confirmed for PIN ${data.receiver.pinCode}. E-Waybill generated. Barcode dispatched.`,
      operator: 'Central Dispatch Automated Desk',
      isCompleted: true,
    };

    const newShipment: Shipment = {
      ...data,
      id: trackingId,
      trackingId,
      createdAt: nowIso,
      status: 'BOOKED',
      pickupReferenceCode: pickupRef,
      pickupSecurityOtp: pickupOtp,
      timeline: [initialEvent],
    };

    updateShipmentsState((prev) => [newShipment, ...prev]);
    setSelectedTrackingId(trackingId);
    return newShipment;
  };

  const advanceShipmentStatus = (shipmentId: string, nextStatus: ShipmentStatus, note?: string) => {
    const nowFormatted = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    updateShipmentsState((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;

        const isHub = s.deliveryType === 'HUB_PICKUP';
        let eventTitle = `Status updated to ${nextStatus.replace(/_/g, ' ')}`;
        let eventDesc = note || `Shipment milestone advanced by operator console to ${nextStatus}.`;
        let location = s.route.currentMilestone;

        if (nextStatus === 'PICKED_UP') {
          eventTitle = 'Cargo Picked Up from Consignor';
          location = `${s.sender.city} Pickup Bay`;
          eventDesc = note || 'Cargo physically collected from sender facility by local feeder truck. En route to origin warehouse.';
        } else if (nextStatus === 'ARRIVED_AT_ORIGIN_WAREHOUSE') {
          eventTitle = `Cargo Received at Origin Warehouse: ${s.route.originHub}`;
          location = s.route.originHub;
          eventDesc = note || 'Inward dock scan completed. Staged on floor for safety check and warehouse approval.';
        } else if (nextStatus === 'ORIGIN_WAREHOUSE_APPROVED') {
          eventTitle = 'Origin Warehouse Staff Inspection Passed & Approved';
          location = s.route.originHub;
          eventDesc = note || 'Origin warehouse staff verified physical parcel weight, barcode label, and container security. Cleared for linehaul transit.';
        } else if (nextStatus === 'IN_TRANSIT') {
          eventTitle = `Dispatched on Highway Linehaul: ${s.route.transitCorridor}`;
          location = `${s.route.originCity} to ${s.route.destinationCity} Highway Corridor`;
          eventDesc = note || 'Container sealed and departed origin warehouse on express linehaul transit.';
        } else if (nextStatus === 'ARRIVED_AT_HUB') {
          eventTitle = `Cargo Arrived at ${s.assignedHub ? s.assignedHub.name : s.route.destinationHub}`;
          location = s.assignedHub ? s.assignedHub.name : s.route.destinationHub;
          eventDesc = isHub
            ? 'Inward scan completed at regional pickup hub. Awaiting staff inspection and customer pickup staging.'
            : 'Inward sorting completed at destination delivery center.';
        } else if (nextStatus === 'READY_FOR_PICKUP') {
          eventTitle = 'Hub Staff Inspection Passed — Ready for Customer Pickup';
          location = s.assignedHub ? s.assignedHub.name : 'Regional Collection Counter';
          eventDesc = `Staff physically verified parcel security. Security OTP: ${s.pickupSecurityOtp || '4892'}. Customer notified.`;
        } else if (nextStatus === 'OUT_FOR_DELIVERY') {
          eventTitle = 'Out for Doorstep Delivery with Courier Agent';
          location = `${s.receiver.city} Last-Mile Delivery Zone`;
          eventDesc = `Delivery vehicle dispatched. Courier: ${s.courierAgentName || 'Express Courier Agent'}.`;
        } else if (nextStatus === 'DELIVERED') {
          eventTitle = 'Successfully Delivered to Recipient';
          location = `${s.receiver.address}, ${s.receiver.city}`;
          eventDesc = 'Customer received consignment in good condition. Handover confirmed.';
        } else if (nextStatus === 'COLLECTED') {
          eventTitle = 'Cargo Collected by Consignee at Hub Counter';
          location = s.assignedHub ? s.assignedHub.name : 'Regional Pickup Counter';
          eventDesc = `Consignee presented valid reference (${s.pickupReferenceCode || 'Verified'}). Staff confirmed identity and handed over cargo.`;
        } else if (nextStatus === 'DELAYED') {
          eventTitle = 'Operational Advisory: Transit Delay Reported';
          location = s.route.currentMilestone;
          eventDesc = note || 'Route congestion or clearance delay. Tracking milestone revised.';
        }

        const newEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: nowFormatted,
          status: nextStatus,
          title: eventTitle,
          location,
          facility: s.assignedHub?.name || s.route.destinationHub,
          description: eventDesc,
          operator: 'Operator Console / Dispatch Officer',
          isCompleted: true,
        };

        return {
          ...s,
          status: nextStatus,
          isDelayed: nextStatus === 'DELAYED',
          delayReason: nextStatus === 'DELAYED' ? (note || 'Operational highway delay') : undefined,
          timeline: [...s.timeline, newEvent],
        };
      })
    );
  };

  const receiveAtOriginWarehouse = (shipmentId: string, staffName: string) => {
    advanceShipmentStatus(
      shipmentId,
      'ARRIVED_AT_ORIGIN_WAREHOUSE',
      `Inward dock receipt verified by ${staffName}. Parcel logged into sorting system.`
    );
  };

  const approveAtOriginWarehouse = (shipmentId: string, staffName: string, note?: string) => {
    advanceShipmentStatus(
      shipmentId,
      'ORIGIN_WAREHOUSE_APPROVED',
      note || `Physical packaging & weight verified by warehouse supervisor ${staffName}. Cargo approved for outbound linehaul.`
    );
  };

  const allocateTransportMode = (
    shipmentId: string,
    transportDetails: TransportDetails,
    staffName: string
  ) => {
    const nowFormatted = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const modeLabels: Record<string, string> = {
      AIR: 'Air Freight Cargo Flight',
      OCEAN: 'Ocean Freight Container Vessel',
      RAIL: 'International Rail Cargo',
      ROAD: 'Cross-Border Road Hauler',
    };

    const modeIcons: Record<string, string> = {
      AIR: '✈️',
      OCEAN: '🚢',
      RAIL: '🚆',
      ROAD: '🚛',
    };

    const modeName = modeLabels[transportDetails.mode] || transportDetails.mode;
    const modeIcon = modeIcons[transportDetails.mode] || '📦';

    updateShipmentsState((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;

        const updatedRoute = {
          ...s.route,
          transitCorridor: `${s.route.originCity} (${s.sender.country || 'India'}) to ${s.route.destinationCity} (${s.receiver.country || 'International'}) via ${modeName} [${transportDetails.identifier}]`,
          departureTerminal: transportDetails.departureTerminal,
          arrivalTerminal: transportDetails.arrivalTerminal,
        };

        const newEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: nowFormatted,
          status: 'ORIGIN_WAREHOUSE_APPROVED' as ShipmentStatus,
          title: `${modeIcon} Transport Allocated & Approved: ${modeName} (${transportDetails.carrierName} ${transportDetails.identifier})`,
          location: s.route.originHub,
          facility: s.route.originHub,
          description: `Origin warehouse supervisor ${staffName} inspected cargo packaging and export compliance (Declaration: ${transportDetails.customsDeclarationCode || 'EXP-AUTO-VERIFIED'}), and assigned transport mode: ${modeName} departing ${transportDetails.departureTerminal} to ${transportDetails.arrivalTerminal}. Cleared for linehaul dispatch.`,
          operator: `${staffName} (Origin Warehouse Operations)`,
          isCompleted: true,
        };

        return {
          ...s,
          status: 'ORIGIN_WAREHOUSE_APPROVED' as ShipmentStatus,
          transportMode: transportDetails.mode,
          transportDetails,
          route: updatedRoute,
          timeline: [...s.timeline, newEvent],
        };
      })
    );
  };

  const confirmWarehouseInspection = (shipmentId: string, staffName: string) => {
    const nowFormatted = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    updateShipmentsState((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;

        const otp = s.pickupSecurityOtp || `${Math.floor(1000 + Math.random() * 9000)}`;
        const ref = s.pickupReferenceCode || `REF-${s.id.slice(-4)}-PK`;

        const newEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: nowFormatted,
          status: 'READY_FOR_PICKUP' as ShipmentStatus,
          title: 'Destination Hub Inspection Passed: Ready for Customer Collection',
          location: s.assignedHub?.name || 'Regional Hub Counter Bay 01',
          facility: s.assignedHub?.name || 'Speed Logistics Regional Hub',
          description: `Hub staff ${staffName} conducted physical verification. Pallet moved to Customer Pickup Vault. Customer notification dispatched with Reference Code ${ref} and OTP ${otp}.`,
          operator: `${staffName} (Warehouse Operations)`,
          isCompleted: true,
        };

        return {
          ...s,
          status: 'READY_FOR_PICKUP',
          pickupSecurityOtp: otp,
          pickupReferenceCode: ref,
          pickupReadyAt: nowFormatted,
          pickupStaffConfirmedAt: nowFormatted,
          pickupStaffName: staffName,
          timeline: [...s.timeline, newEvent],
        };
      })
    );
  };

  const divertToWarehousePickup = (
    shipmentId: string,
    warehouseId: string,
    reason: string,
    staffName: string
  ) => {
    const hub = DEMO_HUBS[warehouseId] || DEMO_HUBS['HUB-VJA-ROAD'];
    const now = new Date();
    const nowFormatted = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    updateShipmentsState((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;

        const pickupRef = s.pickupReferenceCode || `REF-${s.id.slice(-4) || randomSuffix}-PK`;
        const pickupOtp = s.pickupSecurityOtp || `${Math.floor(1000 + Math.random() * 9000)}`;

        const newEvent: CheckpointEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: nowFormatted,
          status: 'READY_FOR_PICKUP' as ShipmentStatus,
          title: '📍 Delivery Location Unavailable — Held for Customer Warehouse Collection',
          location: `${hub.name}, ${hub.city}`,
          facility: hub.name,
          description: `Consignee delivery address is unreachable or out of service area (${reason || 'Doorstep delivery unavailable'}). Consignment safely transferred to nearby warehouse hub (${hub.name}, ${hub.address}). Customer notified to collect at warehouse counter with Pickup Reference ${pickupRef} and OTP ${pickupOtp}.`,
          operator: `${staffName} (Delivery Exception Desk)`,
          isCompleted: true,
        };

        return {
          ...s,
          deliveryType: 'HUB_PICKUP' as DeliveryType,
          status: 'READY_FOR_PICKUP' as ShipmentStatus,
          assignedHub: { ...hub, distanceKm: 5.2 },
          isLocationUnavailable: true,
          locationUnavailableReason: reason,
          divertedToHubId: hub.id,
          divertedAt: nowFormatted,
          pickupReferenceCode: pickupRef,
          pickupSecurityOtp: pickupOtp,
          pickupReadyAt: nowFormatted,
          timeline: [...s.timeline, newEvent],
        };
      })
    );
  };

  const confirmCollection = (
    shipmentId: string,
    verifiedReference: string,
    staffName: string
  ): { success: boolean; message: string } => {
    const shipment = shipments.find((s) => s.id === shipmentId);
    if (!shipment) {
      return { success: false, message: 'Shipment not found' };
    }

    if (shipment.status !== 'READY_FOR_PICKUP') {
      return {
        success: false,
        message: `Cargo cannot be collected because its current status is "${shipment.status.replace(/_/g, ' ')}". Cargo must be marked "Ready for Pickup" first by hub staff.`,
      };
    }

    const cleanRef = verifiedReference.trim().toUpperCase();
    const expectedRef = (shipment.pickupReferenceCode || '').trim().toUpperCase();
    const expectedOtp = (shipment.pickupSecurityOtp || '').trim().toUpperCase();

    if (cleanRef !== expectedRef && cleanRef !== expectedOtp && cleanRef !== shipment.id.toUpperCase()) {
      return {
        success: false,
        message: `Invalid Pickup Reference or OTP. Expected Reference: ${shipment.pickupReferenceCode} or OTP: ${shipment.pickupSecurityOtp}`,
      };
    }

    const nowFormatted = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    updateShipmentsState((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;

        const newEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: nowFormatted,
          status: 'COLLECTED' as ShipmentStatus,
          title: 'Cargo Formally Collected by Recipient',
          location: s.assignedHub?.name || 'Customer Pickup Counter',
          facility: s.assignedHub?.name || 'Speed Logistics Regional Hub',
          description: `Consignee ${s.receiver.name} physically received consignment. Verification code ${verifiedReference} validated by Officer ${staffName}. Gate pass released.`,
          operator: `${staffName} (Collection Officer)`,
          isCompleted: true,
        };

        return {
          ...s,
          status: 'COLLECTED',
          timeline: [...s.timeline, newEvent],
        };
      })
    );

    return {
      success: true,
      message: `Collection confirmed successfully for ${shipment.id}! Status is now marked as COLLECTED.`,
    };
  };

  const autoRerouteShipment = (
    shipmentId: string,
    customAlternative?: AlternativeRouteProposal,
    staffName?: string
  ) => {
    const now = new Date();
    const nowFormatted = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    updateShipmentsState((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;

        const alt = customAlternative || getAlternativeForShipment(s.receiver.country, s.transportMode);

        const notif: CustomerNotification = {
          id: `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          shipmentId: s.id,
          trackingId: s.id,
          recipientName: s.receiver.name,
          recipientPhone: s.receiver.phone,
          recipientEmail: s.receiver.email || 'customer@speedlogistics.demo',
          channel: 'WHATSAPP',
          title: '⚡ Airspace Disruption Notice: Consignment Dynamically Rerouted',
          message: `Speed Logistics Update: Your shipment ${s.id} to ${s.receiver.city} has been rerouted due to European/Gulf weather & airspace restrictions. Contingency linehaul allocated: ${alt.title} (${alt.carrierName} ${alt.identifier}). Revised Delivery ETA: ${new Date(alt.newEstimatedArrival).toLocaleDateString()}. Track live: https://speedlogistics.demo/track?id=${s.id}`,
          sentAt: nowFormatted,
          deliveryStatus: 'DELIVERED',
        };

        const rerouteEvent: CheckpointEvent = {
          id: `EVT-${Date.now()}`,
          timestamp: nowFormatted,
          status: s.status === 'BOOKED' ? 'ORIGIN_WAREHOUSE_APPROVED' : s.status,
          title: `⚡ Dynamic Reroute Executed: Transferred to ${alt.mode === 'OCEAN' ? '🚢 Ocean Cargo Vessel' : alt.mode === 'RAIL' ? '🚆 Intermodal Rail' : '🚛 Road Hauler'} (${alt.carrierName})`,
          location: alt.departureTerminal,
          facility: alt.departureTerminal,
          description: `Primary scheduled flight grounded due to severe weather & airspace restrictions. Autonomous Dynamic Reroute Engine diverted cargo to multi-modal contingency corridor: ${alt.title} (${alt.identifier}). Transit change: ${alt.estimatedTransitChange}. Customer WhatsApp/SMS dispatched.`,
          operator: `${staffName || 'Dynamic Route Optimization Engine'} (Airspace Disruption Desk)`,
          isCompleted: true,
        };

        return {
          ...s,
          isRerouted: true,
          rerouteCount: (s.rerouteCount || 0) + 1,
          reroutedAt: nowFormatted,
          reroutedReason: alt.rationale,
          originalRoute: s.originalRoute || s.route,
          originalTransportDetails: s.originalTransportDetails || s.transportDetails,
          transportMode: alt.mode,
          transportDetails: {
            mode: alt.mode,
            carrierName: alt.carrierName,
            identifier: alt.identifier,
            departureTerminal: alt.departureTerminal,
            arrivalTerminal: alt.arrivalTerminal,
            customsDeclarationCode: s.transportDetails?.customsDeclarationCode || 'EXP-REROUTE-VERIFIED',
            assignedByStaff: staffName || 'Autonomous Dynamic Rerouting Engine',
            assignedAt: nowFormatted,
          },
          estimatedArrival: alt.newEstimatedArrival,
          route: {
            ...s.route,
            transitCorridor: `${s.route.originCity} to ${s.route.destinationCity} via ${alt.title} [${alt.identifier}]`,
          },
          timeline: [...s.timeline, rerouteEvent],
          customerNotifications: [notif, ...(s.customerNotifications || [])],
        };
      })
    );
  };

  const autoRerouteAllAffected = (_disruptionId?: string, staffName?: string): { reroutedCount: number } => {
    let count = 0;
    const now = new Date();
    const nowFormatted = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    updateShipmentsState((prev) =>
      prev.map((s) => {
        // Reroute active shipments that are not completed
        if (s.status === 'DELIVERED' || s.status === 'COLLECTED') return s;

        const alt = getAlternativeForShipment(s.receiver.country, s.transportMode);
        count++;

        const notif: CustomerNotification = {
          id: `NOTIF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          shipmentId: s.id,
          trackingId: s.id,
          recipientName: s.receiver.name,
          recipientPhone: s.receiver.phone,
          recipientEmail: s.receiver.email || 'customer@speedlogistics.demo',
          channel: 'WHATSAPP',
          title: '⚡ Fleet Emergency Reroute: Airspace Contingency Active',
          message: `Speed Logistics Advisory: Due to changing weather and airspace restrictions, consignment ${s.id} is diverted to ${alt.title} (${alt.identifier}). New ETA: ${new Date(alt.newEstimatedArrival).toLocaleDateString()}. Track: https://speedlogistics.demo/track?id=${s.id}`,
          sentAt: nowFormatted,
          deliveryStatus: 'DELIVERED',
        };

        const rerouteEvent: CheckpointEvent = {
          id: `EVT-${Date.now()}-${count}`,
          timestamp: nowFormatted,
          status: s.status === 'BOOKED' ? 'ORIGIN_WAREHOUSE_APPROVED' : s.status,
          title: `⚡ Fleet Airspace Bypass: Diverted to ${alt.mode === 'OCEAN' ? '🚢 Ocean Cargo' : alt.mode === 'RAIL' ? '🚆 Intermodal Rail' : '🚛 Road Freight'}`,
          location: alt.departureTerminal,
          facility: alt.departureTerminal,
          description: `Emergency airspace bypass: Flight cancelled due to regional turbulence/closure. Diverted to contingency corridor ${alt.title}. Automated customer notification dispatched.`,
          operator: `${staffName || 'Dynamic Fleet Optimizer'} (Airspace Disruption Desk)`,
          isCompleted: true,
        };

        return {
          ...s,
          isRerouted: true,
          rerouteCount: (s.rerouteCount || 0) + 1,
          reroutedAt: nowFormatted,
          reroutedReason: alt.rationale,
          originalRoute: s.originalRoute || s.route,
          originalTransportDetails: s.originalTransportDetails || s.transportDetails,
          transportMode: alt.mode,
          transportDetails: {
            mode: alt.mode,
            carrierName: alt.carrierName,
            identifier: alt.identifier,
            departureTerminal: alt.departureTerminal,
            arrivalTerminal: alt.arrivalTerminal,
            customsDeclarationCode: s.transportDetails?.customsDeclarationCode || 'EXP-REROUTE-VERIFIED',
            assignedByStaff: staffName || 'Dynamic Fleet Optimizer',
            assignedAt: nowFormatted,
          },
          estimatedArrival: alt.newEstimatedArrival,
          route: {
            ...s.route,
            transitCorridor: `${s.route.originCity} to ${s.route.destinationCity} via ${alt.title} [${alt.identifier}]`,
          },
          timeline: [...s.timeline, rerouteEvent],
          customerNotifications: [notif, ...(s.customerNotifications || [])],
        };
      })
    );

    return { reroutedCount: count };
  };

  const revertReroute = (shipmentId: string) => {
    updateShipmentsState((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId || !s.originalRoute || !s.originalTransportDetails) return s;

        return {
          ...s,
          isRerouted: false,
          route: s.originalRoute,
          transportMode: s.originalTransportDetails.mode,
          transportDetails: s.originalTransportDetails,
        };
      })
    );
  };

  const sendCustomerNotification = (
    shipmentId: string,
    channel: 'SMS' | 'WHATSAPP' | 'EMAIL',
    customMsg?: string
  ) => {
    const nowFormatted = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    updateShipmentsState((prev) =>
      prev.map((s) => {
        if (s.id !== shipmentId) return s;

        const notif: CustomerNotification = {
          id: `NOTIF-${Date.now()}`,
          shipmentId: s.id,
          trackingId: s.id,
          recipientName: s.receiver.name,
          recipientPhone: s.receiver.phone,
          recipientEmail: s.receiver.email || 'customer@speedlogistics.demo',
          channel,
          title: `Delivery Milestone Advisory (${channel})`,
          message: customMsg || `Speed Logistics Alert for ${s.id}: Consignment status is ${s.status.replace(/_/g, ' ')}. Estimated arrival: ${new Date(s.estimatedArrival).toLocaleDateString()}. Track live on console.`,
          sentAt: nowFormatted,
          deliveryStatus: 'DELIVERED',
        };

        return {
          ...s,
          customerNotifications: [notif, ...(s.customerNotifications || [])],
        };
      })
    );
  };

  const simulateDelay = (shipmentId: string, reason: string) => {
    advanceShipmentStatus(shipmentId, 'DELAYED', reason);
  };

  const resolveDelay = (shipmentId: string) => {
    advanceShipmentStatus(shipmentId, 'IN_TRANSIT', 'Delay resolved. Express linehaul transit resumed.');
  };

  const clearAllShipments = () => {
    localStorage.removeItem(STORAGE_KEY);
    updateShipmentsState(() => []);
    setSelectedTrackingId(null);
    setCurrentView('create');
  };

  const resetDemoData = () => {
    clearAllShipments();
  };

  const loadScenario = (scenarioId: string) => {
    if (scenarioId === 'create-demo') {
      setCurrentView('create');
    }
  };

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        currentView,
        setCurrentView,
        selectedTrackingId,
        setSelectedTrackingId,
        searchQuery,
        setSearchQuery,
        getShipment,
        createShipment,
        advanceShipmentStatus,
        receiveAtOriginWarehouse,
        approveAtOriginWarehouse,
        allocateTransportMode,
        confirmWarehouseInspection,
        divertToWarehousePickup,
        confirmCollection,
        simulateDelay,
        resolveDelay,
        clearAllShipments,
        resetDemoData,
        loadScenario,
        isCloudSyncing,
        cloudSyncStatus,
        lastCloudSyncTime,
        syncWithCloud,
        counts,
        activeDisruptions: ACTIVE_SYSTEM_DISRUPTIONS,
        autoRerouteShipment,
        autoRerouteAllAffected,
        revertReroute,
        sendCustomerNotification,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
};

export const useShipments = () => {
  const context = useContext(ShipmentContext);
  if (!context) {
    throw new Error('useShipments must be used within a ShipmentProvider');
  }
  return context;
};
