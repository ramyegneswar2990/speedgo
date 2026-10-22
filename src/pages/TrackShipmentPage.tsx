import React, { useState } from 'react';
import { useShipments } from '../context/ShipmentContext';
import { StatusBadge, DeliveryTypeBadge, TransportModeBadge } from '../components/StatusBadge';
import { ShipmentTimeline } from '../components/ShipmentTimeline';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Truck, 
  Building2, 
  Package, 
  AlertTriangle, 
  ExternalLink, 
  Sparkles,
  Plane,
  Ship,
  Train,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const TrackShipmentPage: React.FC = () => {
  const { 
    shipments, 
    selectedTrackingId, 
    setSelectedTrackingId, 
    getShipment, 
    setCurrentView 
  } = useShipments();

  const [searchInput, setSearchInput] = useState(selectedTrackingId || '');

  // Currently displayed shipment
  const currentShipment = getShipment(selectedTrackingId || searchInput) || (shipments.length > 0 ? shipments[0] : undefined);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setSelectedTrackingId(searchInput.trim());
  };

  const selectDemoId = (id: string) => {
    setSearchInput(id);
    setSelectedTrackingId(id);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Search Bar & Registered ID Chips */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Tracking Consignment ID (e.g. SL-HYD-1234)..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
          >
            Track Consignment
          </button>
        </form>

        {/* User's Registered Shipment Chips */}
        {shipments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              Your Active Consignments:
            </span>
            {shipments.slice(0, 6).map((s) => (
              <button
                key={s.id}
                onClick={() => selectDemoId(s.id)}
                className={`px-2.5 py-1 rounded-lg border font-mono text-xs transition-colors ${
                  currentShipment?.id === s.id
                    ? 'bg-brand-50 text-brand-700 border-brand-300 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.id} ({s.route.originCity}→{s.route.destinationCity})
              </button>
            ))}
          </div>
        )}
      </div>

      {!currentShipment ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Consignment Selected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {shipments.length === 0
              ? 'There are currently no consignments in the system. Create a shipment manually to begin tracking its route and milestones.'
              : `Tracking ID "${searchInput}" did not match any active consignment records.`}
          </p>
          <button
            onClick={() => setCurrentView('create')}
            className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
          >
            Create Your First Shipment
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Shipment Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Consignment Tracking Record
                  </span>
                  <span className="text-slate-300">•</span>
                  <DeliveryTypeBadge type={currentShipment.deliveryType} size="sm" />
                  <TransportModeBadge mode={currentShipment.transportMode} size="sm" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight font-mono flex items-center gap-3">
                  <span>{currentShipment.id}</span>
                  <StatusBadge status={currentShipment.status} size="lg" />
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Cargo: <strong className="font-semibold text-slate-800">{currentShipment.contentsDescription}</strong> ({currentShipment.weightKg} kg, {currentShipment.pieces} packages)
                </p>
              </div>

              {/* Actions & ETA card */}
              <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Estimated Delivery / Handover
                  </span>
                  <div className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-4 h-4 text-brand-600" />
                    <span>
                      {new Date(currentShipment.estimatedArrival).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="border-l border-slate-200 pl-4 space-y-1">
                  <button
                    onClick={() => {
                      setSelectedTrackingId(currentShipment.id);
                      setCurrentView('details');
                    }}
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <span>Operator Advancer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTrackingId(currentShipment.id);
                      setCurrentView('warehouse');
                    }}
                    className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 w-full justify-center"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Warehouse Ops</span>
                  </button>
                </div>
              </div>
            </div>

            {/* International Transport Mode & Route Telemetry Card */}
            {currentShipment.transportDetails ? (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border border-indigo-200/80 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    {currentShipment.transportMode === 'AIR' ? (
                      <Plane className="w-5 h-5" />
                    ) : currentShipment.transportMode === 'OCEAN' ? (
                      <Ship className="w-5 h-5" />
                    ) : currentShipment.transportMode === 'RAIL' ? (
                      <Train className="w-5 h-5" />
                    ) : (
                      <Truck className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {currentShipment.transportMode === 'AIR' ? '✈️ Air Cargo Flight' : currentShipment.transportMode === 'OCEAN' ? '🚢 Ocean Cargo Vessel' : currentShipment.transportMode === 'RAIL' ? '🚆 Intermodal Rail Freight' : '🚛 Cross-Border Road Hauler'}
                      </span>
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-white text-indigo-700 border border-indigo-200 text-[11px]">
                        {currentShipment.transportDetails.carrierName} ({currentShipment.transportDetails.identifier})
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-1 flex flex-wrap items-center gap-1.5">
                      <span><strong>Origin Port:</strong> {currentShipment.transportDetails.departureTerminal}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span><strong>Destination Port:</strong> {currentShipment.transportDetails.arrivalTerminal}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/90 p-2.5 rounded-lg border border-indigo-200 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="text-[11px]">
                    <span className="text-slate-500 font-medium block">Export Customs Declaration</span>
                    <span className="font-mono font-bold text-slate-800">{currentShipment.transportDetails.customsDeclarationCode}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <strong className="font-bold text-purple-950">Transport Mode Decision Pending at Origin Warehouse:</strong>
                    <span className="text-purple-800 ml-1">
                      Warehouse staff will verify weight & clear customs to allocate transit mode (Flight ✈️ / Ship 🚢 / Train 🚆 / Road 🚛).
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedTrackingId(currentShipment.id);
                    setCurrentView('warehouse');
                  }}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] transition-colors shrink-0"
                >
                  Allocate in Warehouse
                </button>
              </div>
            )}

            {/* Delay Alert if any */}
            {currentShipment.status === 'DELAYED' && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="font-bold text-rose-950 block">Highway Weather / Corridor Transit Advisory</strong>
                  <p className="mt-0.5">{currentShipment.delayReason || 'Transit delayed due to highway lane congestion.'}</p>
                </div>
              </div>
            )}

            {/* Hub Pickup Credentials Card */}
            {currentShipment.deliveryType === 'HUB_PICKUP' && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                    <Building2 className="w-4 h-4 text-amber-700" />
                    <span>Regional Pickup Counter: {currentShipment.assignedHub?.name || 'Assigned Regional Hub'}</span>
                  </div>
                  <div className="text-[11px] text-amber-800">
                    {currentShipment.assignedHub?.address} • Operating: {currentShipment.assignedHub?.operatingHours}
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg border border-amber-300">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Pickup Ref Code</span>
                    <span className="font-mono font-bold text-amber-900">{currentShipment.pickupReferenceCode || 'PENDING'}</span>
                  </div>
                  <div className="border-l border-slate-200 pl-3">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Security OTP</span>
                    <span className="font-mono font-bold text-brand-700">{currentShipment.pickupSecurityOtp || 'PENDING'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Route Timeline and Checkpoints */}
          <ShipmentTimeline shipment={currentShipment} />

          {/* Consignor, Consignee & Route Specs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Origin Details */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-brand-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Origin Consignor</h4>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900">{currentShipment.sender.name}</p>
                {currentShipment.sender.company && (
                  <p className="text-slate-500">{currentShipment.sender.company}</p>
                )}
                <p className="text-slate-600">{currentShipment.sender.address}</p>
                <p className="text-slate-700 font-medium">
                  {currentShipment.sender.city} - <span className="font-mono">{currentShipment.sender.pinCode}</span>
                </p>
                <p className="text-slate-500 pt-1 font-mono">{currentShipment.sender.phone}</p>
              </div>
            </div>

            {/* Destination Details */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Destination Consignee</h4>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-900">{currentShipment.receiver.name}</p>
                {currentShipment.receiver.company && (
                  <p className="text-slate-500">{currentShipment.receiver.company}</p>
                )}
                <p className="text-slate-600">{currentShipment.receiver.address}</p>
                <p className="text-slate-700 font-medium">
                  {currentShipment.receiver.city} - <span className="font-mono">{currentShipment.receiver.pinCode}</span>
                </p>
                <p className="text-slate-500 pt-1 font-mono">{currentShipment.receiver.phone}</p>
              </div>
            </div>

            {/* Commercial Specs */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Package className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Cargo Commercial Specs</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-800">{currentShipment.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Weight & Pcs:</span>
                  <span className="font-semibold text-slate-800">{currentShipment.weightKg} kg ({currentShipment.pieces} pkgs)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Declared Value:</span>
                  <span className="font-semibold text-slate-800">₹{currentShipment.declaredValueInr.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Linehaul Corridor:</span>
                  <span className="font-semibold text-slate-800">{currentShipment.route.transitCorridor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
