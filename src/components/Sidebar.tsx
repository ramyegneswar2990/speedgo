import React from 'react';
import { useShipments } from '../context/ShipmentContext';
import type { ViewType } from '../context/ShipmentContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Search, 
  Warehouse, 
  FileText, 
  RotateCcw, 
  Truck, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface SidebarProps {
  onOpenPublishGuide?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenPublishGuide }) => {
  const { currentView, setCurrentView, counts, resetDemoData } = useShipments();

  const navItems: { id: ViewType; label: string; icon: React.ElementType; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Fleet Dashboard',
      icon: LayoutDashboard,
      badge: counts.total,
      badgeColor: 'bg-slate-200 text-slate-800',
    },
    {
      id: 'create',
      label: 'Create Shipment',
      icon: PlusCircle,
      badge: 'Booking Engine',
      badgeColor: 'bg-brand-100 text-brand-700',
    },
    {
      id: 'track',
      label: 'Track Shipment',
      icon: Search,
      badge: 'Live Route',
      badgeColor: 'bg-cyan-100 text-cyan-800',
    },
    {
      id: 'warehouse',
      label: 'Warehouse & Pickup Ops',
      icon: Warehouse,
      badge: counts.awaitingPickup > 0 ? `${counts.awaitingPickup} In Hub` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
    },
    {
      id: 'details',
      label: 'Shipment Details & Dispatch',
      icon: FileText,
      badge: 'Advancer',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
  ];

  return (
    <aside className="w-72 bg-cargo-navy text-slate-300 flex flex-col shrink-0 border-r border-slate-800 h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-white shadow-glow-brand shadow-cyan-500/30">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold text-white tracking-tight">Speed Logistics</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PROTOTYPE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Real-Time Cargo Tracking System</p>
          </div>
        </div>

        {/* Operational Status indicator */}
        <div className="mt-4 flex items-center justify-between text-[11px] bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Demo Simulator Active</span>
          </div>
          <span className="text-slate-500 font-mono">5 Corridors</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-900/50'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white font-bold' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Manual Operations Quick Actions */}
        <div className="pt-5 pb-2">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Operations Shortcuts</span>
            <Sparkles className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="space-y-1.5 mt-2 px-1">
            <button
              onClick={() => setCurrentView('create')}
              className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs transition-all group"
            >
              <div className="flex items-center justify-between text-slate-200 font-medium">
                <span>+ Create New Shipment</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
              </div>
              <p className="text-[10px] text-brand-400 mt-0.5">Enter cargo & recipient PIN</p>
            </button>

            <button
              onClick={() => setCurrentView('warehouse')}
              className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs transition-all group"
            >
              <div className="flex items-center justify-between text-slate-200 font-medium">
                <span>Warehouse Inward & Approvals</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
              </div>
              <p className="text-[10px] text-purple-400 mt-0.5">Approve picked-up cargo</p>
            </button>

            <button
              onClick={() => setCurrentView('details')}
              className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs transition-all group"
            >
              <div className="flex items-center justify-between text-slate-200 font-medium">
                <span>Dispatch State Advancer</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
              </div>
              <p className="text-[10px] text-cyan-400 mt-0.5">Advance status step-by-step</p>
            </button>
          </div>
        </div>
      </nav>

      {/* Footer & Clear */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Manual Entry Mode</span>
          </div>
          <p className="text-[10px] leading-tight text-slate-400">
            All shipments and milestone approvals are stored locally in your browser.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={resetDemoData}
            title="Clear all manually entered shipments and start fresh"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-medium transition-colors border border-slate-700 hover:border-rose-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear All Data</span>
          </button>

          {onOpenPublishGuide && (
            <button
              onClick={onOpenPublishGuide}
              title="Publish prototype instructions"
              className="py-2 px-3 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 text-xs font-medium transition-colors border border-cyan-700/50 flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
