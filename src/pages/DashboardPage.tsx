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
  Filter 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { 
    shipments, 
    counts, 
    setCurrentView, 
    setSelectedTrackingId 
  } = useShipments();

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter shipments
  const filteredShipments = shipments.filter((item) => {
    // Status filter
    if (filterStatus === 'IN_TRANSIT' && item.status !== 'IN_TRANSIT') return false;
    if (filterStatus === 'DELIVERED' && item.status !== 'DELIVERED' && item.status !== 'COLLECTED') return false;
    if (filterStatus === 'DELAYED' && item.status !== 'DELAYED' && !item.isDelayed) return false;
    if (filterStatus === 'AWAITING_PICKUP' && item.status !== 'READY_FOR_PICKUP' && item.status !== 'ARRIVED_AT_HUB') return false;
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
