import React, { useState } from 'react';
import { useShipments } from '../context/ShipmentContext';
import { StatusBadge, DeliveryTypeBadge, TransportModeBadge } from '../components/StatusBadge';
import { DEMO_HUBS, TERMINAL_PRESETS_BY_MODE } from '../data/serviceAreas';
import type { Shipment, TransportMode, TransportDetails } from '../types/logistics';
import { 
  Building2, 
  PackageCheck, 
  CheckCheck, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Clock, 
  AlertCircle,
  CheckCircle2, 
  Lock, 
  Sparkles,
  PlusCircle,
  Truck,
  Plane,
  Ship,
  Train,
  X,
  Zap
} from 'lucide-react';

export const WarehouseOpsPage: React.FC = () => {
  const { 
    shipments, 
    advanceShipmentStatus,
    receiveAtOriginWarehouse,
    allocateTransportMode,
    confirmWarehouseInspection, 
    divertToWarehousePickup,
    confirmCollection, 
    setSelectedTrackingId, 
    setCurrentView,
    autoRerouteShipment,
    autoRerouteAllAffected,
    activeDisruptions
  } = useShipments();

  const [selectedHubId, setSelectedHubId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'ORIGIN' | 'DEST_HUB' | 'READY' | 'COMPLETED' | 'ALL'>('ORIGIN');
  const [operatorStaffName, setOperatorStaffName] = useState('D. Narsimha (Shift Officer)');

  // Collection modal states
  const [verifyingShipmentId, setVerifyingShipmentId] = useState<string | null>(null);
  const [inputReference, setInputReference] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Location unavailable diversion modal states
  const [divertingShipmentId, setDivertingShipmentId] = useState<string | null>(null);
  const [divertHubId, setDivertHubId] = useState<string>('HUB-VJA-ROAD');
  const [divertReason, setDivertReason] = useState<string>('Destination address unreachable / remote unserviceable courier zone');

  // Transport mode allocation modal states
  const [allocatingShipmentId, setAllocatingShipmentId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<TransportMode>('AIR');
  const [carrierName, setCarrierName] = useState('');
  const [transportIdentifier, setTransportIdentifier] = useState('');
  const [departureTerminal, setDepartureTerminal] = useState('');
  const [arrivalTerminal, setArrivalTerminal] = useState('');
  const [customsDeclarationCode, setCustomsDeclarationCode] = useState('');
  const [inspectionPassed, setInspectionPassed] = useState(true);

  // Filter shipments for warehouse operations
  const warehouseShipments = shipments.filter((s) => {
    // Filter by hub facility if not ALL
    if (selectedHubId !== 'ALL') {
      if (s.assignedHub && s.assignedHub.id !== selectedHubId) return false;
    }

    // Filter by tab
    if (activeTab === 'ORIGIN') {
      return (
        s.status === 'BOOKED' ||
        s.status === 'PICKED_UP' ||
        s.status === 'ARRIVED_AT_ORIGIN_WAREHOUSE' ||
        s.status === 'ORIGIN_WAREHOUSE_APPROVED'
      );
    }
    if (activeTab === 'DEST_HUB') {
      return s.status === 'ARRIVED_AT_HUB';
    }
    if (activeTab === 'READY') {
      return s.status === 'READY_FOR_PICKUP';
    }
    if (activeTab === 'COMPLETED') {
      return s.status === 'COLLECTED' || s.status === 'DELIVERED';
    }

    return true;
  });

  const selectedShipmentForCollection = shipments.find((s) => s.id === verifyingShipmentId);
  const selectedShipmentForDiversion = shipments.find((s) => s.id === divertingShipmentId);

  const handleOpenCollectionModal = (shipmentId: string) => {
    const target = shipments.find((s) => s.id === shipmentId);
    setVerifyingShipmentId(shipmentId);
    setInputReference(target?.pickupReferenceCode || '');
    setVerificationFeedback(null);
  };

  const handleExecuteCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingShipmentId) return;

    const result = confirmCollection(verifyingShipmentId, inputReference, operatorStaffName);
    if (result.success) {
      setVerificationFeedback({ type: 'success', message: result.message });
      setTimeout(() => {
        setVerifyingShipmentId(null);
        setVerificationFeedback(null);
      }, 1500);
    } else {
      setVerificationFeedback({ type: 'error', message: result.message });
    }
  };

  const selectedShipmentForAllocation = shipments.find((s) => s.id === allocatingShipmentId);

  const handleOpenAllocationModal = (shipment: Shipment) => {
    setAllocatingShipmentId(shipment.id);

    // Default mode
    const defaultMode: TransportMode = shipment.transportMode || 'AIR';
    setSelectedMode(defaultMode);

    if (shipment.transportDetails) {
      setCarrierName(shipment.transportDetails.carrierName);
      setTransportIdentifier(shipment.transportDetails.identifier);
      setDepartureTerminal(shipment.transportDetails.departureTerminal);
      setArrivalTerminal(shipment.transportDetails.arrivalTerminal);
      setCustomsDeclarationCode(shipment.transportDetails.customsDeclarationCode || `EXP-${shipment.id.replace('SL-', '')}`);
    } else {
      // Pick sensible preset for default mode
      const presets = TERMINAL_PRESETS_BY_MODE[defaultMode];
      const preset = presets ? presets[0] : { carrier: 'Speed Logistics Air Cargo', flight: 'SL-AIR-99', departure: 'Hyderabad Air Cargo (HYD)', arrival: 'Dubai Cargo (DXB)' };
      setCarrierName(preset.carrier);
      setTransportIdentifier(preset.flight);
      setDepartureTerminal(preset.departure);
      setArrivalTerminal(preset.arrival);
      setCustomsDeclarationCode(`EXP-IND-${shipment.id.replace('SL-', '')}`);
    }
    setInspectionPassed(true);
  };

  const handleSelectMode = (mode: TransportMode) => {
    setSelectedMode(mode);
    const presets = TERMINAL_PRESETS_BY_MODE[mode];
    if (presets && presets.length > 0) {
      const p = presets[0];
      setCarrierName(p.carrier);
      setTransportIdentifier(p.flight);
      setDepartureTerminal(p.departure);
      setArrivalTerminal(p.arrival);
    }
  };

  const handleApplyPreset = (p: { departure: string; arrival: string; carrier: string; flight: string }) => {
    setCarrierName(p.carrier);
    setTransportIdentifier(p.flight);
    setDepartureTerminal(p.departure);
    setArrivalTerminal(p.arrival);
  };

  const handleExecuteAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingShipmentId) return;

    const details: TransportDetails = {
      mode: selectedMode,
      carrierName: carrierName.trim() || 'Speed International Cargo',
      identifier: transportIdentifier.trim() || 'CARGO-001',
      departureTerminal: departureTerminal.trim() || 'Origin International Terminal',
      arrivalTerminal: arrivalTerminal.trim() || 'Destination Port Terminal',
      customsDeclarationCode: customsDeclarationCode.trim() || 'EXP-AUTO-VERIFIED',
    };

    allocateTransportMode(allocatingShipmentId, details, operatorStaffName);
    setAllocatingShipmentId(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              Warehouse Terminal Operations
            </span>
            <span className="text-slate-400 text-xs">• Inward Approvals & Handover Desk</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Warehouse Inspection & Approvals
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Enforces strict two-tier verification: Cargo picked from sender is verified and approved at the origin warehouse before dispatch, and staged for verified collection upon destination arrival.
          </p>
        </div>

        {/* Staff Officer Stamp */}
        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Active Warehouse Officer</span>
            <input
              type="text"
              value={operatorStaffName}
              onChange={(e) => setOperatorStaffName(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-400 focus:outline-none"
              title="Click to edit officer signature"
            />
          </div>
        </div>
      </div>

      {/* Critical Business Rule Banner */}
      <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-amber-950">Operational Protocol Enforcement:</strong>
          <p className="leading-relaxed text-amber-900">
            Cargo cannot jump directly to linehaul transit. Once picked from the sender, it must be received at the warehouse and inspected by staff to gain <strong>Warehouse Approval</strong>. Then, upon destination arrival, it must be staged and released only upon valid OTP / Reference verification.
          </p>
        </div>
      </div>

      {/* Dynamic Airspace & Weather Contingency Advisory Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 border border-purple-500/60 rounded-2xl p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shrink-0 text-lg mt-0.5 shadow-md shadow-purple-950">
            ⚡
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-sm text-purple-200">
                Airspace & Weather Contingency Routing Desk
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {activeDisruptions.length} NOTAM Flight Groundings Active
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Severe storms & airspace closures in Gulf, Central Europe, and SE Asia corridors have grounded commercial flights. Warehouse officers can dynamically divert air consignments to guaranteed Maritime Express (Ocean) or High-Speed Rail corridors with automated customer notification dispatch.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const res = autoRerouteAllAffected(undefined, operatorStaffName);
            alert(
              res.reroutedCount > 0
                ? `⚡ Successfully rerouted ${res.reroutedCount} air cargo consignments to alternative maritime and rail corridors! Automated customer notifications have been dispatched.`
                : 'All air cargo is already safely rerouted to contingency corridors.'
            );
          }}
          className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shrink-0 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          <span>⚡ Auto-Reroute All Air Freight</span>
        </button>
      </div>

      {/* Hub Filter & Tabs Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Hub Facility Selector */}
        <div className="flex items-center gap-2 text-xs">
          <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="font-semibold text-slate-700">Hub Facility:</span>
          <select
            value={selectedHubId}
            onChange={(e) => setSelectedHubId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Regional Warehouses (Consolidated)</option>
            {Object.values(DEMO_HUBS).map((hub) => (
              <option key={hub.id} value={hub.id}>
                {hub.name} ({hub.city})
              </option>
            ))}
          </select>
        </div>

        {/* Workflow Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('ORIGIN')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'ORIGIN'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Origin Inward & Approvals</span>
          </button>

          <button
            onClick={() => setActiveTab('DEST_HUB')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'DEST_HUB'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>2. Destination Hub Inward</span>
          </button>

          <button
            onClick={() => setActiveTab('READY')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'READY'
                ? 'bg-amber-500 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>3. Ready for Pickup Counter</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'COMPLETED'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Fulfilled</span>
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Shipments List */}
      <div className="space-y-4">
        {warehouseShipments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No Consignments in this Queue</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              There are currently no shipments waiting in this stage. Create a new consignment to start the lifecycle from pickup $\rightarrow$ warehouse approval $\rightarrow$ transit.
            </p>
            <button
              onClick={() => setCurrentView('create')}
              className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Shipment</span>
            </button>
          </div>
        ) : (
          warehouseShipments.map((shipment) => {
            const isBooked = shipment.status === 'BOOKED';
            const isPickedUp = shipment.status === 'PICKED_UP';
            const isAtOrigin = shipment.status === 'ARRIVED_AT_ORIGIN_WAREHOUSE';
            const isOriginApproved = shipment.status === 'ORIGIN_WAREHOUSE_APPROVED';
            const isArrivedDest = shipment.status === 'ARRIVED_AT_HUB';
            const isReady = shipment.status === 'READY_FOR_PICKUP';
            const isCollected = shipment.status === 'COLLECTED';
            const isDelivered = shipment.status === 'DELIVERED';

            return (
              <div
                key={shipment.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-slate-900">
                          {shipment.id}
                        </span>
                        <StatusBadge status={shipment.status} size="sm" />
                        <DeliveryTypeBadge type={shipment.deliveryType} size="sm" />
                        <TransportModeBadge mode={shipment.transportMode} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {shipment.category} • {shipment.weightKg} kg • {shipment.pieces} packages
                        {shipment.transportDetails && (
                          <span className="font-medium text-purple-700 ml-1">
                            • Mode: {shipment.transportDetails.carrierName} ({shipment.transportDetails.identifier})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Route & Hub */}
                  <div className="text-right text-xs">
                    <div className="font-semibold text-slate-900">
                      {shipment.route.originCity} ({shipment.sender.country || 'India'}) → {shipment.route.destinationCity} ({shipment.receiver.country || 'International'})
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Origin Hub: <span className="font-medium text-slate-700">{shipment.route.originHub}</span>
                    </div>
                  </div>
                </div>

                {/* Location Unavailable Notice Banner */}
                {shipment.isLocationUnavailable && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <strong className="text-amber-900 font-bold">Delivery Location Unavailable — Customer Warehouse Pickup: </strong>
                        <span className="text-amber-800">
                          Consignment held at <strong>{shipment.assignedHub?.name || 'Nearest Regional Hub'}</strong>. Customer must come and collect.
                        </span>
                        {shipment.locationUnavailableReason && (
                          <span className="text-[11px] text-amber-700 block italic">({shipment.locationUnavailableReason})</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono font-bold bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded">
                        Ref: {shipment.pickupReferenceCode || '---'}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-brand-100 text-brand-900 px-2 py-0.5 rounded">
                        OTP: {shipment.pickupSecurityOtp || '---'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Consignor (Sender)</span>
                    <strong className="text-slate-900 font-bold block">{shipment.sender.name}</strong>
                    <span className="text-slate-500 font-mono">{shipment.sender.phone}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate">{shipment.sender.address}, {shipment.sender.city} ({shipment.sender.country || 'India'})</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Consignee (Recipient)</span>
                    <strong className="text-slate-900 font-bold block">{shipment.receiver.name}</strong>
                    <span className="text-slate-500 font-mono">{shipment.receiver.phone}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate">{shipment.receiver.address}, PIN {shipment.receiver.pinCode} ({shipment.receiver.country || 'International'})</p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Assigned Facility & Transport</span>
                    <strong className="text-slate-900 font-bold block">
                      {shipment.assignedHub?.name || shipment.route.destinationHub}
                    </strong>
                    {shipment.transportDetails ? (
                      <p className="text-purple-700 font-mono font-bold text-[11px] mt-0.5">
                        {shipment.transportMode === 'AIR' ? '✈️ Flight' : shipment.transportMode === 'OCEAN' ? '🚢 Ship' : shipment.transportMode === 'RAIL' ? '🚆 Train' : '🚛 Road'}: {shipment.transportDetails.carrierName} ({shipment.transportDetails.identifier})
                      </p>
                    ) : (
                      <p className="text-amber-700 font-semibold text-[11px] mt-0.5">
                        ⏳ Mode: Pending Warehouse Staff Allocation
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons based on status */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {isBooked && (
                      <span className="text-blue-700 font-medium">
                        Consignment booked. Awaiting pickup dispatch from sender facility.
                      </span>
                    )}
                    {isPickedUp && (
                      <span className="text-indigo-700 font-medium flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-indigo-600" />
                        Cargo collected from sender. Vehicle arrived at origin warehouse gates.
                      </span>
                    )}
                    {isAtOrigin && (
                      <span className="text-purple-700 font-bold flex items-center gap-1.5 animate-pulse">
                        <Clock className="w-4 h-4 text-purple-600" />
                        Inward dock received. Staff must fix transport mode (Flight/Ship/Train) to approve!
                      </span>
                    )}
                    {isOriginApproved && (
                      <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Origin approved ({shipment.transportMode === 'AIR' ? '✈️ Flight' : shipment.transportMode === 'OCEAN' ? '🚢 Ship' : shipment.transportMode === 'RAIL' ? '🚆 Train' : '🚛 Road'}: {shipment.transportDetails?.identifier}). Ready for linehaul.
                      </span>
                    )}
                    {isArrivedDest && (
                      <span className="text-indigo-700 font-medium flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-indigo-600" />
                        Arrived at destination hub. Ready for staging or delivery van allocation.
                      </span>
                    )}
                    {isReady && (
                      <span className="text-amber-800 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        Staged in pickup vault. Awaiting recipient to present reference code & OTP.
                      </span>
                    )}
                    {(isCollected || isDelivered) && (
                      <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                        Fulfillment completed.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action 1: If Booked -> Mark Picked Up */}
                    {isBooked && (
                      <button
                        onClick={() => advanceShipmentStatus(shipment.id, 'PICKED_UP', 'Cargo physically collected from sender premises.')}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>1. Pick Up from Sender</span>
                      </button>
                    )}

                    {/* Action 2: If Picked Up -> Receive at Origin Warehouse */}
                    {isPickedUp && (
                      <button
                        onClick={() => receiveAtOriginWarehouse(shipment.id, operatorStaffName)}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>2. Receive at Origin Warehouse</span>
                      </button>
                    )}

                    {/* Action 3: If at Origin Warehouse -> Warehouse Staff Fixes Transport Mode & Approves */}
                    {isAtOrigin && (
                      <button
                        onClick={() => handleOpenAllocationModal(shipment)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-900/30 flex items-center gap-1.5 ring-2 ring-purple-300 ring-offset-1"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-300" />
                        <span>3. Fix Transport (✈️ Flight / 🚢 Ship / 🚆 Train) & Approve</span>
                      </button>
                    )}

                    {/* Action 4: If Origin Warehouse Approved -> Dispatch Linehaul */}
                    {isOriginApproved && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenAllocationModal(shipment)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-300"
                          title="Re-inspect or edit assigned transport"
                        >
                          <span>Re-assign Mode</span>
                        </button>
                        <button
                          onClick={() => advanceShipmentStatus(shipment.id, 'IN_TRANSIT', `Dispatched on international linehaul corridor via ${shipment.transportMode || 'allocated carrier'}.`)}
                          className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>4. Dispatch on Linehaul Transit</span>
                        </button>
                      </div>
                    )}

                    {/* Action 5: Destination Inward Staging */}
                    {isArrivedDest && shipment.deliveryType === 'HUB_PICKUP' && (
                      <button
                        onClick={() => confirmWarehouseInspection(shipment.id, operatorStaffName)}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Pass Inspection & Stage for Pickup</span>
                      </button>
                    )}

                    {isArrivedDest && shipment.deliveryType === 'HOME_DELIVERY' && (
                      <button
                        onClick={() => advanceShipmentStatus(shipment.id, 'OUT_FOR_DELIVERY', 'Dispatched with doorstep courier agent.')}
                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Delivery Van</span>
                      </button>
                    )}

                    {/* Action 6: If Ready for Pickup -> Verify & Confirm Collection */}
                    {isReady && (
                      <button
                        onClick={() => handleOpenCollectionModal(shipment.id)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-900/20 flex items-center gap-1.5"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Verify & Confirm Collection</span>
                      </button>
                    )}

                    {/* Location Unavailable -> Divert to Warehouse Pickup */}
                    {!isCollected && !isDelivered && (
                      <button
                        onClick={() => {
                          setDivertingShipmentId(shipment.id);
                          if (shipment.assignedHub?.id) setDivertHubId(shipment.assignedHub.id);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs cursor-pointer ${
                          shipment.isLocationUnavailable
                            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                        }`}
                        title="If destination address/PIN is unreachable or out of service, divert cargo to nearby warehouse for customer self-collection"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>{shipment.isLocationUnavailable ? 'Re-assign Hub' : 'Location Unavailable → Warehouse Pickup'}</span>
                      </button>
                    )}

                    {/* Airspace Disruption Reroute Button */}
                    {shipment.transportMode === 'AIR' && !shipment.isRerouted && !isCollected && !isDelivered && (
                      <button
                        onClick={() => autoRerouteShipment(shipment.id, undefined, operatorStaffName)}
                        className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        title="Airspace Ground Stop Advisory: Auto-reroute via Ocean/Rail contingency corridor"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>⚡ Reroute (Airspace Bypass)</span>
                      </button>
                    )}

                    {/* Active Rerouted Badge */}
                    {shipment.isRerouted && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
                        <Zap className="w-3.5 h-3.5 text-purple-600" />
                        <span>Airspace Bypass Active ({shipment.transportMode})</span>
                      </div>
                    )}

                    {/* View Details */}
                    <button
                      onClick={() => {
                        setSelectedTrackingId(shipment.id);
                        setCurrentView('details');
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Manifest
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Collection Verification Modal */}
      {selectedShipmentForCollection && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Confirm Consignment Collection</h3>
                  <p className="text-[11px] text-slate-500">Pickup Counter Verification Desk</p>
                </div>
              </div>
              <button
                onClick={() => setVerifyingShipmentId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteCollection} className="space-y-4 mt-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tracking Consignment:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedShipmentForCollection.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consignee Name:</span>
                  <span className="font-bold text-slate-800">{selectedShipmentForCollection.receiver.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cargo Description:</span>
                  <span className="text-slate-700 truncate max-w-[200px]">{selectedShipmentForCollection.contentsDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Weight & Pcs:</span>
                  <span className="font-medium text-slate-800">{selectedShipmentForCollection.weightKg} kg ({selectedShipmentForCollection.pieces} pcs)</span>
                </div>
              </div>

              {/* Security Hint */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-950">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Customer Credentials:</span>
                </div>
                <p>
                  Valid Reference: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300">{selectedShipmentForCollection.pickupReferenceCode}</code>
                  {' or OTP: '}
                  <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300">{selectedShipmentForCollection.pickupSecurityOtp}</code>
                </p>
              </div>

              {/* Verification Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Enter Pickup Reference or OTP *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={inputReference}
                    onChange={(e) => setInputReference(e.target.value)}
                    placeholder="e.g. REF-XXXX-PK or OTP..."
                    className="w-full pl-9 pr-3 py-2.5 font-mono text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Verification Feedback Message */}
              {verificationFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    verificationFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {verificationFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{verificationFeedback.message}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyingShipmentId(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-md shadow-amber-900/20"
                >
                  Confirm Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transport Mode Allocation & Inspection Modal */}
      {selectedShipmentForAllocation && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-150 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Fix Transport Mode & Approve Outbound
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Origin Warehouse Station • Carrier Assignment & Customs Clearance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAllocatingShipmentId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteAllocation} className="space-y-4 mt-4 text-xs">
              {/* Consignment Quick Summary */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tracking Consignment:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedShipmentForAllocation.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Cross-Border Corridor:</span>
                  <span className="font-bold text-slate-900">
                    {selectedShipmentForAllocation.route.originCity} ({selectedShipmentForAllocation.sender.country || 'India'}) → {selectedShipmentForAllocation.route.destinationCity} ({selectedShipmentForAllocation.receiver.country || 'International'})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Cargo Spec & Weight:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedShipmentForAllocation.category} • {selectedShipmentForAllocation.weightKg} kg ({selectedShipmentForAllocation.pieces} packages)
                  </span>
                </div>
              </div>

              {/* Step 1: Select Transport Mode */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 block">
                    1. Select International Transport Mode *
                  </label>
                  <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Origin Warehouse Decision Desk
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Flight */}
                  <button
                    type="button"
                    onClick={() => handleSelectMode('AIR')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      selectedMode === 'AIR'
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-300 text-sky-950 font-bold'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Plane className="w-5 h-5 text-sky-600" />
                    <span className="font-bold text-xs">✈️ Flight</span>
                    <span className="text-[10px] text-slate-500">Air Cargo</span>
                  </button>

                  {/* Ocean Ship */}
                  <button
                    type="button"
                    onClick={() => handleSelectMode('OCEAN')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      selectedMode === 'OCEAN'
                        ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-300 text-teal-950 font-bold'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Ship className="w-5 h-5 text-teal-600" />
                    <span className="font-bold text-xs">🚢 Cargo Ship</span>
                    <span className="text-[10px] text-slate-500">Ocean Vessel</span>
                  </button>

                  {/* Freight Train */}
                  <button
                    type="button"
                    onClick={() => handleSelectMode('RAIL')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      selectedMode === 'RAIL'
                        ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-300 text-indigo-950 font-bold'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Train className="w-5 h-5 text-indigo-600" />
                    <span className="font-bold text-xs">🚆 Freight Train</span>
                    <span className="text-[10px] text-slate-500">CONCOR Rail</span>
                  </button>

                  {/* Road Truck */}
                  <button
                    type="button"
                    onClick={() => handleSelectMode('ROAD')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      selectedMode === 'ROAD'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300 text-amber-950 font-bold'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-xs">🚛 Road Hauler</span>
                    <span className="text-[10px] text-slate-500">Cross-Border</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Buttons for Selected Mode */}
              {TERMINAL_PRESETS_BY_MODE[selectedMode] && (
                <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Quick Preset Corridors (Click to Auto-Fill):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {TERMINAL_PRESETS_BY_MODE[selectedMode].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className="text-[11px] px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 font-medium transition-colors text-left truncate max-w-full cursor-pointer"
                      >
                        ⚡ {p.carrier} ({p.flight}): {p.departure.split('(')[0]} → {p.arrival.split('(')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Carrier & Transport Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Carrier / Operator Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    placeholder="e.g. Emirates SkyCargo / Maersk Line"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {selectedMode === 'AIR'
                      ? 'Flight Number *'
                      : selectedMode === 'OCEAN'
                      ? 'Vessel Name & Voyage # *'
                      : selectedMode === 'RAIL'
                      ? 'Freight Train / Rake ID *'
                      : 'Hauler Vehicle # *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={transportIdentifier}
                    onChange={(e) => setTransportIdentifier(e.target.value)}
                    placeholder="e.g. EK-9821 / Maersk Ganges V-102"
                    className="w-full px-3 py-2 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 3: Ports & Terminals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Departure Port / Terminal *
                  </label>
                  <input
                    type="text"
                    required
                    value={departureTerminal}
                    onChange={(e) => setDepartureTerminal(e.target.value)}
                    placeholder="e.g. Hyderabad Air Cargo Complex (HYD)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Arrival Port / Terminal *
                  </label>
                  <input
                    type="text"
                    required
                    value={arrivalTerminal}
                    onChange={(e) => setArrivalTerminal(e.target.value)}
                    placeholder="e.g. Dubai Al Maktoum Cargo (DWC)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 4: Export Customs Entry Code */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Export Customs Declaration / E-Waybill Code *
                </label>
                <input
                  type="text"
                  required
                  value={customsDeclarationCode}
                  onChange={(e) => setCustomsDeclarationCode(e.target.value)}
                  placeholder="e.g. EXP-IND-DXB-9842"
                  className="w-full px-3 py-2 font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Physical Verification Checklist */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inspectionPassed}
                    onChange={(e) => setInspectionPassed(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="text-[11px] text-emerald-950">
                    <strong className="block font-bold">Origin Warehouse Inspection Checklist Passed:</strong>
                    <span>
                      Physical parcel weight ({selectedShipmentForAllocation.weightKg} kg) re-verified on certified dock scales. Dangerous goods check completed. Container/pallet sealed under custody of supervisor <strong>{operatorStaffName}</strong>.
                    </span>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAllocatingShipmentId(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!inspectionPassed}
                  className="flex-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/20 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm {selectedMode === 'AIR' ? '✈️ Flight' : selectedMode === 'OCEAN' ? '🚢 Ship' : selectedMode === 'RAIL' ? '🚆 Train' : '🚛 Road'} & Approve Outbound</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Unavailable -> Divert to Warehouse Hub Modal */}
      {selectedShipmentForDiversion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Delivery Location Unavailable — Divert to Hub</h3>
                  <p className="text-[11px] text-slate-500">Consignment: {selectedShipmentForDiversion.id} ({selectedShipmentForDiversion.receiver.city})</p>
                </div>
              </div>
              <button
                onClick={() => setDivertingShipmentId(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!divertingShipmentId) return;
                divertToWarehousePickup(
                  divertingShipmentId,
                  divertHubId,
                  divertReason,
                  operatorStaffName
                );
                setDivertingShipmentId(null);
              }}
              className="mt-4 space-y-4 text-xs"
            >
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  <span>Customer Self-Collection Exception Workflow:</span>
                </p>
                <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                  When the customer's delivery location is unreachable or out of active courier zones, the package is safely stored at our authorized warehouse hub. The customer will be notified via SMS/WhatsApp with a Pickup Reference ID and OTP to come and collect their shipment directly at the counter.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Nearest Destination Warehouse Hub *</label>
                <select
                  value={divertHubId}
                  onChange={(e) => setDivertHubId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {Object.values(DEMO_HUBS).map((hub) => (
                    <option key={hub.id} value={hub.id}>
                      {hub.name} ({hub.city}, {hub.country})
                    </option>
                  ))}
                </select>
                {DEMO_HUBS[divertHubId] && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    📍 {DEMO_HUBS[divertHubId].address} • Operating: {DEMO_HUBS[divertHubId].operatingHours}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Location Unavailability *</label>
                <select
                  value={divertReason}
                  onChange={(e) => setDivertReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none mb-2"
                >
                  <option value="Destination address unreachable / remote unserviceable courier zone">
                    Destination address unreachable / remote unserviceable courier zone
                  </option>
                  <option value="Recipient address inaccessible / road blocked or restricted area">
                    Recipient address inaccessible / road blocked or restricted area
                  </option>
                  <option value="Delivery attempt failed / recipient unreachable on phone">
                    Delivery attempt failed / recipient unreachable on phone
                  </option>
                  <option value="Recipient requested self-collection at nearby warehouse hub">
                    Recipient requested self-collection at nearby warehouse hub
                  </option>
                </select>
                <input
                  type="text"
                  value={divertReason}
                  onChange={(e) => setDivertReason(e.target.value)}
                  placeholder="Custom exception note..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDivertingShipmentId(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-900/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Divert to Warehouse & Issue Pickup Code</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
