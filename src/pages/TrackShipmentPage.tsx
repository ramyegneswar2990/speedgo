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
  ArrowRight,
  Zap,
  MessageSquare,
  CheckCheck
} from 'lucide-react';

export const TrackShipmentPage: React.FC = () => {
  const { 
    shipments, 
    selectedTrackingId, 
    setSelectedTrackingId, 
    getShipment, 
    setCurrentView,
    autoRerouteShipment,
    sendCustomerNotification
  } = useShipments();

  const [searchInput, setSearchInput] = useState(selectedTrackingId || '');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

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

            {/* DYNAMIC AIRSPACE & WEATHER REROUTE ADVISORY (When Rerouted) */}
            {currentShipment.isRerouted ? (
              <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-purple-500/80 text-white shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-lg shadow-purple-900/50">
                      ⚡
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-purple-200">
                          Emergency Airspace Bypass: Dynamic Contingency Corridor Active
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          Reroute #{currentShipment.rerouteCount || 1}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {currentShipment.reroutedReason || 'Commercial flight grounded due to severe weather and temporary airspace restrictions. Consignment safely diverted.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Zero Delivery Disruption Guarantee
                    </span>
                  </div>
                </div>

                {/* Before / After Corridor Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Original Cancelled Flight */}
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-rose-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-400 uppercase text-[10px] flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5" />
                        Original Air Corridor (Cancelled)
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Airspace Ground Stop
                      </span>
                    </div>
                    <div className="font-semibold text-white">
                      {currentShipment.originalTransportDetails?.carrierName || 'Emirates SkyCargo / Commercial Freighter'} ({currentShipment.originalTransportDetails?.identifier || 'Flight EK-9821'})
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Departure: {currentShipment.originalTransportDetails?.departureTerminal || currentShipment.route.originCity} • Arrival: {currentShipment.originalTransportDetails?.arrivalTerminal || currentShipment.route.destinationCity}
                    </div>
                    <div className="text-rose-300 text-[11px] font-medium pt-1 border-t border-slate-800">
                      Reason: Grounded due to regional NOTAM advisory & storm front
                    </div>
                  </div>

                  {/* New Active Contingency Linehaul */}
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-purple-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-300 uppercase text-[10px] flex items-center gap-1.5">
                        {currentShipment.transportMode === 'OCEAN' ? (
                          <Ship className="w-3.5 h-3.5 text-cyan-400" />
                        ) : currentShipment.transportMode === 'RAIL' ? (
                          <Train className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        Active Contingency Corridor ({currentShipment.transportMode})
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400">
                        In Progress
                      </span>
                    </div>
                    <div className="font-semibold text-white">
                      {currentShipment.transportDetails?.carrierName} ({currentShipment.transportDetails?.identifier})
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      Port / Hub: {currentShipment.transportDetails?.departureTerminal} → {currentShipment.transportDetails?.arrivalTerminal}
                    </div>
                    <div className="text-emerald-300 text-[11px] font-medium pt-1 border-t border-slate-800 flex items-center justify-between">
                      <span>Updated ETA: {new Date(currentShipment.estimatedArrival).toLocaleDateString()}</span>
                      <span className="text-cyan-300">Cost Impact: ₹0 (Speed Logistics Guarantee)</span>
                    </div>
                  </div>
                </div>

                {/* Customer Notification Advisory Feed */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      Live Customer Delivery Advisories (Automated Multi-Channel Dispatch)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          sendCustomerNotification(currentShipment.id, 'WHATSAPP');
                          setNotificationMsg('WhatsApp alert dispatched to customer!');
                          setTimeout(() => setNotificationMsg(null), 2500);
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1"
                        title="Simulate dispatching a live WhatsApp notification to customer"
                      >
                        <span>📲 Resend WhatsApp</span>
                      </button>
                      <button
                        onClick={() => {
                          sendCustomerNotification(currentShipment.id, 'SMS');
                          setNotificationMsg('SMS alert dispatched to customer!');
                          setTimeout(() => setNotificationMsg(null), 2500);
                        }}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1"
                        title="Simulate dispatching a live SMS notification to customer"
                      >
                        <span>💬 Resend SMS</span>
                      </button>
                    </div>
                  </div>

                  {notificationMsg && (
                    <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-300 text-[11px] font-semibold">
                      ✓ {notificationMsg}
                    </div>
                  )}

                  {/* Dispatched Messages */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(currentShipment.customerNotifications && currentShipment.customerNotifications.length > 0) ? (
                      currentShipment.customerNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-2"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                notif.channel === 'WHATSAPP'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : notif.channel === 'SMS'
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              }`}>
                                {notif.channel}
                              </span>
                              <span className="text-white font-bold text-[11px]">{notif.title}</span>
                              <span className="text-slate-500 text-[10px]">• To: {notif.recipientName} ({notif.recipientPhone})</span>
                            </div>
                            <p className="text-[11px] text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800/80">
                              "{notif.message}"
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-emerald-400 font-bold text-[10px] flex items-center justify-end gap-1">
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              Delivered
                            </span>
                            <span className="text-slate-500 text-[10px] block mt-0.5">{notif.sentAt}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 text-xs italic">
                        No previous notifications recorded for this consignment.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : currentShipment.transportMode === 'AIR' ? (
              /* AIRSPACE RESTRICTION RISK ADVISORY (When Air cargo but not yet rerouted) */
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                    ⚠️
                  </div>
                  <div>
                    <strong className="font-bold text-amber-950 block text-sm">
                      Airspace & Weather Disruption Advisory for this Flight Corridor
                    </strong>
                    <p className="text-amber-900 mt-0.5">
                      Regional NOTAM warnings indicate delayed or cancelled flights. Dynamic route planning is available to bypass grounded air corridors via guaranteed Ocean or Rail linehaul.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    autoRerouteShipment(currentShipment.id);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg font-bold text-xs transition-all shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-900/30"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Auto-Reroute Cargo</span>
                </button>
              </div>
            ) : null}

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

            {/* Customer Self-Collection at Warehouse Card */}
            {(currentShipment.deliveryType === 'HUB_PICKUP' || currentShipment.isLocationUnavailable) && (
              <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-50/70 to-orange-50 border-2 border-amber-300 text-amber-950 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-lg mt-0.5">
                      🏢
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-amber-950 text-sm">
                          {currentShipment.isLocationUnavailable
                            ? '⚠️ Delivery Location Unavailable — Held for Customer Warehouse Collection'
                            : '🏢 Customer Self-Collection at Nearby Warehouse Hub'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                          {currentShipment.status === 'COLLECTED' ? 'Collected' : 'Action Required: Collect in Person'}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                        {currentShipment.isLocationUnavailable
                          ? `The destination delivery address is unreachable or out of active courier zones (${currentShipment.locationUnavailableReason || 'Address unserviceable for doorstep van'}). Your cargo is securely stored at our nearest authorized warehouse hub. Please come and collect your shipment.`
                          : 'This consignment was routed for customer self-collection at our authorized logistics hub. Please visit the facility to collect your cargo.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-amber-300 shrink-0 shadow-2xs">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-black block">Pickup Ref ID</span>
                      <span className="font-mono text-sm font-black text-amber-950">{currentShipment.pickupReferenceCode || 'PENDING'}</span>
                    </div>
                    <div className="border-l border-slate-200 pl-3">
                      <span className="text-[9px] text-slate-500 uppercase font-black block">Security OTP</span>
                      <span className="font-mono text-sm font-black text-brand-700">{currentShipment.pickupSecurityOtp || 'PENDING'}</span>
                    </div>
                  </div>
                </div>

                {/* Warehouse Location & Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-white/80 p-4 rounded-xl border border-amber-200/80">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Warehouse Facility</span>
                    <strong className="text-slate-900 font-bold block text-xs">
                      {currentShipment.assignedHub?.name || 'Speed Logistics Regional Warehouse Hub'}
                    </strong>
                    <span className="text-slate-600 text-[11px] block mt-0.5">
                      {currentShipment.assignedHub?.address || 'Air Cargo Complex / Regional Dry Port'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Operating Hours & Contact</span>
                    <strong className="text-slate-800 font-semibold block text-xs">
                      🕒 {currentShipment.assignedHub?.operatingHours || '24/7 Operations'}
                    </strong>
                    <span className="text-slate-600 font-mono text-[11px] block mt-0.5">
                      📞 {currentShipment.assignedHub?.contactPhone || '+91 40 2938 1100'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">What to Bring for Collection</span>
                    <ul className="text-[11px] text-slate-700 space-y-0.5">
                      <li>• Valid government photo ID (Aadhaar / Passport)</li>
                      <li>• Show Pickup Reference Code & Security OTP</li>
                      <li>• Inspect parcel seal before gate pass sign-off</li>
                    </ul>
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
