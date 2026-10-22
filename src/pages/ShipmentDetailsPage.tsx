import React, { useState } from 'react';
import { useShipments } from '../context/ShipmentContext';
import { StatusBadge, DeliveryTypeBadge, TransportModeBadge } from '../components/StatusBadge';
import { ShipmentTimeline } from '../components/ShipmentTimeline';
import type { ShipmentStatus } from '../types/logistics';
import { 
  MapPin, 
  Package, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  FastForward,
  Globe
} from 'lucide-react';

export const ShipmentDetailsPage: React.FC = () => {
  const { 
    shipments, 
    selectedTrackingId, 
    setSelectedTrackingId, 
    getShipment, 
    advanceShipmentStatus, 
    simulateDelay, 
    resolveDelay,
    setCurrentView 
  } = useShipments();

  const [activeShipmentId, setActiveShipmentId] = useState(selectedTrackingId || '');
  const [operatorNote, setOperatorNote] = useState('');
  const [delayInputReason, setDelayInputReason] = useState('Heavy rain & highway construction detour near NH-65 Tollway');

  const shipment = getShipment(selectedTrackingId || activeShipmentId) || (shipments.length > 0 ? shipments[0] : undefined);

  const handleSelectShipment = (id: string) => {
    setActiveShipmentId(id);
    setSelectedTrackingId(id);
    setOperatorNote('');
  };

  // Determine next valid status in the logistics state machine
  const getNextValidStatus = (status: ShipmentStatus, isHub: boolean): { status: ShipmentStatus; label: string } | null => {
    switch (status) {
      case 'BOOKED':
        return { status: 'PICKED_UP', label: '1. Mark Cargo Picked Up from Sender' };
      case 'PICKED_UP':
        return { status: 'ARRIVED_AT_ORIGIN_WAREHOUSE', label: '2. Receive at Origin Warehouse (Inward Dock Scan)' };
      case 'ARRIVED_AT_ORIGIN_WAREHOUSE':
        return { status: 'ORIGIN_WAREHOUSE_APPROVED', label: '3. Origin Warehouse: Fix Mode (✈️ Flight / 🚢 Ship / 🚆 Train) & Approve Outbound' };
      case 'ORIGIN_WAREHOUSE_APPROVED':
        return { status: 'IN_TRANSIT', label: '4. Dispatch on International Linehaul Transit' };
      case 'IN_TRANSIT':
        return { status: 'ARRIVED_AT_HUB', label: '5. Inward Scan at Destination Regional Hub' };
      case 'ARRIVED_AT_HUB':
        return isHub
          ? { status: 'READY_FOR_PICKUP', label: '6. Destination Hub Inspection Passed: Stage for Customer Pickup' }
          : { status: 'OUT_FOR_DELIVERY', label: '6. Approve & Dispatch Last-Mile Delivery Van' };
      case 'READY_FOR_PICKUP':
        return { status: 'COLLECTED', label: '7. Confirm Consignee Counter Collection' };
      case 'OUT_FOR_DELIVERY':
        return { status: 'DELIVERED', label: '7. Confirm Doorstep Handover & Delivery' };
      case 'DELAYED':
        return { status: 'IN_TRANSIT', label: 'Resume Transit (Clear Delay Advisory)' };
      case 'DELIVERED':
      case 'COLLECTED':
        return null;
      default:
        return null;
    }
  };

  const isHub = shipment ? shipment.deliveryType === 'HUB_PICKUP' : false;
  const nextStage = shipment ? getNextValidStatus(shipment.status, isHub) : null;

  const handleAdvance = () => {
    if (!nextStage || !shipment) return;
    advanceShipmentStatus(shipment.id, nextStage.status, operatorNote.trim() || undefined);
    setOperatorNote('');
  };

  const handleSimulateDelay = () => {
    if (shipment) simulateDelay(shipment.id, delayInputReason);
  };

  const handleResolveDelay = () => {
    if (shipment) resolveDelay(shipment.id);
  };

  if (!shipment) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-subtle">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Consignments Available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            You haven't created any consignments yet. Create a shipment manually to inspect its manifest and advance its status through the warehouse approval stages.
          </p>
          <button
            onClick={() => setCurrentView('create')}
            className="mt-5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Create Your First Shipment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Operator Command Center
            </span>
            <span className="text-slate-400 text-xs">• Telemetry State Advancer</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Shipment Manifest & Status Advancer
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Examine complete consignment dossier and advance demo shipments through the state machine.
          </p>
        </div>

        {/* Consignment Selector Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">Select Consignment:</span>
          <select
            value={shipment.id}
            onChange={(e) => handleSelectShipment(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {shipments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} — {s.route.originCity} → {s.route.destinationCity} ({s.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Operator Advancer Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block mb-1">
              Live State Machine Controller
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-2xl font-black text-white">{shipment.id}</span>
              <StatusBadge status={shipment.status} size="md" />
              <TransportModeBadge mode={shipment.transportMode} size="md" />
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">Delivery Architecture:</span>
            <DeliveryTypeBadge type={shipment.deliveryType} size="sm" />
          </div>
        </div>

        {/* State Advancement Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Operator Progress Note (Optional)</span>
              <input
                type="text"
                value={operatorNote}
                onChange={(e) => setOperatorNote(e.target.value)}
                placeholder="e.g. Scanned at outbound sorting deck 4; seal verified..."
                className="w-full mt-1 px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Next Stage Button */}
            {nextStage ? (
              <button
                onClick={handleAdvance}
                className="w-full py-3 px-5 bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-400 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/40 transition-all hover:scale-[1.01]"
              >
                <FastForward className="w-4 h-4" />
                <span>{nextStage.label}</span>
              </button>
            ) : (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>This consignment has reached its final fulfillment terminal ({shipment.status}).</span>
              </div>
            )}
          </div>

          {/* Delay Simulation Controls for Demo */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Exception & Delay Simulator</span>
              </span>
              <span className="text-[10px] text-slate-400">Demo Testing</span>
            </div>

            {shipment.status === 'DELAYED' ? (
              <div className="space-y-2">
                <p className="text-xs text-rose-300 bg-rose-950/50 p-2 rounded border border-rose-800/60">
                  Delay Active: {shipment.delayReason}
                </p>
                <button
                  onClick={handleResolveDelay}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Resolve Delay & Resume Transit
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={delayInputReason}
                  onChange={(e) => setDelayInputReason(e.target.value)}
                  placeholder="Enter highway delay cause..."
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none"
                />
                <button
                  onClick={handleSimulateDelay}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Simulate Highway Delay Alert
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipment Timeline & Route */}
      <ShipmentTimeline shipment={shipment} />

      {/* Complete Dossier Manifest */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Origin / Consignor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Consignor Dossier</h4>
              <p className="text-[10px] text-slate-400">Origin dispatch station</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Consignor Name</span>
              <p className="font-bold text-slate-900">{shipment.sender.name}</p>
              {shipment.sender.company && <p className="text-slate-500">{shipment.sender.company}</p>}
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Contact Details</span>
              <p className="font-mono text-slate-700">{shipment.sender.phone}</p>
              <p className="text-slate-500">{shipment.sender.email}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Physical Address</span>
              <p className="text-slate-700">{shipment.sender.address}</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                {shipment.sender.city} ({shipment.sender.country || 'India'}) — PIN <span className="font-mono">{shipment.sender.pinCode}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Destination / Consignee */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Consignee Dossier</h4>
              <p className="text-[10px] text-slate-400">Destination fulfillment point</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Consignee Recipient</span>
              <p className="font-bold text-slate-900">{shipment.receiver.name}</p>
              {shipment.receiver.company && <p className="text-slate-500">{shipment.receiver.company}</p>}
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Contact Details</span>
              <p className="font-mono text-slate-700">{shipment.receiver.phone}</p>
              <p className="text-slate-500">{shipment.receiver.email}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Destination Address</span>
              <p className="text-slate-700">{shipment.receiver.address}</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                {shipment.receiver.city} ({shipment.receiver.country || 'International'}) — PIN / Port <span className="font-mono">{shipment.receiver.pinCode}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Cargo & Commercial Parameters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Cargo & Specs</h4>
              <p className="text-[10px] text-slate-400">Commercial parameters</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Gross Weight:</span>
              <span className="font-bold text-slate-800">{shipment.weightKg} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Package Pieces:</span>
              <span className="font-semibold text-slate-800">{shipment.pieces} packages</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Declared Value:</span>
              <span className="font-bold text-slate-900">₹{shipment.declaredValueInr.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dimensions:</span>
              <span className="font-mono text-slate-700">{shipment.dimensions || 'Standard Pallet'}</span>
            </div>

            {shipment.assignedHub && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Allocated Gateway Hub</span>
                <p className="font-bold text-amber-900">{shipment.assignedHub.name}</p>
                <p className="text-[11px] text-slate-500">{shipment.assignedHub.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* International Transit & Carrier Dossier */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Transport & Customs</h4>
              <p className="text-[10px] text-slate-400">Fixed at origin warehouse</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Transit Mode</span>
              <div className="mt-1">
                <TransportModeBadge mode={shipment.transportMode} size="sm" />
              </div>
            </div>

            {shipment.transportDetails ? (
              <>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Carrier & ID</span>
                  <p className="font-bold text-slate-900">{shipment.transportDetails.carrierName}</p>
                  <p className="font-mono text-purple-700 font-bold">{shipment.transportDetails.identifier}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Terminals / Ports</span>
                  <p className="text-slate-700 text-[11px] truncate" title={shipment.transportDetails.departureTerminal}>
                    Dep: {shipment.transportDetails.departureTerminal}
                  </p>
                  <p className="text-slate-700 text-[11px] truncate mt-0.5" title={shipment.transportDetails.arrivalTerminal}>
                    Arr: {shipment.transportDetails.arrivalTerminal}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Export Customs Entry</span>
                  <p className="font-mono font-bold text-emerald-700 text-[11px]">{shipment.transportDetails.customsDeclarationCode}</p>
                </div>
              </>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-2">
                <p>
                  <strong>Pending Warehouse Assignment:</strong> Transit mode (Flight, Ship, Train, or Road) has not been allocated yet.
                </p>
                <button
                  onClick={() => setCurrentView('warehouse')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] transition-colors"
                >
                  Allocate in Warehouse
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
