import React from 'react';
import type { Shipment, ShipmentStatus } from '../types/logistics';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  Building2, 
  PackageCheck, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface ShipmentTimelineProps {
  shipment: Shipment;
}

export const ShipmentTimeline: React.FC<ShipmentTimelineProps> = ({ shipment }) => {
  const isHubPickup = shipment.deliveryType === 'HUB_PICKUP';

  // Compute stage steps
  const getStageProgress = () => {
    const s = shipment.status;
    if (s === 'BOOKED') return 1;
    if (s === 'PICKED_UP') return 2;
    if (s === 'ARRIVED_AT_ORIGIN_WAREHOUSE') return 3;
    if (s === 'ORIGIN_WAREHOUSE_APPROVED') return 4;
    if (s === 'IN_TRANSIT') return 5;
    if (s === 'ARRIVED_AT_HUB') return 6;
    if (s === 'READY_FOR_PICKUP' || s === 'OUT_FOR_DELIVERY') return 7;
    if (s === 'DELIVERED' || s === 'COLLECTED') return 8;
    if (s === 'DELAYED') return 5; // during transit
    return 1;
  };

  const progressStep = getStageProgress();

  const stages = [
    { label: '1. Booked', sub: shipment.route.originCity },
    { label: '2. Picked Up', sub: 'From Sender' },
    { label: '3. At Warehouse', sub: 'Inward Dock' },
    { label: '4. Approved', sub: 'Warehouse Stamp' },
    { label: '5. Linehaul Transit', sub: shipment.route.transitCorridor },
    { label: '6. Destination Hub', sub: shipment.route.destinationHub },
    { 
      label: isHubPickup ? '7. Ready for Pickup' : '7. Out for Delivery', 
      sub: isHubPickup ? 'Vault Staged' : 'Van Dispatched' 
    },
    { 
      label: isHubPickup ? '8. Collected' : '8. Delivered', 
      sub: isHubPickup ? 'Handed to Consignee' : 'Doorstep Handover' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Route Pipeline Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-600" />
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Corridor Route Milestones
            </h4>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {shipment.route.distanceKm} km transit path
          </span>
        </div>

        {/* Desktop Step Bar */}
        <div className="relative hidden md:block pt-2 pb-4">
          <div className="absolute top-5 left-6 right-6 h-1 bg-slate-100 rounded-full">
            <div
              className={`h-1 rounded-full transition-all duration-500 ${
                shipment.status === 'DELAYED' ? 'bg-amber-500' : 'bg-brand-600'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, ((progressStep - 1) / (stages.length - 1)) * 100))}%`,
              }}
            />
          </div>

          <div className="relative flex justify-between">
            {stages.map((stage, idx) => {
              const stepNumber = idx + 1;
              const isPast = stepNumber < progressStep;
              const isCurrent = stepNumber === progressStep;

              return (
                <div key={idx} className="flex flex-col items-center text-center max-w-[110px]">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                      isPast
                        ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                        : isCurrent
                        ? shipment.status === 'DELAYED'
                          ? 'bg-amber-500 border-amber-600 text-white ring-4 ring-amber-100'
                          : 'bg-white border-brand-600 text-brand-600 ring-4 ring-brand-100 animate-pulse-subtle'
                        : 'bg-slate-50 border-slate-300 text-slate-400'
                    }`}
                  >
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent && shipment.status === 'DELAYED' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold leading-tight ${
                      isCurrent
                        ? 'text-brand-900 font-bold'
                        : isPast
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 truncate w-full">
                    {stage.sub}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Route Summary line */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
            <span className="font-semibold text-slate-900">{shipment.route.originCity}</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-900">{shipment.route.destinationCity}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Current Milestone:</span>
            <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {shipment.route.currentMilestone}
            </span>
          </div>
        </div>
      </div>

      {/* Chronological Event Timeline */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-600" />
            <span>Event Activity Log ({shipment.timeline.length} Milestones)</span>
          </h4>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Latest Checkpoints (Reverse Order)
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {[...shipment.timeline].reverse().map((evt, idx) => {
            const isFirst = idx === 0;

            const getEventIcon = (status: ShipmentStatus) => {
              if (status === 'DELIVERED' || status === 'COLLECTED') return CheckCircle2;
              if (status === 'READY_FOR_PICKUP') return PackageCheck;
              if (status === 'ARRIVED_AT_HUB') return Building2;
              if (status === 'DELAYED') return AlertTriangle;
              return Truck;
            };

            const IconComp = getEventIcon(evt.status);

            return (
              <div key={evt.id} className="relative group">
                {/* Node icon */}
                <div
                  className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isFirst
                      ? evt.status === 'DELAYED'
                        ? 'bg-rose-500 text-white ring-4 ring-rose-100'
                        : 'bg-brand-600 text-white ring-4 ring-brand-100'
                      : 'bg-white border-2 border-slate-300 text-slate-500 group-hover:border-brand-500'
                  }`}
                >
                  <IconComp className="w-3 h-3" />
                </div>

                {/* Content card */}
                <div
                  className={`p-3.5 rounded-lg border transition-all ${
                    isFirst
                      ? evt.status === 'DELAYED'
                        ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                        : 'bg-brand-50/40 border-brand-200 shadow-xs'
                      : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                    <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {evt.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">{evt.description}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{evt.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{evt.facility}</span>
                    </span>
                    <span className="text-slate-400 font-mono">
                      Operator: <strong className="text-slate-600 font-normal">{evt.operator}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
