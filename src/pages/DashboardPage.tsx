import React, { useState } from 'react';
import { useShipments } from '../context/ShipmentContext';
import { StatusBadge, DeliveryTypeBadge, TransportModeBadge } from '../components/StatusBadge';
import { 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  PackageCheck, 
  Layers, 
  Search, 
  ArrowUpRight, 
  PlusCircle, 
  Building2, 
  Calendar, 
  Filter,
  Zap,
  Radio
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { 
    shipments, 
    counts, 
    setCurrentView, 
    setSelectedTrackingId,
    activeDisruptions,
    autoRerouteShipment,
    autoRerouteAllAffected
  } = useShipments();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [rerouteFeedback, setRerouteFeedback] = useState<{ count: number; message: string } | null>(null);

  // Filter shipments
  const filteredShipments = shipments.filter((item) => {
    // Status filter
    if (filterStatus === 'IN_TRANSIT' && item.status !== 'IN_TRANSIT') return false;
    if (filterStatus === 'DELIVERED' && item.status !== 'DELIVERED' && item.status !== 'COLLECTED') return false;
    if (filterStatus === 'DELAYED' && item.status !== 'DELAYED' && !item.isDelayed) return false;
    if (filterStatus === 'AWAITING_PICKUP' && item.status !== 'READY_FOR_PICKUP' && item.status !== 'ARRIVED_AT_HUB') return false;
    if (filterStatus === 'LOCATION_UNAVAILABLE' && !item.isLocationUnavailable) return false;
    if (filterStatus === 'REROUTED' && !item.isRerouted) return false;
    if (filterStatus === 'OUT_FOR_DELIVERY' && item.status !== 'OUT_FOR_DELIVERY') return false;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchSender = item.sender.name.toLowerCase().includes(q) || item.sender.city.toLowerCase().includes(q);
      const matchReceiver = item.receiver.name.toLowerCase().includes(q) || item.receiver.city.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      return matchId || matchSender || matchReceiver || matchCategory;
    }

    return true;
  });

  const handleTrack = (id: string) => {
    setSelectedTrackingId(id);
    setCurrentView('track');
  };

  const handleDetails = (id: string) => {
    setSelectedTrackingId(id);
    setCurrentView('details');
  };

  const handleWarehouse = (id: string) => {
    setSelectedTrackingId(id);
    setCurrentView('warehouse');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-brand-950 to-cargo-navy p-6 rounded-2xl text-white shadow-card border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Live Operations Control
            </span>
            <span className="text-slate-400 text-xs">• Telemetry Feed Synchronized</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Speed Logistics Fleet Dashboard
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Real-time cargo tracking, automated PIN delivery eligibility verification, and multi-hub fulfillment telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCurrentView('create')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-brand-900/40 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Shipment</span>
          </button>
          <button
            onClick={() => setCurrentView('warehouse')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all"
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Warehouse Operations</span>
          </button>
        </div>
      </div>

      {/* 5 Summary KPI Cards as specified by prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Shipments */}
        <div
          onClick={() => setFilterStatus('ALL')}
          className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
            filterStatus === 'ALL'
              ? 'bg-blue-50/60 border-brand-500 ring-2 ring-brand-200'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Shipments
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-brand-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{counts.total}</span>
            <span className="text-[11px] font-medium text-slate-500">All registered</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-brand-700 font-medium">
            Active in database
          </div>
        </div>

        {/* In-Transit */}
        <div
          onClick={() => setFilterStatus('IN_TRANSIT')}
          className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
            filterStatus === 'IN_TRANSIT'
              ? 'bg-cyan-50/70 border-cyan-500 ring-2 ring-cyan-200'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In-Transit
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{counts.inTransit}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              On Highway
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-cyan-800 font-medium">
            Express corridor transit
          </div>
        </div>

        {/* Delivered & Collected */}
        <div
          onClick={() => setFilterStatus('DELIVERED')}
          className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
            filterStatus === 'DELIVERED'
              ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-200'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Delivered / Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{counts.delivered}</span>
            <span className="text-[11px] font-medium text-emerald-700">100% Fulfilled</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-emerald-800 font-medium">
            Doorstep & Hub handovers
          </div>
        </div>

        {/* Delayed / Advisory */}
        <div
          onClick={() => setFilterStatus('DELAYED')}
          className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
            filterStatus === 'DELAYED'
              ? 'bg-rose-50/70 border-rose-500 ring-2 ring-rose-200'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Delayed / Advisory
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{counts.delayed}</span>
            <span className="text-[11px] font-semibold text-rose-600">Requires Watch</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-rose-700 font-medium">
            Weather / traffic advisory
          </div>
        </div>

        {/* Awaiting-Pickup Summary Card */}
        <div
          onClick={() => setFilterStatus('AWAITING_PICKUP')}
          className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 ${
            filterStatus === 'AWAITING_PICKUP'
              ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-200'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Awaiting-Pickup
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{counts.awaitingPickup}</span>
            <span className="text-[11px] font-semibold text-amber-800">Hub Staged</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-amber-800 font-medium">
            Regional Hub Counters
          </div>
        </div>
      </div>

      {/* Reroute Feedback Banner if triggered */}
      {rerouteFeedback && (
        <div className="p-4 rounded-xl bg-purple-900 text-white border border-purple-500 flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/30 border border-purple-400 flex items-center justify-center text-purple-200">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-purple-300 block">Dynamic Reroute Engine Notification</span>
              <p className="text-xs text-white">{rerouteFeedback.message}</p>
            </div>
          </div>
          <button
            onClick={() => setRerouteFeedback(null)}
            className="text-purple-300 hover:text-white text-xs px-2.5 py-1 bg-purple-800/80 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AIRSPACE & WEATHER DISRUPTION RADAR & DYNAMIC REROUTING DESK */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-amber-500/40 p-6 text-white shadow-xl relative overflow-hidden">
        {/* Glowing background decor */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 pb-5 border-b border-slate-800">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Airspace Emergency Advisory
              </span>
              <span className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" />
                3 Commercial Corridors Grounded
              </span>
              <span className="text-slate-400 text-xs">• Dynamic Route Optimizer Online</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Severe Weather & Airspace Restrictions Alert Desk</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Multiple commercial freighter flights have been delayed or cancelled due to localized squall fronts and emergency airspace restrictions. Speed Logistics Dynamic Routing automatically re-computes alternate multi-modal corridors (Ocean Container Lines & Express High-Speed Rail) and triggers instant customer WhatsApp & SMS advisories.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => {
                const res = autoRerouteAllAffected();
                setRerouteFeedback({
                  count: res.reroutedCount,
                  message: res.reroutedCount > 0
                    ? `⚡ Successfully rerouted ${res.reroutedCount} air cargo consignments to deep-sea maritime and heavy rail corridors! Automated customer notifications have been dispatched with revised ETAs.`
                    : 'All active air freight consignments are already safely rerouted to contingency corridors.'
                });
              }}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>⚡ Auto-Reroute All Affected Air Freight</span>
            </button>

            <button
              onClick={() => setFilterStatus(filterStatus === 'REROUTED' ? 'ALL' : 'REROUTED')}
              className={`px-4 py-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                filterStatus === 'REROUTED'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-purple-300 border-slate-700'
              }`}
            >
              <span>View Rerouted ({counts.rerouted})</span>
            </button>
          </div>
        </div>

        {/* 3 Active Disruption Corridors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5 relative z-10">
          {activeDisruptions.map((disruption) => (
            <div
              key={disruption.id}
              className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 hover:border-amber-500/50 transition-all space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wide">
                  {disruption.affectedAirspaceOrCorridor}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {disruption.severity}
                </span>
              </div>
              <h4 className="font-bold text-white text-xs">{disruption.title}</h4>
              <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                {disruption.description}
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="text-cyan-400 font-semibold flex items-center gap-1">
                  <span>Bypass:</span>
                  <span className="text-white font-mono font-normal">
                    {disruption.contingencyMode === 'OCEAN' ? '🚢 Deep-Sea Ocean Line' : disruption.contingencyMode === 'RAIL' ? '🚆 Intermodal Rail' : '🚛 Road Hauler'}
                  </span>
                </div>
                <span className="text-slate-500 text-[10px]">{disruption.reportedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipments Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Recent Consignments</span>
              <span className="text-xs font-normal text-slate-500">
                ({filteredShipments.length} matching)
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any shipment to inspect telemetry, advance milestone stages, or execute hub collection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ID, city, company..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white w-48 sm:w-64"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterStatus === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({counts.total})
              </button>
              <button
                onClick={() => setFilterStatus('IN_TRANSIT')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterStatus === 'IN_TRANSIT'
                    ? 'bg-white text-cyan-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Transit ({counts.inTransit})
              </button>
              <button
                onClick={() => setFilterStatus('AWAITING_PICKUP')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterStatus === 'AWAITING_PICKUP'
                    ? 'bg-white text-amber-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hub Pickup ({counts.awaitingPickup})
              </button>
              <button
                onClick={() => setFilterStatus('LOCATION_UNAVAILABLE')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterStatus === 'LOCATION_UNAVAILABLE'
                    ? 'bg-amber-600 text-white shadow-xs font-semibold'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                ⚠️ Location Unavailable ({shipments.filter((s) => s.isLocationUnavailable).length})
              </button>
              <button
                onClick={() => setFilterStatus('REROUTED')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterStatus === 'REROUTED'
                    ? 'bg-purple-600 text-white shadow-xs font-semibold'
                    : 'text-purple-700 hover:text-purple-900'
                }`}
              >
                ⚡ Rerouted ({counts.rerouted})
              </button>
              <button
                onClick={() => setFilterStatus('DELAYED')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filterStatus === 'DELAYED'
                    ? 'bg-white text-rose-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Delayed ({counts.delayed})
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {shipments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-4">
              <PlusCircle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">No Consignments in System</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Manual data entry mode is active. Click below to register your first shipment and test the sender pickup $\rightarrow$ warehouse approval $\rightarrow$ linehaul transit lifecycle.
            </p>
            <button
              onClick={() => setCurrentView('create')}
              className="mt-4 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Shipment</span>
            </button>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No shipments match your criteria</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try resetting your search or filter options, or create a new shipment to test the workflow.
            </p>
            <button
              onClick={() => {
                setFilterStatus('ALL');
                setSearchTerm('');
              }}
              className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Tracking ID & Category</th>
                  <th className="py-3 px-4">Route Path</th>
                  <th className="py-3 px-4">Delivery Mode</th>
                  <th className="py-3 px-4">Weight & Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Estimated ETA / Handover</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredShipments.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-brand-50/30 transition-colors group"
                  >
                    {/* ID & Category */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTrack(s.id)}
                          className="font-mono font-bold text-brand-700 hover:text-brand-900 hover:underline flex items-center gap-1"
                          title="Track this shipment"
                        >
                          <span>{s.id}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                        {s.category}
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span>{s.route.originCity} ({s.sender.country || 'India'})</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-semibold text-slate-900">{s.route.destinationCity} ({s.receiver.country || 'International'})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        PIN / Port: <span className="font-mono text-slate-700">{s.receiver.pinCode}</span>
                      </div>
                    </td>

                    {/* Delivery Mode */}
                    <td className="py-3.5 px-4">
                      <DeliveryTypeBadge type={s.deliveryType} size="sm" />
                      {s.isLocationUnavailable && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            ⚠️ Location Unavailable (Self-Pickup)
                          </span>
                        </div>
                      )}
                      {s.assignedHub && (
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[150px]">{s.assignedHub.name}</span>
                        </div>
                      )}
                    </td>

                    {/* Weight & Value */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.weightKg} kg</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ₹{s.declaredValueInr.toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Status & Allocated Mode */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <StatusBadge status={s.status} size="sm" />
                        <div>
                          <TransportModeBadge mode={s.transportMode} size="sm" />
                        </div>
                        {s.isRerouted && (
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
                            <Zap className="w-2.5 h-2.5 text-purple-600" />
                            <span>Bypassed Airspace ({s.transportMode})</span>
                          </div>
                        )}
                        {s.transportDetails && (
                          <div className="text-[10px] text-purple-700 font-mono">
                            {s.transportDetails.carrierName} ({s.transportDetails.identifier})
                          </div>
                        )}
                        {s.status === 'READY_FOR_PICKUP' && s.pickupReferenceCode && (
                          <div className="text-[10px] text-amber-800 font-mono font-semibold">
                            Ref: {s.pickupReferenceCode}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ETA */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-700">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="font-medium text-[11px]">
                          {new Date(s.estimatedArrival).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {s.route.currentMilestone}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.transportMode === 'AIR' && !s.isRerouted && (
                          <button
                            onClick={() => {
                              autoRerouteShipment(s.id);
                              setRerouteFeedback({
                                count: 1,
                                message: `⚡ Air consignment ${s.id} rerouted to bypass restricted airspace! Customer notified.`
                              });
                            }}
                            className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-bold text-xs transition-colors flex items-center gap-1 shadow-2xs"
                            title="Airspace Disruption Risk: Reroute to Ocean/Rail contingency corridor"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Reroute</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleTrack(s.id)}
                          className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-md font-semibold text-xs transition-colors"
                          title="Open live tracking map and timeline"
                        >
                          Track
                        </button>

                        {s.deliveryType === 'HUB_PICKUP' && (
                          <button
                            onClick={() => handleWarehouse(s.id)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-md font-medium text-xs transition-colors"
                            title="Open in Warehouse Operations"
                          >
                            Hub
                          </button>
                        )}

                        <button
                          onClick={() => handleDetails(s.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-xs transition-colors"
                          title="Advance stage or edit shipment"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
