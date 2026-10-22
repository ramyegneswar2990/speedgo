import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Shipment, ShipmentStatus, TransportDetails } from '../types/logistics';
import { INITIAL_MOCK_SHIPMENTS } from '../data/mockShipments';

export type ViewType = 'dashboard' | 'create' | 'track' | 'warehouse' | 'details';

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
  simulateDelay: (shipmentId: string, reason: string) => void;
  resolveDelay: (shipmentId: string) => void;
  clearAllShipments: () => void;
  resetDemoData: () => void;
  loadScenario: (scenarioId: string) => void;
  
  // Metrics for dashboard cards
  counts: {
    total: number;
    inTransit: number;
    delivered: number;
    delayed: number;
    inWarehouse: number; // In origin warehouse, approved, or destination hub
    awaitingPickup: number; // READY_FOR_PICKUP for hub pickup
    outForDelivery: number;
  };
}

// Dedicated fresh storage key so all old mock data is removed
const STORAGE_KEY = 'speed_logistics_user_manual_v3';

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

  // Persist to localStorage whenever shipments change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [shipments]);

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

    setShipments((prev) => [newShipment, ...prev]);
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

    setShipments((prev) =>
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

    setShipments((prev) =>
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

    setShipments((prev) =>
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

    setShipments((prev) =>
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

  const simulateDelay = (shipmentId: string, reason: string) => {
    advanceShipmentStatus(shipmentId, 'DELAYED', reason);
  };

  const resolveDelay = (shipmentId: string) => {
    advanceShipmentStatus(shipmentId, 'IN_TRANSIT', 'Delay resolved. Express linehaul transit resumed.');
  };

  const clearAllShipments = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShipments([]);
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
        confirmCollection,
        simulateDelay,
        resolveDelay,
        clearAllShipments,
        resetDemoData,
        loadScenario,
        counts,
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
