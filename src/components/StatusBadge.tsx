import React from 'react';
import type { ShipmentStatus, DeliveryType } from '../types/logistics';
import { 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertTriangle, 
  PackageCheck, 
  Building2, 
  Home, 
  CheckCheck,
  Send
} from 'lucide-react';

interface StatusBadgeProps {
  status: ShipmentStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  showIcon = true, 
  size = 'md' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'BOOKED':
        return {
          label: 'Booked',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Clock,
          pulse: false,
        };
      case 'PICKED_UP':
        return {
          label: 'Picked Up from Sender',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: Send,
          pulse: false,
        };
      case 'ARRIVED_AT_ORIGIN_WAREHOUSE':
        return {
          label: 'At Origin Warehouse',
          bg: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
          icon: Building2,
          pulse: true,
        };
      case 'ORIGIN_WAREHOUSE_APPROVED':
        return {
          label: 'Warehouse Approved',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
          icon: CheckCircle2,
          pulse: false,
        };
      case 'IN_TRANSIT':
        return {
          label: 'In Transit (Linehaul)',
          bg: 'bg-cyan-50 text-cyan-800 border-cyan-300 font-semibold',
          icon: Truck,
          pulse: true,
        };
      case 'ARRIVED_AT_HUB':
        return {
          label: 'Arrived at Hub',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: Building2,
          pulse: false,
        };
      case 'READY_FOR_PICKUP':
        return {
          label: 'Ready for Pickup',
          bg: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
          icon: PackageCheck,
          pulse: true,
        };
      case 'OUT_FOR_DELIVERY':
        return {
          label: 'Out for Delivery',
          bg: 'bg-teal-50 text-teal-800 border-teal-300 font-semibold',
          icon: Truck,
          pulse: true,
        };
      case 'DELIVERED':
        return {
          label: 'Delivered',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
          icon: CheckCircle2,
          pulse: false,
        };
      case 'COLLECTED':
        return {
          label: 'Collected at Hub',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
          icon: CheckCheck,
          pulse: false,
        };
      case 'DELAYED':
        return {
          label: 'Delayed / Advisory',
          bg: 'bg-rose-50 text-rose-800 border-rose-300 font-semibold',
          icon: AlertTriangle,
          pulse: true,
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: Clock,
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs tracking-tight ${config.bg} ${sizeClasses}`}
    >
      {showIcon && (
        <span className="relative flex items-center justify-center">
          {config.pulse && (
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-current opacity-60 animate-ping" />
          )}
          <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        </span>
      )}
      <span>{config.label}</span>
    </span>
  );
};

export const DeliveryTypeBadge: React.FC<{ type: DeliveryType; size?: 'sm' | 'md' }> = ({
  type,
  size = 'md',
}) => {
  const isHome = type === 'HOME_DELIVERY';
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${
        isHome
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-amber-50 text-amber-800 border-amber-200'
      } ${sizeClasses}`}
    >
      {isHome ? (
        <>
          <Home className="w-3.5 h-3.5 text-blue-600" />
          <span>Doorstep Delivery</span>
        </>
      ) : (
        <>
          <Building2 className="w-3.5 h-3.5 text-amber-600" />
          <span>Regional Hub Pickup</span>
        </>
      )}
    </span>
  );
};

export const TransportModeBadge: React.FC<{ mode?: 'AIR' | 'OCEAN' | 'RAIL' | 'ROAD'; size?: 'sm' | 'md' }> = ({
  mode,
  size = 'md',
}) => {
  if (!mode) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
        <span>To be allocated at warehouse</span>
      </span>
    );
  }

  const getConfig = () => {
    switch (mode) {
      case 'AIR':
        return {
          label: 'Air Cargo (Flight)',
          bg: 'bg-sky-50 text-sky-800 border-sky-300',
          emoji: '✈️',
        };
      case 'OCEAN':
        return {
          label: 'Ocean Freight (Ship)',
          bg: 'bg-teal-50 text-teal-800 border-teal-300',
          emoji: '🚢',
        };
      case 'RAIL':
        return {
          label: 'Rail Cargo (Train)',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          emoji: '🚆',
        };
      case 'ROAD':
        return {
          label: 'Road Freight (Hauler)',
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          emoji: '🚛',
        };
    }
  };

  const config = getConfig();
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg border shadow-2xs ${config.bg} ${sizeClasses}`}
    >
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
};

